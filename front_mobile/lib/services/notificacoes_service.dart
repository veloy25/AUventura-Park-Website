import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../models/notificacao.dart';
import 'api_client.dart';
import 'sessao.dart';

final ValueNotifier<int> naoLidas = ValueNotifier<int>(0);

Future<void> atualizarNaoLidas() async {
  final token = sessao.token;
  if (token == null) {
    naoLidas.value = 0;
    return;
  }

  try {
    final corpo = await apiRequest(
      () => http.get(
        Uri.parse('$apiBaseUrl/api/notificacoes/nao-lidas'),
        headers: {'Authorization': 'Bearer $token'},
      ),
      'Falha ao contar as notificações.',
    );
    if (corpo is List) naoLidas.value = corpo.length;
  } on ApiException catch (e) {
    // O contador é só um aviso: se falhar, o sino segue com o último valor.
    debugPrint('Contador de notificações: ${e.mensagem}');
  }
}

Future<List<Notificacao>> apiGetNotificacoes(String token) async {
  final corpo = await apiRequest(
    () => http.get(
      Uri.parse('$apiBaseUrl/api/notificacoes'),
      headers: {'Authorization': 'Bearer $token'},
    ),
    'Falha ao buscar notificações.',
  );

  if (corpo is! List) {
    throw ApiException('Resposta inválida do servidor.');
  }

  try {
    return corpo
        .map((item) => Notificacao.fromJson(item as Map<String, dynamic>))
        .toList();
  } on TypeError {
    throw ApiException('Resposta inválida do servidor.');
  }
}

Future<void> apiMarcarNotificacaoComoLida(String token, int id) async {
  await apiRequest(
    () => http.patch(
      Uri.parse('$apiBaseUrl/api/notificacoes/$id/lida'),
      headers: {'Authorization': 'Bearer $token'},
    ),
    'Falha ao marcar a notificação como lida.',
  );
}

Future<void> apiExcluirNotificacao(String token, int id) async {
  await apiRequest(
    () => http.delete(
      Uri.parse('$apiBaseUrl/api/notificacoes/$id'),
      headers: {'Authorization': 'Bearer $token'},
    ),
    'Falha ao excluir a notificação.',
  );
}