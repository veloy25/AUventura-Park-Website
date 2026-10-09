import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_router/shelf_router.dart';
import 'package:uuid/uuid.dart';

const uuid = Uuid();

final String notificacoesServiceUrl =
    Platform.environment['NOTIFICACOES_SERVICE_URL'] ??
        'http://localhost:3007';

final Map<String, List<String>> assinantes = {
  'user:created': [
    notificacoesServiceUrl,
  ],
  'agendamento:created': [
    notificacoesServiceUrl,
  ],
  'daycare:created': [
    notificacoesServiceUrl,
  ],
};

Response jsonResponse(
  Object body, {
  int statusCode = 200,
}) {
  return Response(
    statusCode,
    body: jsonEncode(body),
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  );
}

Future<Response> healthHandler(Request request) async {
  return jsonResponse({
    'status': 'Barramento is running',
    'technology': 'Dart',
  });
}

Future<Response> eventosHandler(Request request) async {
  try {
    final body = await request.readAsString();

    if (body.isEmpty) {
      return jsonResponse(
        {
          'error': 'Corpo da requisição vazio.',
        },
        statusCode: 400,
      );
    }

    final dynamic decoded = jsonDecode(body);

    if (decoded is! Map<String, dynamic>) {
      return jsonResponse(
        {
          'error': 'Evento inválido.',
        },
        statusCode: 400,
      );
    }

    final tipo = decoded['tipo']?.toString();

    if (tipo == null || tipo.isEmpty) {
      return jsonResponse(
        {
          'error': 'O campo "tipo" é obrigatório.',
        },
        statusCode: 400,
      );
    }

    final evento = <String, dynamic>{
      'id': decoded['id'] ?? uuid.v4(),
      'tipo': tipo,
      'origem': decoded['origem'] ?? 'desconhecida',
      'ocorridoEm': decoded['ocorridoEm'] ??
          DateTime.now().toUtc().toIso8601String(),
      'dados': decoded['dados'] ?? {},
    };

    print(
      '[Barramento Dart] Evento recebido: '
      '${evento['tipo']} ${evento['dados']}',
    );

    final destinos = assinantes[tipo] ?? [];

    for (final url in destinos) {
      try {
        final response = await http.post(
          Uri.parse('$url/eventos'),
          headers: {
            'content-type': 'application/json',
          },
          body: jsonEncode(evento),
        );

        print(
          '[Barramento Dart] '
          '$tipo enviado para $url '
          '- status ${response.statusCode}',
        );
      } catch (error) {
        print(
          '[Barramento Dart] '
          'Erro ao repassar $tipo para $url: $error',
        );
      }
    }

    return jsonResponse(
      {
        'message': 'Evento publicado.',
        'evento': evento,
        'assinantes': destinos.length,
      },
      statusCode: 201,
    );
  } on FormatException {
    return jsonResponse(
      {
        'error': 'JSON inválido.',
      },
      statusCode: 400,
    );
  } catch (error) {
    print(
      '[Barramento Dart] Erro ao processar evento: $error',
    );

    return jsonResponse(
      {
        'error': 'Erro interno ao processar evento.',
      },
      statusCode: 500,
    );
  }
}

Future<void> main() async {
  final router = Router();

  router.get('/health', healthHandler);
  router.post('/eventos', eventosHandler);

  final handler = Pipeline()
      .addMiddleware(logRequests())
      .addHandler(router.call);

  final port = int.tryParse(
        Platform.environment['BARRAMENTO_PORT'] ?? '10000',
      ) ??
      10000;

  final server = await shelf_io.serve(
    handler,
    InternetAddress.anyIPv4,
    port,
  );

  print(
    '[Barramento Dart] listening on port ${server.port}',
  );

  print(
    '[Barramento Dart] Notificações: '
    '$notificacoesServiceUrl',
  );
}