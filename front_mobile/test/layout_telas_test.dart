import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/models/pet.dart';
import 'package:front_mobile/models/servico_info.dart';
import 'package:front_mobile/models/usuario.dart';
import 'package:front_mobile/pages/booking_page.dart';
import 'package:front_mobile/pages/contact_page.dart';
import 'package:front_mobile/pages/daycare_page.dart';
import 'package:front_mobile/pages/home_page.dart';
import 'package:front_mobile/pages/login_page.dart';
import 'package:front_mobile/pages/my_pet_page.dart';
import 'package:front_mobile/pages/notificacoes_page.dart';
import 'package:front_mobile/pages/pet_detalhe_page.dart';
import 'package:front_mobile/pages/service_details_page.dart';
import 'package:front_mobile/pages/services_page.dart';
import 'package:front_mobile/pages/testimonials_page.dart';
import 'package:front_mobile/services/sessao.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Celulares pequenos (320 px) são onde o texto estoura primeiro. O Flutter
// transforma o estouro de layout em erro de teste.
const _largura = 320.0;
const _altura = 640.0;

http.Response _json(Object corpo) =>
    http.Response.bytes(utf8.encode(jsonEncode(corpo)), 200);

final _back = MockClient((req) async {
  switch (req.url.path) {
    case '/api/depoimentos':
      return _json([
        {
          'id': 1,
          'nomeCachorro': 'Thor de Sobrenome Muito Comprido',
          'nomeTutor': 'Maria Aparecida dos Santos Oliveira',
          'raca': 'Cavalier King Charles Spaniel',
          'comentario': 'Ótima experiência, recomendo muito para todos!',
          'criado_em': '2026-10-10T14:30:00.000Z',
        },
      ]);
    case '/api/pets':
      return _json([
        {
          'id': 7,
          'user_id': 1,
          'nome': 'Thor de Sobrenome Muito Comprido',
          'idade': 3,
          'peso': 12.5,
          'raca': 'Cavalier King Charles Spaniel',
          'vacinas': ['antirrabica', 'polivalente', 'traqueobronquite'],
        },
      ]);
    case '/api/agendamentos':
      return _json([
        {
          'id': 1,
          'user_id': 1,
          'nomeCachorro': 'Thor de Sobrenome Muito Comprido',
          'servico': 'banho_tosa',
          'data': '2099-03-10',
          'horario': '09:00',
          'observacoes': 'Pelo longo, usar condicionador e secar com cuidado.',
        },
        {
          'id': 2,
          'user_id': 1,
          'nomeCachorro': 'Thor de Sobrenome Muito Comprido',
          'servico': 'tosa',
          'data': '2020-05-02',
          'horario': '14:30',
        },
      ]);
    case '/api/notificacoes':
      return _json([
        {
          'id': 1,
          'titulo': 'Agendamento confirmado!',
          'mensagem': 'Seu agendamento de Banho e Tosa para Thor no dia 10/03/2099 às 09:00 foi confirmado.',
          'tipo': 'agendamento',
          'lida': 0,
          'criado_em': '2026-11-12T19:35:41.000Z',
        },
      ]);
    case '/api/notificacoes/nao-lidas':
      return _json([]);
    case '/api/agendamentos/horarios-ocupados':
      return _json(['09:00']);
    case '/api/daycare/vagas':
      return _json({'ocupados': 3, 'maximo': 10, 'disponivel': true});
  }
  throw http.ClientException('rota inesperada: ${req.url.path}');
});

final _banho = servicosDisponiveis.firstWhere((s) => s.id == 'banho');

const _telas = <(String, Widget Function())>[
  ('Home', _home),
  ('Serviços', _servicos),
  ('Depoimentos', _depoimentos),
  ('Contato', _contato),
  ('Login', _login),
  ('My Pet', _meuPet),
  ('Detalhe do pet', _detalhePet),
  ('Notificações', _notificacoes),
  ('Detalhe do serviço', _detalheServico),
  ('Agendamento', _agendamento),
  ('Daycare', _daycareTela),
];

Widget _home() => const HomePage();
Widget _servicos() => const ServicesPage();
Widget _depoimentos() => const TestimonialsPage();
Widget _contato() => const ContactPage();
Widget _login() => const LoginPage();
Widget _meuPet() => const MyPetPage();
Widget _detalhePet() => const PetDetalhePage(
  pet: Pet(
    id: 7,
    userId: 1,
    nome: 'Thor de Sobrenome Muito Comprido',
    idade: 3,
    peso: 12.5,
    raca: 'Cavalier King Charles Spaniel',
    vacinas: ['antirrabica', 'polivalente', 'traqueobronquite'],
  ),
);
Widget _notificacoes() => const NotificacoesPage(token: 'tok');
Widget _detalheServico() => ServiceDetailsPage(servico: _banho);
Widget _agendamento() => BookingPage(servico: _banho);
Widget _daycareTela() => const DaycarePage();

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await sessao.sair();
    await sessao.entrar('tok', const Usuario(id: 1, nome: 'Ana Maria de Souza Pereira', email: 'ana.maria.souza@email.com'));
  });

  for (final (nome, tela) in _telas) {
    testWidgets('$nome cabe em $_largura px de largura', (tester) async {
      GoogleFonts.config.allowRuntimeFetching = false;
      tester.view.physicalSize = const Size(_largura * 2, _altura * 2);
      tester.view.devicePixelRatio = 2;
      addTearDown(tester.view.reset);

      await http.runWithClient(() async {
        await tester.pumpWidget(MaterialApp(home: tela()));
        await tester.pumpAndSettle();
      }, () => _back);

      expect(tester.takeException(), isNull);
    });
  }
}
