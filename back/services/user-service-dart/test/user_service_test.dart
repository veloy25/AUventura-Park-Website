import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:test/test.dart';
import 'package:user_service_dart/src/core/erros.dart';
import 'package:user_service_dart/src/models/user.dart';
import 'package:user_service_dart/src/services/user_service.dart';

import 'repositorio_em_memoria.dart';

const _segredo = 'segredo-de-teste';

// Hash gerado pelo bcryptjs do user-service Node para a senha "auventura".
// Prova que quem se cadastrou pelo Node continua conseguindo entrar.
const _hashDoNode =
    r'$2a$10$wAEav6R7gXtekMcMZJxhyOs8DWIuOHPmDPBEYhBK7bA9org3Mui.u';

void main() {
  late RepositorioEmMemoria repositorio;
  late List<(String, Map<String, dynamic>)> eventos;
  late UserService servico;

  UserService criar({
    Duration validade = const Duration(hours: 2),
    PublicarEvento? publicar,
    String segredo = _segredo,
  }) {
    return UserService(
      repositorio: repositorio,
      jwtSecret: segredo,
      validadeToken: validade,
      publicar:
          publicar ??
          (tipo, dados) async {
            eventos.add((tipo, dados));
          },
    );
  }

  setUp(() {
    repositorio = RepositorioEmMemoria();
    eventos = [];
    servico = criar();
  });

  group('cadastrar', () {
    test('normaliza nome e e-mail e guarda só o hash da senha', () async {
      final usuario = await servico.cadastrar(
        nome: '  Ana  ',
        email: '  ANA@Email.com ',
        senha: 'auventura',
      );

      expect(usuario.nome, 'Ana');
      expect(usuario.email, 'ana@email.com');
      expect(usuario.passwordHash, isNot('auventura'));
      expect(usuario.passwordHash, startsWith(r'$2a$'));
    });

    test('recusa campos ausentes e diz quais', () async {
      await expectLater(
        () => servico.cadastrar(nome: ' ', email: null, senha: ''),
        throwsA(
          isA<ErroValidacao>().having(
            (e) => e.campos.keys,
            'campos',
            unorderedEquals(['nome', 'email', 'senha']),
          ),
        ),
      );
    });

    test('recusa e-mail repetido, ignorando maiúsculas', () async {
      await servico.cadastrar(nome: 'Ana', email: 'ana@email.com', senha: 'a');

      await expectLater(
        () => servico.cadastrar(
          nome: 'Outra',
          email: 'ANA@email.com',
          senha: 'b',
        ),
        throwsA(isA<Conflito>()),
      );
    });

    test('publica user:created sem a senha', () async {
      final usuario = await servico.cadastrar(
        nome: 'Ana',
        email: 'ana@email.com',
        senha: 'auventura',
      );
      await Future<void>.delayed(Duration.zero);

      expect(eventos, hasLength(1));
      expect(eventos.single.$1, 'user:created');
      expect(eventos.single.$2, {
        'id': usuario.id,
        'nome': 'Ana',
        'email': 'ana@email.com',
      });
    });

    test('barramento fora do ar não impede o cadastro', () async {
      servico = criar(
        publicar: (_, _) async => throw StateError('barramento fora do ar'),
      );

      final usuario = await servico.cadastrar(
        nome: 'Ana',
        email: 'ana@email.com',
        senha: 'auventura',
      );
      await Future<void>.delayed(Duration.zero);

      expect(usuario.id, isNotNull);
    });
  });

  group('entrar', () {
    setUp(() async {
      await servico.cadastrar(
        nome: 'Ana',
        email: 'ana@email.com',
        senha: 'auventura',
      );
      eventos.clear();
    });

    test(
      'devolve token com as claims que os outros serviços esperam',
      () async {
        final login = await servico.entrar(
          email: ' ANA@email.com ',
          senha: 'auventura',
        );

        final payload =
            JWT.verify(login.token, SecretKey(_segredo)).payload
                as Map<String, dynamic>;
        expect(payload['id'], login.usuario.id);
        expect(payload['nome'], 'Ana');
        expect(payload['email'], 'ana@email.com');
        expect(payload['exp'], isA<int>());
      },
    );

    test('senha errada e e-mail inexistente dão a mesma resposta', () async {
      final erros = <String>[];
      for (final (email, senha) in [
        ('ana@email.com', 'errada'),
        ('ninguem@email.com', 'auventura'),
      ]) {
        try {
          await servico.entrar(email: email, senha: senha);
        } on NaoAutorizado catch (erro) {
          erros.add(erro.mensagem);
        }
      }

      expect(erros, [
        'E-mail ou senha invalidos.',
        'E-mail ou senha invalidos.',
      ]);
    });

    test('exige e-mail e senha', () async {
      await expectLater(
        () => servico.entrar(email: 'ana@email.com'),
        throwsA(isA<ErroValidacao>()),
      );
    });

    test('publica user:logged-in', () async {
      await servico.entrar(email: 'ana@email.com', senha: 'auventura');
      await Future<void>.delayed(Duration.zero);

      expect(eventos.single.$1, 'user:logged-in');
    });

    test('aceita senha cadastrada pelo user-service Node', () async {
      await repositorio.inserir(
        const User(
          nome: 'Legado',
          email: 'legado@email.com',
          passwordHash: _hashDoNode,
        ),
      );

      final login = await servico.entrar(
        email: 'legado@email.com',
        senha: 'auventura',
      );

      expect(login.usuario.nome, 'Legado');
    });
  });

  group('perfil', () {
    late String token;

    setUp(() async {
      await servico.cadastrar(
        nome: 'Ana',
        email: 'ana@email.com',
        senha: 'auventura',
      );
      token = (await servico.entrar(
        email: 'ana@email.com',
        senha: 'auventura',
      )).token;
    });

    test('devolve o usuário do token', () async {
      final usuario = await servico.perfil(token);

      expect(usuario.email, 'ana@email.com');
    });

    test('recusa token ausente, lixo, de outro segredo e expirado', () async {
      final deOutroSegredo = (await criar(
        segredo: 'outro',
      ).entrar(email: 'ana@email.com', senha: 'auventura')).token;
      final expirado = (await criar(
        validade: const Duration(seconds: -30),
      ).entrar(email: 'ana@email.com', senha: 'auventura')).token;

      for (final invalido in [null, 'lixo', deOutroSegredo, expirado]) {
        await expectLater(
          () => servico.perfil(invalido),
          throwsA(isA<NaoAutorizado>()),
          reason: 'token: $invalido',
        );
      }
    });

    test('usuário apagado depois do login vira NaoEncontrado', () async {
      repositorio.usuarios.clear();

      await expectLater(
        () => servico.perfil(token),
        throwsA(isA<NaoEncontrado>()),
      );
    });
  });
}
