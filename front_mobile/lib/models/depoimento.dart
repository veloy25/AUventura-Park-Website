class Depoimento {
  const Depoimento({
    required this.id,
    required this.nomeCachorro,
    required this.nomeTutor,
    required this.raca,
    required this.comentario,
    this.criadoEm,
  });

  final int id;
  final String nomeCachorro;
  final String nomeTutor;
  final String raca;
  final String comentario;
  final DateTime? criadoEm;

  factory Depoimento.fromJson(Map<String, dynamic> json) {
    return Depoimento(
      id: json['id'] as int,
      nomeCachorro: json['nomeCachorro'] as String,
      nomeTutor: json['nomeTutor'] as String,
      raca: json['raca'] as String,
      comentario: json['comentario'] as String,
      criadoEm: _lerData(json['criado_em']),
    );
  }

  // O GET devolve UTC sem fuso ("2026-10-19 01:59:54"); sem o Z o Dart leria
  // como horário local e a data podia sair um dia errada.
  static DateTime? _lerData(Object? valor) {
    final texto = '$valor'.replaceFirst(' ', 'T');
    return DateTime.tryParse(texto.endsWith('Z') ? texto : '${texto}Z')?.toLocal();
  }
}
