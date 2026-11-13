// Erros que a regra de negócio lança e que só a camada web traduz para HTTP.
// Sendo sealed, o compilador obriga o tradutor a tratar todos os casos.
sealed class ErroApp implements Exception {
  const ErroApp(this.mensagem);

  final String mensagem;

  @override
  String toString() => '$runtimeType: $mensagem';
}

final class NaoEncontrado extends ErroApp {
  const NaoEncontrado(super.mensagem);
}

final class NaoAutorizado extends ErroApp {
  const NaoAutorizado(super.mensagem);
}

final class Conflito extends ErroApp {
  const Conflito(super.mensagem);
}

final class RequisicaoInvalida extends ErroApp {
  const RequisicaoInvalida(super.mensagem);
}

final class ErroValidacao extends ErroApp {
  const ErroValidacao(super.mensagem, {this.campos = const {}});

  final Map<String, String> campos;
}
