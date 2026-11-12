import 'dart:convert';

import 'package:http/http.dart' as http;

// Publica eventos no barramento. Lança em qualquer falha; quem chama decide
// se ela é fatal.
class BarramentoClient {
  BarramentoClient(this._url, this._cliente);

  final String _url;
  final http.Client _cliente;

  Future<void> publicar(String tipo, Map<String, dynamic> dados) async {
    final resposta = await _cliente
        .post(
          Uri.parse('$_url/eventos'),
          headers: {'content-type': 'application/json'},
          body: jsonEncode({
            'tipo': tipo,
            'origem': 'user-service',
            'dados': dados,
          }),
        )
        .timeout(const Duration(seconds: 5));

    if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
      throw StateError('Barramento respondeu ${resposta.statusCode}.');
    }
  }
}
