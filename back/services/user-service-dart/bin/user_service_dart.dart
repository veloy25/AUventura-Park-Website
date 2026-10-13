import 'dart:convert';
import 'dart:io';

import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_router/shelf_router.dart';

import 'package:user_service_dart/src/config/app_config.dart';
import 'package:user_service_dart/src/config/database.dart';

// Inicializa o User Service em Dart.
// Carrega configurações, conecta ao MySQL e sobe o servidor HTTP.
Future<void> main() async {
  try {
    final config = AppConfig.fromEnv();

    stdout.writeln('Iniciando User Service...');
    stdout.writeln(config);

    // Cria o pool de conexões e espera o MySQL ficar disponível.
    final pool = criarPool(config);

    stdout.writeln('Aguardando conexão com o MySQL...');

    await aguardarBanco(pool);

    stdout.writeln('MySQL conectado com sucesso.');

    final router = Router();

    // Verifica se o serviço está funcionando.
    router.get('/health', (Request request) {
      return Response.ok(
        jsonEncode({
          'status': 'ok',
          'service': 'user-service',
          'technology': 'dart',
        }),
        headers: {
          'content-type': 'application/json',
        },
      );
    });

    final handler = Pipeline()
        .addMiddleware(logRequests())
        .addHandler(router.call);

    final server = await shelf_io.serve(
      handler,
      InternetAddress.anyIPv4,
      config.serverPort,
    );

    stdout.writeln(
      'User Service ouvindo em '
      'http://localhost:${server.port}',
    );
  } catch (erro, stackTrace) {
    stderr.writeln(
      'Erro ao iniciar o User Service: $erro',
    );

    stderr.writeln(stackTrace);

    exitCode = 1;
  }
}