import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/usuario.dart';
import 'api_client.dart';

Usuario _lerUsuario(Object? json) {
  try {
    return Usuario.fromJson(json as Map<String, dynamic>);
  } on TypeError {
    throw ApiException('Resposta inválida do servidor.');
  }
}

Future<({String token, Usuario usuario})> apiLogin(String email, String senha) async {
  final corpo = await apiRequest(
    () => http.post(
      Uri.parse('$apiBaseUrl/api/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'senha': senha}),
    ),
    'Falha no login.',
  );

  final token = corpo is Map ? corpo['token'] : null;
  if (token is! String) throw ApiException('Resposta inválida do servidor.');
  return (token: token, usuario: _lerUsuario(corpo['user']));
}

Future<void> apiSignup(String nome, String email, String senha) async {
  await apiRequest(
    () => http.post(
      Uri.parse('$apiBaseUrl/api/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'nome': nome, 'email': email, 'senha': senha}),
    ),
    'Falha no cadastro.',
  );
}

Future<Usuario> apiGetMe(String token) async {
  final corpo = await apiRequest(
    () => http.get(
      Uri.parse('$apiBaseUrl/api/me'),
      headers: {'Authorization': 'Bearer $token'},
    ),
    'Sessão inválida.',
  );
  return _lerUsuario(corpo is Map ? corpo['user'] : null);
}
