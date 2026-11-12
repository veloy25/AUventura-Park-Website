import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/config/conta_teste.dart';
import 'package:front_mobile/pages/login_page.dart';
import 'package:front_mobile/services/sessao.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

http.Response _json(Object corpo, [int status = 200]) =>
    http.Response.bytes(utf8.encode(jsonEncode(corpo)), status);

// Abre a tela de login por cima de outra, como o app faz pelo bonequinho.
Future<void> _abrir(WidgetTester tester) async {
  GoogleFonts.config.allowRuntimeFetching = false;
  tester.view.physicalSize = const Size(750, 1624);
  tester.view.devicePixelRatio = 2;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(MaterialApp(
    home: Builder(
      builder: (context) => Scaffold(
        body: TextButton(
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const LoginPage()),
          ),
          child: const Text('abrir'),
        ),
      ),
    ),
  ));
  await tester.tap(find.text('abrir'));
  await tester.pumpAndSettle();
}

Future<void> _tocar(WidgetTester tester, String texto) async {
  await tester.ensureVisible(find.text(texto));
  await tester.tap(find.text(texto));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await sessao.sair();
  });

  testWidgets('em debug vem preenchido com a conta de teste', (tester) async {
    await _abrir(tester);

    expect(find.text(ContaTeste.email), findsOneWidget);
  });

  testWidgets('entra, salva a sessão e fecha a tela', (tester) async {
    final requisicoes = <http.Request>[];
    final client = MockClient((req) async {
      requisicoes.add(req);
      return _json({
        'token': 'tok123',
        'user': {'id': 7, 'nome': 'Matheus', 'email': ContaTeste.email},
      });
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      await _tocar(tester, 'Entrar');
    }, () => client);

    expect(requisicoes.single.url.path, '/api/login');
    expect(jsonDecode(requisicoes.single.body), {
      'email': ContaTeste.email,
      'senha': ContaTeste.senha,
    });
    expect(sessao.logado, isTrue);
    expect(sessao.usuario!.nome, 'Matheus');
    expect(find.byType(LoginPage), findsNothing);
    expect(find.text('abrir'), findsOneWidget);
  });

  testWidgets('senha errada mostra o erro do back e continua na tela', (tester) async {
    final client = MockClient(
      (_) async => _json({'error': 'E-mail ou senha invalidos.'}, 401),
    );

    await http.runWithClient(() async {
      await _abrir(tester);
      await _tocar(tester, 'Entrar');
    }, () => client);

    expect(find.text('E-mail ou senha invalidos.'), findsOneWidget);
    expect(find.byType(LoginPage), findsOneWidget);
    expect(sessao.logado, isFalse);
  });

  testWidgets('cadastro volta para o login com aviso de sucesso', (tester) async {
    final requisicoes = <http.Request>[];
    final client = MockClient((req) async {
      requisicoes.add(req);
      return _json({'id': 7, 'nome': ContaTeste.nome, 'email': ContaTeste.email}, 201);
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      await _tocar(tester, 'Criar cadastro');
      expect(find.text('Crie sua conta'), findsOneWidget);
      await _tocar(tester, 'Criar conta');
    }, () => client);

    expect(requisicoes.single.url.path, '/api/signup');
    expect(jsonDecode(requisicoes.single.body)['nome'], ContaTeste.nome);
    expect(find.textContaining('Conta criada com sucesso'), findsOneWidget);
    expect(find.text('Entre na sua conta'), findsOneWidget);
    expect(sessao.logado, isFalse, reason: 'cadastro não faz login sozinho');
  });

  testWidgets('não envia com campos vazios', (tester) async {
    final requisicoes = <http.Request>[];
    final client = MockClient((req) async {
      requisicoes.add(req);
      return _json({});
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      for (final campo in find.byType(TextFormField).evaluate().toList()) {
        await tester.enterText(find.byWidget(campo.widget), '');
      }
      await _tocar(tester, 'Entrar');
    }, () => client);

    expect(find.text('Preencha este campo'), findsNWidgets(2));
    expect(requisicoes, isEmpty);
  });
}
