import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/depoimento.dart';
import 'api_client.dart';

Future<List<Depoimento>> apiGetDepoimentos() async {
  final corpo = await apiRequest(
    () => http.get(Uri.parse('$apiBaseUrl/api/depoimentos')),
    'Falha ao buscar depoimentos.',
  );

  if (corpo is! List) throw ApiException('Resposta inválida do servidor.');
  try {
    return corpo
        .map((item) => Depoimento.fromJson(item as Map<String, dynamic>))
        .toList();
  } on TypeError {
    throw ApiException('Resposta inválida do servidor.');
  }
}

Future<void> apiCreateDepoimento({
  required String nomeCachorro,
  required String nomeTutor,
  required String raca,
  required String comentario,
}) async {
  await apiRequest(
    () => http.post(
      Uri.parse('$apiBaseUrl/api/depoimentos'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'nomeCachorro': nomeCachorro,
        'nomeTutor': nomeTutor,
        'raca': raca,
        'comentario': comentario,
      }),
    ),
    'Falha ao enviar depoimento.',
  );
}
