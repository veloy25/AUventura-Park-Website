class Usuario {
  const Usuario({required this.id, required this.nome, required this.email});

  final int id;
  final String nome;
  final String email;

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['id'] as int,
      nome: json['nome'] as String,
      email: json['email'] as String,
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'nome': nome, 'email': email};
}
