import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/models/agendamento.dart';
import 'package:front_mobile/models/pet.dart';
import 'package:front_mobile/models/servico_info.dart';

void main() {
  group('Modelos de Agendamento e Pet', () {
    test('Agendamento deve converter de/para JSON corretamente', () {
      final json = {
        'id': 1,
        'user_id': 10,
        'nomeCachorro': 'Rex',
        'servico': 'banho_tosa',
        'data': '2026-11-15',
        'horario': '10:00',
        'observacoes': 'Tosa na tesoura',
        'criado_em': '2026-11-01T10:00:00Z',
      };

      final ag = Agendamento.fromJson(json);

      expect(ag.id, 1);
      expect(ag.userId, 10);
      expect(ag.nomeCachorro, 'Rex');
      expect(ag.servico, 'banho_tosa');
      expect(ag.servicoFormatado, 'Banho e Tosa 🛁✂️');
      expect(ag.dataFormatada, '15/11/2026');
      expect(ag.horario, '10:00');
      expect(ag.observacoes, 'Tosa na tesoura');
    });

    test('Pet deve parsear vacinas em formato de lista ou string separada por virgula', () {
      final jsonList = {
        'id': 2,
        'user_id': 10,
        'nome': 'Mel',
        'idade': 4,
        'peso': 15.5,
        'raca': 'Golden Retriever',
        'vacinas': ['antirrabica', 'polivalente'],
      };

      final petList = Pet.fromJson(jsonList);
      expect(petList.nome, 'Mel');
      expect(petList.vacinas.length, 2);
      expect(petList.vacinas, contains('antirrabica'));

      final jsonStr = {
        'id': 3,
        'user_id': 10,
        'nome': 'Thor',
        'idade': 2,
        'peso': 8.0,
        'raca': 'Beagle',
        'vacinas': 'antirrabica,traqueobronquite',
      };

      final petStr = Pet.fromJson(jsonStr);
      expect(petStr.nome, 'Thor');
      expect(petStr.vacinas.length, 2);
      expect(petStr.vacinas, contains('traqueobronquite'));
    });

    test('ServicoInfo gera slots de 30 minutos ou 60 minutos dependendo da duracao', () {
      final banho = servicosDisponiveis.firstWhere((s) => s.id == 'banho');
      final slotsBanho = banho.gerarSlots();
      expect(slotsBanho.first, '08:00');
      expect(slotsBanho[1], '08:30');
      expect(slotsBanho.last, '17:30');

      final tosaCompleta =
          servicosDisponiveis.firstWhere((s) => s.id == 'banho_tosa');
      final slotsTosa = tosaCompleta.gerarSlots();
      expect(slotsTosa.first, '08:00');
      expect(slotsTosa[1], '09:00');
      expect(slotsTosa.last, '17:00');
    });
  });

  group('separarAgendamentos', () {
    // Quinta-feira, 12/11/2026, 10:00.
    final agora = DateTime(2026, 11, 12, 10);

    Agendamento ag(int id, String data, String horario, {String pet = 'Thor'}) {
      return Agendamento(
        id: id,
        userId: 1,
        nomeCachorro: pet,
        servico: 'banho',
        data: data,
        horario: horario,
      );
    }

    List<int> ids(List<Agendamento> lista) => lista.map((a) => a.id).toList();

    test('o mesmo dia conta pelo horário: antes de agora é histórico', () {
      final divisao = separarAgendamentos(
        [ag(1, '2026-11-12', '09:30'), ag(2, '2026-11-12', '10:30')],
        'Thor',
        agora: agora,
      );

      expect(ids(divisao.proximos), [2]);
      expect(ids(divisao.historico), [1]);
    });

    test('um agendamento exatamente agora já começou, então é histórico', () {
      final divisao = separarAgendamentos(
        [ag(1, '2026-11-12', '10:00')],
        'Thor',
        agora: agora,
      );

      expect(divisao.proximos, isEmpty);
      expect(ids(divisao.historico), [1]);
    });

    test('próximos do mais perto ao mais longe; histórico do mais recente ao mais antigo', () {
      final divisao = separarAgendamentos(
        [
          ag(1, '2026-12-01', '08:00'),
          ag(2, '2026-11-20', '14:00'),
          ag(3, '2026-11-20', '09:00'),
          ag(4, '2026-10-01', '08:00'),
          ag(5, '2026-11-05', '08:00'),
        ],
        'Thor',
        agora: agora,
      );

      expect(ids(divisao.proximos), [3, 2, 1]);
      expect(ids(divisao.historico), [5, 4]);
    });

    test(
      'só entram os agendamentos do pet, ignorando maiúsculas e espaços',
      () {
        final divisao = separarAgendamentos(
          [
            ag(1, '2026-11-20', '09:00', pet: ' THOR '),
            ag(2, '2026-11-20', '10:00', pet: 'Mel'),
          ],
          'thor',
          agora: agora,
        );

        expect(ids(divisao.proximos), [1]);
        expect(divisao.historico, isEmpty);
      },
    );

    test('data inválida vai para o histórico em vez de quebrar', () {
      final divisao = separarAgendamentos(
        [ag(1, '', '09:00')],
        'Thor',
        agora: agora,
      );

      expect(divisao.proximos, isEmpty);
      expect(ids(divisao.historico), [1]);
    });

    test('horário fora do padrão conta como início do dia', () {
      final divisao = separarAgendamentos(
        [ag(1, '2026-11-12', 'manhã'), ag(2, '2026-11-13', 'manhã')],
        'Thor',
        agora: agora,
      );

      expect(ids(divisao.proximos), [2]);
      expect(ids(divisao.historico), [1]);
    });
  });
}
