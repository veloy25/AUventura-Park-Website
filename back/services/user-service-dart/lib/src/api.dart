import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import 'controllers/health_controller.dart';
import 'controllers/user_controller.dart';
import 'repositories/user_repository.dart';
import 'services/user_service.dart';
import 'web/middlewares.dart';
import 'web/problem.dart';

// Ponto de montagem: único lugar que conhece todas as peças e as liga
// (injeção de dependência feita à mão).
Handler criarApi({
  required UserRepository repositorio,
  required Future<void> Function() verificarBanco,
  required String jwtSecret,
  required Duration validadeToken,
  required PublicarEvento publicar,
  required bool detalharFalhas,
}) {
  final servico = UserService(
    repositorio: repositorio,
    jwtSecret: jwtSecret,
    validadeToken: validadeToken,
    publicar: publicar,
  );

  final router = Router(
    notFoundHandler: (Request _) => problema(
      status: 404,
      tipo: 'nao-encontrado',
      titulo: 'Recurso nao encontrado',
      detalhe: 'Rota nao encontrada.',
    ),
  );
  router.mount('/health', HealthController(verificarBanco).router.call);
  router.mount('/', UserController(servico).router.call);

  return const Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(tratarErros(detalharFalhas: detalharFalhas))
      .addHandler(router.call);
}
