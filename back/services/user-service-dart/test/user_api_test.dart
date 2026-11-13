import 'dart:convert';

import 'package:shelf/shelf.dart';
import 'package:test/test.dart';
import 'package:user_service_dart/src/api.dart';
import 'package:user_service_dart/src/models/user.dart';
import 'package:user_service_dart/src/repositories/user_repository.dart';

import 'repositorio_em_memoria.dart';

class _RepositorioQuebrado implements UserRepository {
  @override
  Future<User?> buscarPorId(int id) async =>
      throw StateError('tabela users sumiu');

  @override
  Future<User?> buscarPorEmail(String email) async =>
      throw StateError('tabela users sumiu');

  @override
  Future<User> inserir(User user) async =>
      throw StateError('tabela users sumiu');
}

Handler _criar({
  UserRepository? repositorio,
  Future<void> Function()? verificarBanco,
  bool detalharFalhas = false,
}) {
  return criarApi(
    repositorio: repositorio ?? RepositorioEmMemoria(),
    verificarBanco: verificarBanco ?? () async {},
    jwtSecret: 'segredo-de-teste',
    validadeToken: const Duration(hours: 2),
    publicar: (_, _) async {},
    detalharFalhas: detalharFalhas,
  );
}

Request _requisicao(
  String metodo,
  String rota, {
  Object? corpo,
  Map<String, String>? cabecalhos,
}) {
  return Request(
    metodo,
    Uri.parse('http://user-service$rota'),
    body: corpo is String ? corpo : (corpo == null ? null : jsonEncode(corpo)),
    headers: cabecalhos,
  );
}

Future<Map<String, dynamic>> _json(Response resposta) async {
  return jsonDecode(await resposta.readAsString()) as Map<String, dynamic>;
}

void main() {
  const ana = {'nome': 'Ana', 'email': 'ana@email.com', 'senha': 'auventura'};

  group('POST /signup', () {
    test('cria a conta e devolve só id, nome e e-mail', () async {
      final resposta = await _criar()(
        _requisicao('POST', '/signup', corpo: ana),
      );

      expect(resposta.statusCode, 201);
      expect(await _json(resposta), {
        'id': 1,
        'nome': 'Ana',
        'email': 'ana@email.com',
      });
    });

    test('e-mail repetido devolve 409 em problem+json, com "error" para os clientes', () async {
      final api = _criar();
      await api(_requisicao('POST', '/signup', corpo: ana));

      final resposta = await api(_requisicao('POST', '/signup', corpo: ana));
      final corpo = await _json(resposta);

      expect(resposta.statusCode, 409);
      expect(
        resposta.headers['content-type'],
        startsWith('application/problem+json'),
      );
      expect(corpo['detail'], 'Este e-mail ja esta em uso.');
      expect(corpo['error'], corpo['detail']);
    });

    test('campos ausentes devolvem 422 com o mapa de erros', () async {
      final resposta = await _criar()(
        _requisicao('POST', '/signup', corpo: {'nome': 'Ana'}),
      );
      final corpo = await _json(resposta);

      expect(resposta.statusCode, 422);
      expect((corpo['errors'] as Map<String, dynamic>).keys, [
        'email',
        'senha',
      ]);
    });

    test(
      'corpo vazio, JSON quebrado e JSON que não é objeto devolvem 400',
      () async {
        final api = _criar();

        for (final corpo in ['', '{quebrado', '[1, 2]']) {
          final resposta = await api(
            _requisicao('POST', '/signup', corpo: corpo),
          );
          expect(resposta.statusCode, 400, reason: 'corpo: "$corpo"');
        }
      },
    );
  });

  group('POST /login e GET /me', () {
    late Handler api;

    setUp(() async {
      api = _criar();
      await api(_requisicao('POST', '/signup', corpo: ana));
    });

    test('login devolve token e usuário, e o token abre o /me', () async {
      final login = await api(
        _requisicao(
          'POST',
          '/login',
          corpo: {'email': 'ana@email.com', 'senha': 'auventura'},
        ),
      );
      final corpoLogin = await _json(login);

      expect(login.statusCode, 200);
      expect(corpoLogin['user'], {
        'id': 1,
        'nome': 'Ana',
        'email': 'ana@email.com',
      });

      final me = await api(
        _requisicao(
          'GET',
          '/me',
          cabecalhos: {'authorization': 'Bearer ${corpoLogin['token']}'},
        ),
      );

      expect(me.statusCode, 200);
      expect(await _json(me), {
        'user': {'id': 1, 'nome': 'Ana', 'email': 'ana@email.com'},
      });
    });

    test('senha errada devolve 401', () async {
      final resposta = await api(
        _requisicao(
          'POST',
          '/login',
          corpo: {'email': 'ana@email.com', 'senha': 'errada'},
        ),
      );

      expect(resposta.statusCode, 401);
    });

    test('/me sem token ou com token inválido devolve 401', () async {
      final semToken = await api(_requisicao('GET', '/me'));
      final lixo = await api(
        _requisicao('GET', '/me', cabecalhos: {'authorization': 'Bearer lixo'}),
      );

      expect(semToken.statusCode, 401);
      expect(lixo.statusCode, 401);
    });
  });

  group('saúde', () {
    test('/health/live responde 200', () async {
      final resposta = await _criar()(_requisicao('GET', '/health/live'));

      expect(resposta.statusCode, 200);
    });

    test('/health/ready responde 200 com banco e 503 sem banco', () async {
      final comBanco = await _criar()(_requisicao('GET', '/health/ready'));
      final semBanco = await _criar(
        verificarBanco: () async => throw StateError('sem conexão'),
      )(_requisicao('GET', '/health/ready'));

      expect(comBanco.statusCode, 200);
      expect(semBanco.statusCode, 503);
    });
  });

  group('erros', () {
    test('rota desconhecida devolve 404 em problem+json', () async {
      final resposta = await _criar()(_requisicao('GET', '/nao-existe'));

      expect(resposta.statusCode, 404);
      expect(
        resposta.headers['content-type'],
        startsWith('application/problem+json'),
      );
    });

    test(
      'falha inesperada devolve 500 sem vazar o motivo em produção',
      () async {
        final resposta = await _criar(repositorio: _RepositorioQuebrado())(
          _requisicao('POST', '/signup', corpo: ana),
        );
        final corpo = await resposta.readAsString();

        expect(resposta.statusCode, 500);
        expect(corpo, isNot(contains('tabela users sumiu')));
      },
    );

    test('em desenvolvimento a falha inesperada mostra o motivo', () async {
      final resposta = await _criar(
        repositorio: _RepositorioQuebrado(),
        detalharFalhas: true,
      )(_requisicao('POST', '/signup', corpo: ana));

      expect(await resposta.readAsString(), contains('tabela users sumiu'));
    });
  });
}
