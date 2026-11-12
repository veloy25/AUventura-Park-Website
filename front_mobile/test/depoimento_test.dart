import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/models/depoimento.dart';

Map<String, dynamic> _json(String criadoEm) => {
      'id': 1,
      'nomeCachorro': 'Thor',
      'nomeTutor': 'Maria',
      'raca': 'Husky',
      'comentario': 'Ótimo',
      'criado_em': criadoEm,
    };

void main() {
  final esperado = DateTime.utc(2026, 10, 19, 1, 59, 54);

  test('data do GET (UTC sem fuso) é lida como UTC', () {
    final depoimento = Depoimento.fromJson(_json('2026-10-19 01:59:54'));
    expect(depoimento.criadoEm!.toUtc(), esperado);
  });

  test('data do POST (ISO com Z) continua correta', () {
    final depoimento = Depoimento.fromJson(_json('2026-10-19T01:59:54.000Z'));
    expect(depoimento.criadoEm!.toUtc(), esperado);
  });

  test('data inválida vira nula em vez de quebrar', () {
    expect(Depoimento.fromJson(_json('lixo')).criadoEm, isNull);
  });
}
