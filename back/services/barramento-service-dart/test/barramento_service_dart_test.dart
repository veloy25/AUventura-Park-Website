import 'dart:convert';

import 'package:barramento_service_dart/barramento_service_dart.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shelf/shelf.dart';
import 'package:test/test.dart';

const _notificacoes = 'http://notificacoes:3007';

Request _post(String corpo) =>
    Request('POST', Uri.parse('http://barramento/eventos'), body: corpo);

void main() {
  late List<http.Request> enviados;
  late Handler barramento;

  Handler criar(Future<http.Response> Function(http.Request) resposta) {
    return criarBarramento(
      assinantes: {
        'user:created': [_notificacoes],
      },
      cliente: MockClient((req) {
        enviados.add(req);
        return resposta(req);
      }),
      log: (_) {},
    );
  }

  Future<List<dynamic>> historico(
    Handler handler, [
    String consulta = '',
  ]) async {
    final resposta = await handler(
      Request('GET', Uri.parse('http://barramento/eventos$consulta')),
    );
    return jsonDecode(await resposta.readAsString()) as List<dynamic>;
  }

  setUp(() {
    enviados = [];
    barramento = criar((_) async => http.Response('{}', 201));
  });

  test('health informa que o barramento está no ar', () async {
    final resposta = await barramento(
      Request('GET', Uri.parse('http://barramento/health')),
    );

    expect(resposta.statusCode, 200);
    expect(jsonDecode(await resposta.readAsString())['technology'], 'Dart');
  });

  test('corpo vazio devolve 400 e não chama assinantes', () async {
    final resposta = await barramento(_post(''));

    expect(resposta.statusCode, 400);
    expect(enviados, isEmpty);
  });

  test('JSON inválido devolve 400', () async {
    final resposta = await barramento(_post('{quebrado'));

    expect(resposta.statusCode, 400);
  });

  test('evento sem tipo devolve 400', () async {
    final resposta = await barramento(_post(jsonEncode({'dados': {}})));

    expect(resposta.statusCode, 400);
  });

  test('evento válido devolve 201 e é repassado ao assinante', () async {
    final resposta = await barramento(
      _post(
        jsonEncode({
          'tipo': 'user:created',
          'dados': {'id': 1},
        }),
      ),
    );

    expect(resposta.statusCode, 201);
    expect(enviados, hasLength(1));
    expect(enviados.single.url.toString(), '$_notificacoes/eventos');
    expect(jsonDecode(enviados.single.body)['dados'], {'id': 1});
  });

  test('tipo sem assinantes ainda devolve 201', () async {
    final resposta = await barramento(_post(jsonEncode({'tipo': 'outro'})));

    expect(resposta.statusCode, 201);
    expect(jsonDecode(await resposta.readAsString())['assinantes'], 0);
    expect(enviados, isEmpty);
  });

  test('assinante fora do ar não derruba a publicação', () async {
    barramento = criar((_) async => throw http.ClientException('sem conexão'));

    final resposta = await barramento(
      _post(jsonEncode({'tipo': 'user:created'})),
    );

    expect(resposta.statusCode, 201);
  });

  test('evento publicado fica no histórico de GET /eventos', () async {
    await barramento(
      _post(
        jsonEncode({
          'tipo': 'user:created',
          'dados': {'id': 1},
        }),
      ),
    );

    final eventos = await historico(barramento);

    expect(eventos, hasLength(1));
    expect((eventos.single as Map<String, dynamic>)['tipo'], 'user:created');
  });

  test('histórico filtra por tipo', () async {
    await barramento(_post(jsonEncode({'tipo': 'user:created'})));
    await barramento(_post(jsonEncode({'tipo': 'daycare:created'})));

    final eventos = await historico(barramento, '?tipo=daycare:created');

    expect(eventos, hasLength(1));
    expect((eventos.single as Map<String, dynamic>)['tipo'], 'daycare:created');
  });

  test('evento não entregue continua no histórico para recuperação', () async {
    barramento = criar((_) async => throw http.ClientException('sem conexão'));

    await barramento(_post(jsonEncode({'tipo': 'user:created'})));

    expect(await historico(barramento), hasLength(1));
  });

  test('histórico guarda só os 1000 eventos mais recentes', () async {
    for (var i = 0; i < 1001; i++) {
      await barramento(
        _post(
          jsonEncode({
            'tipo': 'outro',
            'dados': {'n': i},
          }),
        ),
      );
    }

    final eventos = await historico(barramento);

    expect(eventos, hasLength(1000));
    expect((eventos.first as Map<String, dynamic>)['dados'], {'n': 1});
  });
}
