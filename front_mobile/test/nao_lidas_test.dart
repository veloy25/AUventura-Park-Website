import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/components/header_auventura.dart';
import 'package:front_mobile/models/usuario.dart';
import 'package:front_mobile/services/notificacoes_service.dart';
import 'package:front_mobile/services/sessao.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _usuario = Usuario(id: 1, nome: 'Ana', email: 'ana@email.com');

http.Response _lista(int quantidade) => http.Response.bytes(
  utf8.encode(jsonEncode(List.generate(quantidade, (i) => {'id': i}))),
  200,
);

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await sessao.sair();
    naoLidas.value = 0;
  });

  test('o contador vem da quantidade de notificações não lidas', () async {
    await sessao.entrar('tok', _usuario);
    final client = MockClient((req) async {
      expect(req.url.path, '/api/notificacoes/nao-lidas');
      expect(req.headers['Authorization'], 'Bearer tok');
      return _lista(2);
    });

    await http.runWithClient(atualizarNaoLidas, () => client);

    expect(naoLidas.value, 2);
  });

  test('deslogado, o contador volta a zero sem chamar o back', () async {
    naoLidas.value = 5;
    final client = MockClient((_) async => fail('não devia chamar o back'));

    await http.runWithClient(atualizarNaoLidas, () => client);

    expect(naoLidas.value, 0);
  });

  test('se a consulta falhar, o contador mantém o último valor', () async {
    await sessao.entrar('tok', _usuario);
    naoLidas.value = 3;
    final client = MockClient((_) async => throw http.ClientException('sem rede'));

    await http.runWithClient(atualizarNaoLidas, () => client);

    expect(naoLidas.value, 3);
  });

  testWidgets('o sino mostra o selo só quando há não lidas', (tester) async {
    GoogleFonts.config.allowRuntimeFetching = false;
    tester.view.physicalSize = const Size(750, 1624);
    tester.view.devicePixelRatio = 2;
    addTearDown(tester.view.reset);
    await sessao.entrar('tok', _usuario);

    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(appBar: HeaderAuventura())),
    );
    expect(find.text('3'), findsNothing);

    naoLidas.value = 3;
    await tester.pump();
    expect(find.text('3'), findsOneWidget);

    naoLidas.value = 0;
    await tester.pump();
    expect(find.text('3'), findsNothing);
  });
}
