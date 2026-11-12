import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';
import 'package:uuid/uuid.dart';

const _uuid = Uuid();

// Sem timeout, um assinante travado seguraria a resposta de quem publicou.
const _timeoutAssinante = Duration(seconds: 5);

// shortcut: histórico só em memória e limitado, some ao reiniciar o barramento;
// trocar por tabela no MySQL se for preciso recuperar eventos após reinício.
const _maxEventosGuardados = 1000;

Response _json(Object corpo, {int status = 200}) {
  return Response(
    status,
    body: jsonEncode(corpo),
    headers: {'content-type': 'application/json; charset=utf-8'},
  );
}

// Cliente HTTP, assinantes e log entram por parâmetro para os testes trocarem
// a rede por um MockClient e capturarem o que seria escrito no terminal.
Handler criarBarramento({
  required Map<String, List<String>> assinantes,
  required http.Client cliente,
  void Function(String)? log,
}) {
  final registrar = log ?? stdout.writeln;
  final historico = <Map<String, dynamic>>[];
  final router = Router();

  router.get('/health', (Request request) {
    return _json({'status': 'Barramento is running', 'technology': 'Dart'});
  });

  // Serviço que ficou fora do ar pede aqui o que perdeu. O filtro por tipo
  // evita baixar eventos que ele nem assina.
  router.get('/eventos', (Request request) {
    final tipo = request.url.queryParameters['tipo'];
    final eventos = tipo == null
        ? historico
        : historico.where((evento) => evento['tipo'] == tipo).toList();
    return _json(eventos);
  });

  router.post('/eventos', (Request request) async {
    final Object? corpo;
    try {
      final texto = await request.readAsString();
      if (texto.isEmpty) {
        return _json({'error': 'Corpo da requisição vazio.'}, status: 400);
      }
      corpo = jsonDecode(texto);
    } on FormatException {
      return _json({'error': 'JSON inválido.'}, status: 400);
    }

    if (corpo is! Map<String, dynamic>) {
      return _json({'error': 'Evento inválido.'}, status: 400);
    }

    final tipo = corpo['tipo']?.toString();
    if (tipo == null || tipo.isEmpty) {
      return _json({'error': 'O campo "tipo" é obrigatório.'}, status: 400);
    }

    final evento = <String, dynamic>{
      'id': corpo['id'] ?? _uuid.v4(),
      'tipo': tipo,
      'origem': corpo['origem'] ?? 'desconhecida',
      'ocorridoEm':
          corpo['ocorridoEm'] ?? DateTime.now().toUtc().toIso8601String(),
      'dados': corpo['dados'] ?? {},
    };

    // Guarda antes de entregar: se a entrega falhar, o evento continua no
    // histórico para o assinante recuperar depois.
    historico.add(evento);
    if (historico.length > _maxEventosGuardados) historico.removeAt(0);

    registrar('[Barramento Dart] Evento recebido: $tipo ${evento['dados']}');

    final destinos = assinantes[tipo] ?? [];
    for (final url in destinos) {
      // Falha de um assinante é registrada e não impede os demais nem a
      // resposta ao publicador.
      try {
        final resposta = await cliente
            .post(
              Uri.parse('$url/eventos'),
              headers: {'content-type': 'application/json'},
              body: jsonEncode(evento),
            )
            .timeout(_timeoutAssinante);
        registrar('[Barramento Dart] $tipo -> $url: ${resposta.statusCode}');
      } catch (erro) {
        registrar('[Barramento Dart] Erro ao repassar $tipo para $url: $erro');
      }
    }

    return _json({
      'message': 'Evento publicado.',
      'evento': evento,
      'assinantes': destinos.length,
    }, status: 201);
  });

  return router.call;
}
