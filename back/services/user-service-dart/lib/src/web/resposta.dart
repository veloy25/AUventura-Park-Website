import 'dart:convert';

import 'package:shelf/shelf.dart';

Response respostaJson(int status, Object corpo) {
  return Response(
    status,
    body: jsonEncode(corpo),
    headers: {'content-type': 'application/json; charset=utf-8'},
  );
}
