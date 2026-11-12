import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/services/agendamentos_service.dart';
import 'package:front_mobile/services/api_client.dart';
import 'package:front_mobile/services/daycare_service.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

http.Response _json(Object corpo, [int status = 201]) =>
    http.Response.bytes(utf8.encode(jsonEncode(corpo)), status);

void main() {
  // Esse aviso leva o tutor ao My Pet; só pode subir quando o back aceitou.
  group('agendamentoCriado', () {
    test('sobe quando o agendamento comum é criado', () async {
      final client = MockClient(
        (_) async => _json({
          'id': 1,
          'user_id': 1,
          'nomeCachorro': 'Thor',
          'servico': 'banho',
          'data': '2026-11-19',
          'horario': '10:00',
        }),
      );
      final antes = agendamentoCriado.value;

      await http.runWithClient(
        () => apiCreateAgendamento(
          'tok',
          nomeCachorro: 'Thor',
          servico: 'banho',
          data: '2026-11-19',
          horario: '10:00',
        ),
        () => client,
      );

      expect(agendamentoCriado.value, antes + 1);
    });

    test('sobe quando o Daycare é criado', () async {
      final client = MockClient((_) async => _json({'id': 3}));
      final antes = agendamentoCriado.value;

      await http.runWithClient(
        () => apiCriarAgendamentoDaycare(
          'tok',
          petId: 7,
          plano: 'dayuse',
          dataAvulso: '2026-11-20',
          valorTotal: 160,
        ),
        () => client,
      );

      expect(agendamentoCriado.value, antes + 1);
    });

    test('não sobe se o back recusar o Daycare', () async {
      final client = MockClient(
        (_) async => _json({'error': 'Limite de 10 pets atingido.'}, 409),
      );
      final antes = agendamentoCriado.value;

      await expectLater(
        http.runWithClient(
          () => apiCriarAgendamentoDaycare(
            'tok',
            petId: 7,
            plano: 'dayuse',
            dataAvulso: '2026-11-20',
          ),
          () => client,
        ),
        throwsA(isA<ApiException>()),
      );

      expect(agendamentoCriado.value, antes);
    });
  });
}
