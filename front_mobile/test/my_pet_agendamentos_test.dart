import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/models/usuario.dart';
import 'package:front_mobile/pages/my_pet_page.dart';
import 'package:front_mobile/pages/pet_detalhe_page.dart';
import 'package:front_mobile/models/pet.dart';
import 'package:front_mobile/services/sessao.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _usuario = Usuario(id: 1, nome: 'Ana', email: 'ana@email.com');

// Datas bem longe de hoje para o teste não depender do relógio.
const _futuro = '2099-03-10';
const _passado = '2020-05-02';

Map<String, Object?> _agendamento(
  int id,
  String pet,
  String data,
  String horario,
) => {
  'id': id,
  'user_id': 1,
  'nomeCachorro': pet,
  'servico': 'banho',
  'data': data,
  'horario': horario,
  'observacoes': '',
};

const _thor = Pet(
  id: 7,
  userId: 1,
  nome: 'Thor',
  idade: 3,
  peso: 12.5,
  raca: 'Beagle',
);

MockClient _back({
  List<Map<String, Object?>>? agendamentos,
  bool agendamentosFora = false,
}) {
  http.Response json(Object corpo) =>
      http.Response.bytes(utf8.encode(jsonEncode(corpo)), 200);

  return MockClient((req) async {
    switch (req.url.path) {
      case '/api/pets':
        return json([
          {
            'id': 7,
            'user_id': 1,
            'nome': 'Thor',
            'idade': 3,
            'peso': 12.5,
            'raca': 'Beagle',
            'vacinas': ['antirrabica'],
          },
          {
            'id': 8,
            'user_id': 1,
            'nome': 'Mel',
            'idade': 4,
            'peso': 9.0,
            'raca': 'Poodle',
          },
        ]);
      case '/api/agendamentos':
        if (agendamentosFora) {
          return http.Response('{"error":"fora do ar"}', 500);
        }
        return json(
          agendamentos ??
              [
                _agendamento(1, 'Thor', _futuro, '09:00'),
                _agendamento(2, 'Thor', _passado, '14:30'),
                _agendamento(3, 'Mel', _futuro, '11:00'),
              ],
        );
    }
    throw http.ClientException('rota inesperada: ${req.url.path}');
  });
}

Future<void> _abrir(WidgetTester tester, Widget tela, MockClient back) async {
  GoogleFonts.config.allowRuntimeFetching = false;
  tester.view.physicalSize = const Size(750, 1800);
  tester.view.devicePixelRatio = 2;
  addTearDown(tester.view.reset);

  await http.runWithClient(() async {
    await tester.pumpWidget(MaterialApp(home: tela));
    await tester.pumpAndSettle();
  }, () => back);
}

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await sessao.sair();
    await sessao.entrar('tok', _usuario);
  });

  group('My Pet', () {
    testWidgets('cada card resume o próximo agendamento do próprio pet', (
      tester,
    ) async {
      await _abrir(tester, const MyPetPage(), _back());

      expect(find.textContaining('Próximo: Banho'), findsNWidgets(2));
      expect(
        find.textContaining('10/03/2099 às 09:00'),
        findsOneWidget,
        reason: 'Thor',
      );
      expect(
        find.textContaining('10/03/2099 às 11:00'),
        findsOneWidget,
        reason: 'Mel',
      );
    });

    testWidgets('pet sem agendamento futuro avisa isso no card', (
      tester,
    ) async {
      await _abrir(
        tester,
        const MyPetPage(),
        _back(agendamentos: [_agendamento(1, 'Thor', _passado, '09:00')]),
      );

      expect(find.text('Sem agendamentos futuros'), findsNWidgets(2));
    });

    testWidgets('falha nos agendamentos não esconde os pets', (tester) async {
      await _abrir(tester, const MyPetPage(), _back(agendamentosFora: true));

      expect(find.text('Thor'), findsOneWidget);
      expect(find.text('Mel'), findsOneWidget);
      expect(find.textContaining('Próximo:'), findsNothing);
    });

    testWidgets('tocar no card abre o detalhe do pet', (tester) async {
      await _abrir(tester, const MyPetPage(), _back());

      await http.runWithClient(() async {
        await tester.tap(find.text('Thor'));
        await tester.pumpAndSettle();
      }, () => _back());

      expect(find.byType(PetDetalhePage), findsOneWidget);
    });
  });

  group('Detalhe do pet', () {
    testWidgets('separa próximos e histórico e só mostra o pet aberto', (
      tester,
    ) async {
      await _abrir(tester, const PetDetalhePage(pet: _thor), _back());

      expect(find.text('Próximos agendamentos'), findsOneWidget);
      expect(find.text('Histórico'), findsOneWidget);
      expect(
        find.text('10/03/2099'),
        findsOneWidget,
        reason: 'próximo do Thor',
      );
      expect(
        find.text('02/05/2020'),
        findsOneWidget,
        reason: 'histórico do Thor',
      );
      expect(
        find.text('Mel'),
        findsNothing,
        reason: 'agendamento de outro pet',
      );
    });

    testWidgets('não oferece edição do pet', (tester) async {
      await _abrir(tester, const PetDetalhePage(pet: _thor), _back());

      expect(find.byIcon(Icons.edit), findsNothing);
      expect(find.byIcon(Icons.edit_outlined), findsNothing);
      expect(find.textContaining('Editar'), findsNothing);
    });

    testWidgets('sem agendamentos mostra os dois estados vazios', (
      tester,
    ) async {
      await _abrir(
        tester,
        const PetDetalhePage(pet: _thor),
        _back(agendamentos: []),
      );

      expect(find.text('Nenhum agendamento futuro.'), findsOneWidget);
      expect(
        find.text('Ainda não há atendimentos anteriores.'),
        findsOneWidget,
      );
    });

    testWidgets('erro do back aparece em vez de listas vazias enganosas', (
      tester,
    ) async {
      await _abrir(
        tester,
        const PetDetalhePage(pet: _thor),
        _back(agendamentosFora: true),
      );

      expect(find.text('fora do ar'), findsOneWidget);
      expect(find.text('Nenhum agendamento futuro.'), findsNothing);
    });

    testWidgets('mostra o nome legível das vacinas', (tester) async {
      await _abrir(
        tester,
        const PetDetalhePage(
          pet: Pet(
            id: 7,
            userId: 1,
            nome: 'Thor',
            idade: 3,
            peso: 12.5,
            raca: 'Beagle',
            vacinas: ['antirrabica'],
          ),
        ),
        _back(),
      );

      expect(find.text('✓ Antirrábica'), findsOneWidget);
    });
  });
}
