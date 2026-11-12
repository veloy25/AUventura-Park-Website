import 'dart:io';

import 'package:barramento_service_dart/barramento_service_dart.dart';
import 'package:http/http.dart' as http;
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;

Future<void> main() async {
  final notificacoes =
      Platform.environment['NOTIFICACOES_SERVICE_URL'] ??
      'http://localhost:3007';
  final porta =
      int.tryParse(Platform.environment['BARRAMENTO_PORT'] ?? '') ?? 10000;

  final handler = const Pipeline()
      .addMiddleware(logRequests())
      .addHandler(
        criarBarramento(
          assinantes: {
            'user:created': [notificacoes],
            'agendamento:created': [notificacoes],
            'daycare:created': [notificacoes],
          },
          cliente: http.Client(),
        ),
      );

  final servidor = await shelf_io.serve(
    handler,
    InternetAddress.anyIPv4,
    porta,
  );
  stdout.writeln(
    '[Barramento Dart] porta ${servidor.port}, notificações em $notificacoes',
  );
}
