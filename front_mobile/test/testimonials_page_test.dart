import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/pages/testimonials_page.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

http.Response _json(Object corpo, [int status = 200]) =>
    http.Response.bytes(utf8.encode(jsonEncode(corpo)), status);

Map<String, Object> _depoimento(int id, String cachorro) => {
      'id': id,
      'nomeCachorro': cachorro,
      'nomeTutor': 'Maria Silva',
      'raca': 'Golden Retriever',
      'comentario': 'Ótima experiência!',
      'criado_em': '2026-10-10T14:30:00.000Z',
    };

Future<void> _abrir(WidgetTester tester) async {
  GoogleFonts.config.allowRuntimeFetching = false;
  tester.view.physicalSize = const Size(750, 1624);
  tester.view.devicePixelRatio = 2;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(const MaterialApp(home: TestimonialsPage()));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('lista os depoimentos vindos da API', (tester) async {
    final client = MockClient(
      (_) async => _json([_depoimento(2, 'Thor'), _depoimento(1, 'Bolinha')]),
    );

    await http.runWithClient(() => _abrir(tester), () => client);

    expect(find.text('Thor'), findsOneWidget);
    expect(find.text('Bolinha'), findsOneWidget);
  });

  testWidgets('mostra o erro e permite tentar de novo', (tester) async {
    var falhar = true;
    final client = MockClient((_) async {
      if (falhar) throw http.ClientException('sem rede');
      return _json([_depoimento(1, 'Bolinha')]);
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      expect(find.textContaining('Não foi possível conectar'), findsOneWidget);

      falhar = false;
      await tester.tap(find.text('Tentar novamente'));
      await tester.pumpAndSettle();
    }, () => client);

    expect(find.text('Bolinha'), findsOneWidget);
    expect(find.textContaining('Não foi possível conectar'), findsNothing);
  });

  testWidgets('não envia com campos vazios', (tester) async {
    final requisicoes = <http.Request>[];
    final client = MockClient((req) async {
      requisicoes.add(req);
      return _json([]);
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      await tester.tap(find.text('Deixar depoimento'));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Enviar depoimento'));
      await tester.tap(find.text('Enviar depoimento'));
      await tester.pumpAndSettle();
    }, () => client);

    expect(find.text('Preencha este campo'), findsNWidgets(4));
    expect(requisicoes.where((r) => r.method == 'POST'), isEmpty);
  });

  testWidgets('envia o depoimento e recarrega a lista', (tester) async {
    final lista = <Map<String, Object>>[];
    final requisicoes = <http.Request>[];
    final client = MockClient((req) async {
      requisicoes.add(req);
      if (req.method == 'POST') {
        lista.insert(0, _depoimento(1, 'Pipoca'));
        return _json(lista.first, 201);
      }
      return _json(lista);
    });

    await http.runWithClient(() async {
      await _abrir(tester);
      await tester.tap(find.text('Deixar depoimento'));
      await tester.pumpAndSettle();

      final campos = find.byType(TextFormField);
      await tester.enterText(campos.at(0), 'Pipoca');
      await tester.enterText(campos.at(1), 'Poodle');
      await tester.enterText(campos.at(2), 'Ana Souza');
      await tester.enterText(campos.at(3), 'Adorou a creche');
      await tester.ensureVisible(find.text('Enviar depoimento'));
      await tester.tap(find.text('Enviar depoimento'));
      await tester.pumpAndSettle();
    }, () => client);

    final post = requisicoes.singleWhere((r) => r.method == 'POST');
    expect(jsonDecode(post.body), {
      'nomeCachorro': 'Pipoca',
      'nomeTutor': 'Ana Souza',
      'raca': 'Poodle',
      'comentario': 'Adorou a creche',
    });
    expect(find.text('Depoimento enviado com sucesso!'), findsOneWidget);
    expect(find.text('Pipoca'), findsOneWidget);
  });
}
