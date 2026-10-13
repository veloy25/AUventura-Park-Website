// Representa um usuário dentro da aplicação.
// Mantém os dados do usuário separados da lógica de banco e das rotas HTTP.
class User {
  const User({
    this.id,
    required this.nome,
    required this.email,
    required this.passwordHash,
    this.criadoEm,
  });

  // Identificador gerado pelo banco.
  // Pode ser nulo enquanto o usuário ainda não foi salvo.
  final int? id;

  final String nome;
  final String email;

  // Armazena apenas o hash da senha, nunca a senha em texto puro.
  final String passwordHash;

  // Data criada automaticamente pelo banco.
  final DateTime? criadoEm;

  // Converte o usuário para JSON sem expor o hash da senha.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nome': nome,
      'email': email,
      'criado_em': criadoEm?.toIso8601String(),
    };
  }
}