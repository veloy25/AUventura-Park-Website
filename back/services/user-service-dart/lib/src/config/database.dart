import 'package:mysql_dart/mysql_dart.dart';

import 'app_config.dart';

// Cria e gerencia o pool de conexões com o MySQL.
// Reutiliza conexões para evitar abrir uma nova a cada requisição.
MySQLConnectionPool criarPool(
  AppConfig config,
) {
  return MySQLConnectionPool(
    host: config.dbHost,
    port: config.dbPort,
    userName: config.dbUser,
    password: config.dbPassword,
    databaseName: config.dbName,

    // Limite máximo de conexões abertas pelo serviço.
    maxConnections: config.dbPoolSize,

    // Configuração usada no ambiente local/Docker.
    secure: false,
    allowPublicKeyRetrieval: true,
  );
}

// Aguarda o MySQL ficar disponível antes de continuar.
// Útil quando o serviço inicia antes do banco no Docker.
Future<void> aguardarBanco(
  MySQLConnectionPool pool, {
  int tentativas = 30,
  Duration intervalo = const Duration(
    seconds: 2,
  ),
}) async {
  for (
    var tentativa = 1;
    tentativa <= tentativas;
    tentativa++
  ) {
    try {
      // Consulta simples para verificar se o banco responde.
      await pool.execute(
        'SELECT 1',
      );

      return;
    } catch (_) {
      if (tentativa == tentativas) {
        rethrow;
      }

      await Future<void>.delayed(
        intervalo,
      );
    }
  }
}