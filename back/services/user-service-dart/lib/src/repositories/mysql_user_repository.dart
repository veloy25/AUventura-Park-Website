import 'package:mysql_dart/mysql_dart.dart';

import '../models/user.dart';
import 'user_repository.dart';

// Implementa o acesso aos usuários utilizando MySQL.
// Executa as consultas usando o pool de conexões da aplicação.
class MySqlUserRepository implements UserRepository {
  MySqlUserRepository(this._pool);

  final MySQLConnectionPool _pool;

  // Centraliza as colunas utilizadas nas consultas de usuário.
  static const String _colunas =
      'id, nome, email, password_hash, criado_em';

  // Converte uma linha retornada pelo MySQL em um objeto User.
  User _mapear(ResultSetRow linha) {
    final dados = linha.assoc().cast<String, String?>();

    return User(
      id: int.parse(dados['id']!),
      nome: dados['nome']!,
      email: dados['email']!,
      passwordHash: dados['password_hash']!,
      criadoEm: DateTime.tryParse(
        dados['criado_em'] ?? '',
      ),
    );
  }

  // Busca um usuário através do seu id.
  @override
  Future<User?> buscarPorId(int id) async {
    final resultado = await _pool.execute(
      'SELECT $_colunas '
      'FROM users '
      'WHERE id = :id',
      {
        'id': id,
      },
    );

    if (resultado.rows.isEmpty) {
      return null;
    }

    return _mapear(
      resultado.rows.first,
    );
  }

  // Busca um usuário através do e-mail.
  @override
  Future<User?> buscarPorEmail(String email) async {
    final resultado = await _pool.execute(
      'SELECT $_colunas '
      'FROM users '
      'WHERE email = :email',
      {
        'email': email,
      },
    );

    if (resultado.rows.isEmpty) {
      return null;
    }

    return _mapear(
      resultado.rows.first,
    );
  }

  // Insere um novo usuário e retorna o registro criado pelo banco.
  @override
  Future<User> inserir(User user) async {
    final resultado = await _pool.execute(
      'INSERT INTO users '
      '(nome, email, password_hash) '
      'VALUES (:nome, :email, :passwordHash)',
      {
        'nome': user.nome,
        'email': user.email,
        'passwordHash': user.passwordHash,
      },
    );

    final novoId = resultado.lastInsertID.toInt();

    // Busca novamente para receber também id e criado_em gerados pelo banco.
    return (await buscarPorId(novoId))!;
  }
}