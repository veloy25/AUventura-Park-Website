import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import '../web/resposta.dart';

class HealthController {
  HealthController(this._verificarBanco);

  final Future<void> Function() _verificarBanco;

  Router get router {
    final router = Router();

    // Liveness não toca no banco: o MySQL fora do ar não deve fazer o
    // orquestrador matar um processo saudável.
    router.get('/live', (Request _) => respostaJson(200, {'status': 'ok'}));

    router.get('/ready', (Request _) async {
      try {
        await _verificarBanco();
        return respostaJson(200, {'status': 'ok', 'banco': 'ok'});
      } catch (_) {
        return respostaJson(503, {
          'status': 'degradado',
          'banco': 'indisponivel',
        });
      }
    });

    return router;
  }
}
