import 'package:dotenv/dotenv.dart';

// Centraliza os acessos ao .env para facilitar a padronização.
// Recebe valores do .env local e também variáveis do Docker/sistema.
class Env {
  Env._();

  static final DotEnv _env =
      DotEnv(includePlatformEnvironment: true)..load();

  // Lê uma variável obrigatória.
  // Se não existir ou estiver vazia, interrompe a inicialização.
  static String obrigatoria(String chave) {
    final valor = _env[chave];

    if (valor == null || valor.trim().isEmpty) {
      throw StateError(
        'Variável de ambiente obrigatória ausente: $chave',
      );
    }

    return valor.trim();
  }

  // Lê uma variável opcional.
  // Caso não exista, utiliza o valor padrão informado.
  static String opcional(
    String chave,
    String padrao,
  ) {
    final valor = _env[chave];

    return (valor == null || valor.trim().isEmpty)
        ? padrao
        : valor.trim();
  }

  // Lê uma variável inteira.
  // Caso não exista, utiliza o valor padrão informado.
  static int inteiro(
    String chave,
    int padrao,
  ) {
    final bruto = _env[chave];

    if (bruto == null || bruto.trim().isEmpty) {
      return padrao;
    }

    final valor = int.tryParse(bruto.trim());

    if (valor == null) {
      throw StateError(
        'A variável $chave deve ser um número inteiro: "$bruto"',
      );
    }

    return valor;
  }
}