import 'dart:async';
import 'dart:io';

import 'package:bcrypt/bcrypt.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

import '../core/erros.dart';
import '../models/user.dart';
import '../repositories/user_repository.dart';

typedef PublicarEvento = Future<void> Function(
  String tipo,
  Map<String, dynamic> dados,
);

// Regras de cadastro, login e perfil. Não conhece HTTP nem MySQL.
class UserService {
  UserService({
    required this._repositorio,
    required this._jwtSecret,
    required this._validadeToken,
    required this._publicar,
  });

  final UserRepository _repositorio;
  final String _jwtSecret;
  final Duration _validadeToken;
  final PublicarEvento _publicar;

  Future<User> cadastrar({String? nome, String? email, String? senha}) async {
    final nomeLimpo = nome?.trim() ?? '';
    final emailLimpo = email?.trim().toLowerCase() ?? '';
    final senhaInformada = senha ?? '';

    final campos = <String, String>{
      if (nomeLimpo.isEmpty) 'nome': 'Obrigatorio.',
      if (emailLimpo.isEmpty) 'email': 'Obrigatorio.',
      if (senhaInformada.isEmpty) 'senha': 'Obrigatoria.',
    };
    if (campos.isNotEmpty) {
      throw ErroValidacao(
        'Nome, e-mail e senha sao obrigatorios.',
        campos: campos,
      );
    }

    // Verificação amigável; o UNIQUE do banco é a barreira final contra duas
    // requisições simultâneas (o repositório traduz esse erro em Conflito).
    if (await _repositorio.buscarPorEmail(emailLimpo) != null) {
      throw const Conflito('Este e-mail ja esta em uso.');
    }

    final criado = await _repositorio.inserir(
      User(
        nome: nomeLimpo,
        email: emailLimpo,
        passwordHash: BCrypt.hashpw(senhaInformada, BCrypt.gensalt()),
      ),
    );

    _emitir('user:created', {
      'id': criado.id,
      'nome': criado.nome,
      'email': criado.email,
    });
    return criado;
  }

  Future<({String token, User usuario})> entrar({
    String? email,
    String? senha,
  }) async {
    final emailLimpo = email?.trim().toLowerCase() ?? '';
    final senhaInformada = senha ?? '';

    if (emailLimpo.isEmpty || senhaInformada.isEmpty) {
      throw ErroValidacao(
        'E-mail e senha sao obrigatorios.',
        campos: {
          if (emailLimpo.isEmpty) 'email': 'Obrigatorio.',
          if (senhaInformada.isEmpty) 'senha': 'Obrigatoria.',
        },
      );
    }

    final usuario = await _repositorio.buscarPorEmail(emailLimpo);

    // Mesma resposta para e-mail inexistente e senha errada: não revela quais
    // e-mails têm conta.
    if (usuario == null ||
        !BCrypt.checkpw(senhaInformada, usuario.passwordHash)) {
      throw const NaoAutorizado('E-mail ou senha invalidos.');
    }

    // As claims precisam ser as mesmas do user-service Node: os outros
    // serviços validam este token com o mesmo JWT_SECRET.
    final token = JWT({
      'id': usuario.id,
      'nome': usuario.nome,
      'email': usuario.email,
    }).sign(SecretKey(_jwtSecret), expiresIn: _validadeToken);

    _emitir('user:logged-in', {'id': usuario.id, 'email': usuario.email});
    return (token: token, usuario: usuario);
  }

  Future<User> perfil(String? token) async {
    if (token == null) {
      throw const NaoAutorizado('Token de autenticacao ausente.');
    }

    final int id;
    try {
      final payload = JWT.verify(token, SecretKey(_jwtSecret)).payload;
      final valor = payload is Map ? payload['id'] : null;
      if (valor is! int) {
        throw const NaoAutorizado('Token invalido ou expirado.');
      }
      id = valor;
    } on JWTException {
      throw const NaoAutorizado('Token invalido ou expirado.');
    }

    final usuario = await _repositorio.buscarPorId(id);
    if (usuario == null) throw const NaoEncontrado('Usuario nao encontrado.');
    return usuario;
  }

  // O barramento fora do ar não pode impedir cadastro nem login.
  void _emitir(String tipo, Map<String, dynamic> dados) {
    unawaited(
      _publicar(tipo, dados).catchError((Object erro) {
        stderr.writeln('[User Service] Erro ao publicar $tipo: $erro');
      }),
    );
  }
}
