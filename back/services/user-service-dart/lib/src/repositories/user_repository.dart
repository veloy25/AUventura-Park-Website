import '../models/user.dart';

// Define o contrato de acesso aos dados de usuário.
// Permite trocar a implementação do banco sem alterar a regra de negócio.
abstract interface class UserRepository {
  // Busca um usuário pelo identificador.
  Future<User?> buscarPorId(int id);

  // Busca um usuário pelo e-mail.
  // Será usado principalmente no login e para evitar cadastros duplicados.
  Future<User?> buscarPorEmail(String email);

  // Salva um novo usuário no banco e devolve o usuário criado.
  Future<User> inserir(User user);
}