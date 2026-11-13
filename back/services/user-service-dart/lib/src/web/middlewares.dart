import 'dart:io';

import 'package:shelf/shelf.dart';

import '../core/erros.dart';
import 'problem.dart';

// Única fronteira entre as exceções do domínio e o HTTP.
// Em produção [detalharFalhas] é falso: a mensagem de uma falha inesperada
// pode revelar tabelas, caminhos e versões de bibliotecas.
Middleware tratarErros({required bool detalharFalhas}) {
  return (Handler proximo) {
    return (Request requisicao) async {
      try {
        return await proximo(requisicao);
      } on ErroApp catch (erro) {
        return _traduzir(erro);
      } catch (erro, pilha) {
        stderr.writeln('Erro nao tratado: $erro\n$pilha');
        return problema(
          status: 500,
          tipo: 'falha-interna',
          titulo: 'Erro interno',
          detalhe: detalharFalhas
              ? erro.toString()
              : 'Ocorreu uma falha inesperada. Tente novamente mais tarde.',
        );
      }
    };
  };
}

Response _traduzir(ErroApp erro) {
  return switch (erro) {
    NaoEncontrado() => problema(
      status: 404,
      tipo: 'nao-encontrado',
      titulo: 'Recurso nao encontrado',
      detalhe: erro.mensagem,
    ),
    NaoAutorizado() => problema(
      status: 401,
      tipo: 'nao-autorizado',
      titulo: 'Credenciais invalidas ou ausentes',
      detalhe: erro.mensagem,
    ),
    ErroValidacao() => problema(
      status: 422,
      tipo: 'validacao',
      titulo: 'Dados invalidos',
      detalhe: erro.mensagem,
      extras: {'errors': erro.campos},
    ),
    Conflito() => problema(
      status: 409,
      tipo: 'conflito',
      titulo: 'Conflito com o estado atual',
      detalhe: erro.mensagem,
    ),
    RequisicaoInvalida() => problema(
      status: 400,
      tipo: 'requisicao-invalida',
      titulo: 'Requisicao malformada',
      detalhe: erro.mensagem,
    ),
  };
}
