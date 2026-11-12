import 'dart:convert';

import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import '../core/erros.dart';
import '../models/user.dart';
import '../services/user_service.dart';
import '../web/resposta.dart';

// Traduz HTTP para chamadas do serviço e o resultado de volta para JSON.
class UserController {
  UserController(this._service);

  final UserService _service;

  Router get router {
    final router = Router();
    router.post('/signup', _cadastrar);
    router.post('/login', _entrar);
    router.get('/me', _perfil);
    return router;
  }

  Future<Response> _cadastrar(Request request) async {
    final corpo = await _lerCorpo(request);
    final usuario = await _service.cadastrar(
      nome: _texto(corpo, 'nome'),
      email: _texto(corpo, 'email'),
      senha: _texto(corpo, 'senha'),
    );
    return respostaJson(201, _publico(usuario));
  }

  Future<Response> _entrar(Request request) async {
    final corpo = await _lerCorpo(request);
    final login = await _service.entrar(
      email: _texto(corpo, 'email'),
      senha: _texto(corpo, 'senha'),
    );
    return respostaJson(200, {
      'token': login.token,
      'user': _publico(login.usuario),
    });
  }

  Future<Response> _perfil(Request request) async {
    final cabecalho = request.headers['authorization'];
    final token = cabecalho != null && cabecalho.startsWith('Bearer ')
        ? cabecalho.substring('Bearer '.length).trim()
        : null;

    final usuario = await _service.perfil(token);
    return respostaJson(200, {'user': _publico(usuario)});
  }

  // Só estes campos saem da API; o hash da senha nunca.
  Map<String, dynamic> _publico(User usuario) => {
    'id': usuario.id,
    'nome': usuario.nome,
    'email': usuario.email,
  };

  Future<Map<String, dynamic>> _lerCorpo(Request request) async {
    final texto = await request.readAsString();
    if (texto.isEmpty) {
      throw const RequisicaoInvalida('Corpo da requisicao vazio.');
    }

    final Object? corpo;
    try {
      corpo = jsonDecode(texto);
    } on FormatException {
      throw const RequisicaoInvalida('JSON invalido.');
    }
    if (corpo is! Map<String, dynamic>) {
      throw const RequisicaoInvalida('O corpo deve ser um objeto JSON.');
    }
    return corpo;
  }

  // Campo ausente ou de outro tipo vira nulo e cai na validação do serviço.
  String? _texto(Map<String, dynamic> corpo, String campo) {
    final valor = corpo[campo];
    return valor is String ? valor : null;
  }
}
