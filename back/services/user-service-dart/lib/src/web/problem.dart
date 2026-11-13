import 'dart:convert';

import 'package:shelf/shelf.dart';

const String _baseTipos = 'https://api.auventura.local/problemas';

// Erro no formato da RFC 9457 (problem details).
Response problema({
  required int status,
  required String titulo,
  required String detalhe,
  String? tipo,
  Map<String, dynamic> extras = const {},
}) {
  final corpo = <String, dynamic>{
    'type': tipo == null ? 'about:blank' : '$_baseTipos/$tipo',
    'title': titulo,
    'status': status,
    'detail': detalhe,
    // O app Flutter e o front React leem "error"; fica ao lado do padrão
    // até os clientes migrarem para "detail".
    'error': detalhe,
    ...extras,
  };

  return Response(
    status,
    body: jsonEncode(corpo),
    headers: {'content-type': 'application/problem+json; charset=utf-8'},
  );
}
