import 'env.dart';

// Organiza e valida as configurações usadas pelo User Service.
// Concentra porta, banco, JWT e barramento em um único objeto.
class AppConfig {
  const AppConfig({
    required this.appEnv,
    required this.serverPort,
    required this.logLevel,
    required this.dbHost,
    required this.dbPort,
    required this.dbName,
    required this.dbUser,
    required this.dbPassword,
    required this.dbPoolSize,
    required this.jwtSecret,
    required this.jwtExpirationHours,
    required this.barramentoUrl,
  });

  // Configurações gerais da aplicação.
  final String appEnv;
  final int serverPort;
  final String logLevel;

  // Configurações do banco.
  final String dbHost;
  final int dbPort;
  final String dbName;
  final String dbUser;
  final String dbPassword;
  final int dbPoolSize;

  // Configurações de autenticação.
  final String jwtSecret;
  final int jwtExpirationHours;

  // Endereço do barramento de eventos.
  final String barramentoUrl;

  bool get producao => appEnv == 'production';

  // Cria a configuração usando as variáveis de ambiente.
  // Também valida valores importantes antes do serviço iniciar.
  factory AppConfig.fromEnv() {
    final config = AppConfig(
      appEnv: Env.opcional(
        'APP_ENV',
        'development',
      ),

      serverPort: Env.inteiro(
        'SERVER_PORT',
        3001,
      ),

      logLevel: Env.opcional(
        'LOG_LEVEL',
        'info',
      ),

      dbHost: Env.obrigatoria(
        'DB_HOST',
      ),

      dbPort: Env.inteiro(
        'DB_PORT',
        3306,
      ),

      dbName: Env.obrigatoria(
        'DB_NAME',
      ),

      dbUser: Env.obrigatoria(
        'DB_USER',
      ),

      dbPassword: Env.obrigatoria(
        'DB_PASSWORD',
      ),

      dbPoolSize: Env.inteiro(
        'DB_POOL_SIZE',
        10,
      ),

      jwtSecret: Env.obrigatoria(
        'JWT_SECRET',
      ),

      jwtExpirationHours: Env.inteiro(
        'JWT_EXPIRATION_HOURS',
        2,
      ),

      barramentoUrl: Env.opcional(
        'BARRAMENTO_URL',
        'http://localhost:10000',
      ),
    );

    if (config.serverPort < 1 ||
        config.serverPort > 65535) {
      throw StateError(
        'SERVER_PORT fora da faixa válida: '
        '${config.serverPort}',
      );
    }

    if (config.dbPoolSize < 1) {
      throw StateError(
        'DB_POOL_SIZE deve ser pelo menos 1.',
      );
    }

    return config;
  }

  // Mostra a configuração sem exibir senha
  @override
  String toString() {
    return 'AppConfig('
        'appEnv: $appEnv, '
        'serverPort: $serverPort, '
        'db: $dbUser@$dbHost:$dbPort/$dbName, '
        'pool: $dbPoolSize, '
        'barramento: $barramentoUrl'
        ')';
  }
}