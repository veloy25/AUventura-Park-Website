import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/pages/contact_page.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

http.Response _json(Object corpo, [int status = 200]) =>
    http.Response.bytes(utf8.encode(jsonEncode(corpo)), status);

Future<void> _abrir(WidgetTester tester) async {
  GoogleFonts.config.allowRuntimeFetching = false;
  tester.view.physicalSize = const Size(750, 1624);
  tester.view.devicePixelRatio = 2;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(const MaterialApp(home: ContactPage()));
  await tester.pumpAndSettle();
}

Future<void> _preencher(WidgetTester tester, {String email = 'ana@email.com'}) async {
  final campos = find.byType(TextFormField);
  await tester.enterText(campos.at(0), 'Ana Souza');
  await tester.enterText(campos.at(1), email);
  await tester.enterText(campos.at(2), '(11) 91234-5678');
  await tester.enterText(campos.at(3), 'Dúvida sobre daycare');
  await tester.enterText(campos.at(4), 'Quais são os horários?');
}

Future<void> _enviar(WidgetTester tester) async {
  await tester.ensureVisible(find.text('Enviar mensagem'));
  await tester.tap(find.text('Enviar mensagem'));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('envia o contato e mostra o aviso de sucesso', (tester) async {
    final requisicoes = <http.Request>[];
    final client = MockClient((req) async {
      requisicoes.add(req);
      return _json({'id': 1}, 201);
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      await _preencher(tester);
      await _enviar(tester);
    }, () => client);

    expect(requisicoes.single.url.path, '/api/contatos');
    expect(jsonDecode(requisicoes.single.body), {
      'nome': 'Ana Souza',
      'email': 'ana@email.com',
      'telefone': '(11) 91234-5678',
      'assunto': 'Dúvida sobre daycare',
      'mensagem': 'Quais são os horários?',
    });
    expect(find.textContaining('Mensagem enviada com sucesso'), findsOneWidget);
    expect(find.text('Ana Souza'), findsNothing, reason: 'formulário deve limpar');
  });

  testWidgets('não envia com campos obrigatórios vazios', (tester) async {
    final requisicoes = <http.Request>[];
    final client = MockClient((req) async {
      requisicoes.add(req);
      return _json({});
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      await _enviar(tester);
    }, () => client);

    expect(find.text('Preencha este campo'), findsNWidgets(4));
    expect(requisicoes, isEmpty);
  });

  testWidgets('recusa e-mail inválido', (tester) async {
    final requisicoes = <http.Request>[];
    final client = MockClient((req) async {
      requisicoes.add(req);
      return _json({});
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      await _preencher(tester, email: 'sem-arroba');
      await _enviar(tester);
    }, () => client);

    expect(find.text('E-mail inválido'), findsOneWidget);
    expect(requisicoes, isEmpty);
  });

  testWidgets('mostra o erro da API e mantém o que foi digitado', (tester) async {
    final client = MockClient(
      (_) async => _json({'error': 'Nome, e-mail, assunto e mensagem sao obrigatorios.'}, 400),
    );

    await http.runWithClient(() async {
      await _abrir(tester);
      await _preencher(tester);
      await _enviar(tester);
    }, () => client);

    expect(find.textContaining('sao obrigatorios'), findsOneWidget);
    expect(find.text('Ana Souza'), findsOneWidget);
    expect(find.textContaining('Mensagem enviada com sucesso'), findsNothing);
  });
}
