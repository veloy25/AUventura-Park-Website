import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/models/usuario.dart';
import 'package:front_mobile/services/sessao.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _usuario = Usuario(id: 1, nome: 'Ana', email: 'ana@email.com');

http.Response _json(Object corpo, [int status = 200]) =>
    http.Response.bytes(utf8.encode(jsonEncode(corpo)), status);

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await sessao.sair();
  });

  test('entrar salva o login e carregar restaura sem ir à rede', () async {
    await sessao.entrar('tok123', _usuario);

    final nova = Sessao();
    await nova.carregar();

    expect(nova.logado, isTrue);
    expect(nova.token, 'tok123');
    expect(nova.usuario!.nome, 'Ana');
  });

  test('validar desloga quando o back recusa o token', () async {
    await sessao.entrar('expirado', _usuario);
    final client = MockClient((_) async => _json({'error': 'Token invalido'}, 401));

    await http.runWithClient(sessao.validar, () => client);

    expect(sessao.logado, isFalse);
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('authToken'), isNull);
  });

  test('validar mantém o login quando não há rede', () async {
    await sessao.entrar('tok123', _usuario);
    final client = MockClient((_) async => throw http.ClientException('sem rede'));

    await http.runWithClient(sessao.validar, () => client);

    expect(sessao.logado, isTrue);
  });

  test('validar atualiza o usuário com o que o back devolve', () async {
    await sessao.entrar('tok123', _usuario);
    final client = MockClient((req) async {
      expect(req.headers['Authorization'], 'Bearer tok123');
      return _json({'user': {'id': 1, 'nome': 'Ana Souza', 'email': 'ana@email.com'}});
    });

    await http.runWithClient(sessao.validar, () => client);

    expect(sessao.usuario!.nome, 'Ana Souza');
  });

  test('carregar descarta login salvo corrompido', () async {
    SharedPreferences.setMockInitialValues({'authToken': 'x', 'authUser': '{quebrado'});

    final nova = Sessao();
    await nova.carregar();

    expect(nova.logado, isFalse);
  });
}
