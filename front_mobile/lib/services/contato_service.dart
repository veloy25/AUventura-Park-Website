import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_client.dart';

Future<void> apiCreateContato({
  required String nome,
  required String email,
  required String telefone,
  required String assunto,
  required String mensagem,
}) async {
  await apiRequest(
    () => http.post(
      Uri.parse('$apiBaseUrl/api/contatos'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'nome': nome,
        'email': email,
        'telefone': telefone,
        'assunto': assunto,
        'mensagem': mensagem,
      }),
    ),
    'Não foi possível enviar a mensagem.',
  );
}
