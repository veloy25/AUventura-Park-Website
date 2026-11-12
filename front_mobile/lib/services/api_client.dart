import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

// No emulador Android o localhost do computador é 10.0.2.2.
String get apiBaseUrl {
  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}

class ApiException implements Exception {
  ApiException(this.mensagem, {this.status});

  final String mensagem;

  // Nulo quando a falha foi de rede (sem resposta do servidor).
  final int? status;

  @override
  String toString() => mensagem;
}

// Faz a chamada e devolve o JSON já decodificado. Qualquer falha vira
// ApiException com uma mensagem que a tela pode mostrar ao usuário.
Future<dynamic> apiRequest(
  Future<http.Response> Function() chamada,
  String erroPadrao,
) async {
  final http.Response resposta;
  try {
    resposta = await chamada().timeout(const Duration(seconds: 10));
  } on TimeoutException {
    throw ApiException('O servidor demorou para responder. Tente novamente.');
  } on http.ClientException {
    throw ApiException(
      'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.',
    );
  }

  final dynamic corpo;
  try {
    corpo = resposta.body.isEmpty ? null : jsonDecode(utf8.decode(resposta.bodyBytes));
  } on FormatException {
    throw ApiException('Resposta inválida do servidor.');
  }

  if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
    final mensagem = corpo is Map ? corpo['error'] : null;
    throw ApiException(
      mensagem is String ? mensagem : erroPadrao,
      status: resposta.statusCode,
    );
  }
  return corpo;
}
