import 'package:user_service_dart/src/models/user.dart';
import 'package:user_service_dart/src/repositories/user_repository.dart';

class RepositorioEmMemoria implements UserRepository {
  final List<User> usuarios = [];
  int _proximoId = 1;

  @override
  Future<User?> buscarPorId(int id) async {
    return usuarios.where((u) => u.id == id).firstOrNull;
  }

  @override
  Future<User?> buscarPorEmail(String email) async {
    return usuarios.where((u) => u.email == email).firstOrNull;
  }

  @override
  Future<User> inserir(User user) async {
    final criado = User(
      id: _proximoId++,
      nome: user.nome,
      email: user.email,
      passwordHash: user.passwordHash,
      criadoEm: DateTime.now(),
    );
    usuarios.add(criado);
    return criado;
  }
}
