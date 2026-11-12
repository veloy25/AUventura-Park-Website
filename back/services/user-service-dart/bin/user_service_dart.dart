import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:mysql_dart/mysql_dart.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;

import 'package:user_service_dart/src/api.dart';
import 'package:user_service_dart/src/clients/barramento_client.dart';
import 'package:user_service_dart/src/config/app_config.dart';
import 'package:user_service_dart/src/config/database.dart';
import 'package:user_service_dart/src/repositories/mysql_user_repository.dart';

Future<void> main() async {
  try {
    final config = AppConfig.fromEnv();

    stdout.writeln('Iniciando User Service...');
    stdout.writeln(config);

    final pool = criarPool(config);

    stdout.writeln('Aguardando conexão com o MySQL...');
    await aguardarBanco(pool);
    stdout.writeln('MySQL conectado com sucesso.');

    final clienteHttp = http.Client();
    final handler = criarApi(
      repositorio: MySqlUserRepository(pool),
      verificarBanco: () async {
        await pool.execute('SELECT 1');
      },
      jwtSecret: config.jwtSecret,
      validadeToken: Duration(hours: config.jwtExpirationHours),
      publicar: BarramentoClient(config.barramentoUrl, clienteHttp).publicar,
      detalharFalhas: !config.producao,
    );

    final servidor = await shelf_io.serve(
      handler,
      InternetAddress.anyIPv4,
      config.serverPort,
    );
    stdout.writeln('User Service ouvindo em http://localhost:${servidor.port}');

    _encerrarComGentileza(servidor, pool, clienteHttp);
  } catch (erro, pilha) {
    stderr.writeln('Erro ao iniciar o User Service: $erro');
    stderr.writeln(pilha);
    exitCode = 1;
  }
}

// docker stop envia SIGTERM e espera 10 s antes de matar o processo: fecha o
// servidor e o pool nesse intervalo para não cortar requisições em andamento.
void _encerrarComGentileza(
  HttpServer servidor,
  MySQLConnectionPool pool,
  http.Client clienteHttp,
) {
  Future<void> encerrar(ProcessSignal sinal) async {
    stdout.writeln('$sinal recebido, encerrando...');
    await servidor.close();
    await pool.close();
    clienteHttp.close();
    exit(0);
  }

  ProcessSignal.sigint.watch().listen(encerrar);
  // SIGTERM não existe no Windows e observá-lo lá lança exceção.
  if (!Platform.isWindows) ProcessSignal.sigterm.watch().listen(encerrar);
}
