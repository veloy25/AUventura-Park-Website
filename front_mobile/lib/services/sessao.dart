import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/usuario.dart';
import 'api_client.dart';
import 'auth_service.dart';

// Estado de login do app. As telas escutam com ListenableBuilder ou
// addListener e se redesenham quando alguém entra ou sai.
class Sessao extends ChangeNotifier {
  static const _chaveToken = 'authToken';
  static const _chaveUsuario = 'authUser';

  String? _token;
  Usuario? _usuario;

  String? get token => _token;
  Usuario? get usuario => _usuario;
  bool get logado => _token != null;

  // Lê o login salvo sem ir à rede, para o app já abrir logado.
  Future<void> carregar() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_chaveToken);
    final usuarioSalvo = prefs.getString(_chaveUsuario);
    if (token == null || usuarioSalvo == null) return;

    try {
      _usuario = Usuario.fromJson(jsonDecode(usuarioSalvo) as Map<String, dynamic>);
      _token = token;
    } on FormatException {
      await _apagarSalvo(prefs);
    } on TypeError {
      await _apagarSalvo(prefs);
    }
  }

  // Confere o token salvo no back. Só desloga se o servidor recusar o token:
  // sem rede, o usuário continua logado e o app tenta de novo na próxima vez.
  Future<void> validar() async {
    final token = _token;
    if (token == null) return;
    try {
      _usuario = await apiGetMe(token);
      notifyListeners();
    } on ApiException catch (e) {
      if (e.status == 401 || e.status == 404) await sair();
    }
  }

  Future<void> entrar(String token, Usuario usuario) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_chaveToken, token);
    await prefs.setString(_chaveUsuario, jsonEncode(usuario.toJson()));
    _token = token;
    _usuario = usuario;
    notifyListeners();
  }

  Future<void> sair() async {
    await _apagarSalvo(await SharedPreferences.getInstance());
    _token = null;
    _usuario = null;
    notifyListeners();
  }

  Future<void> _apagarSalvo(SharedPreferences prefs) async {
    await prefs.remove(_chaveToken);
    await prefs.remove(_chaveUsuario);
  }
}

final sessao = Sessao();
