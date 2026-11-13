# User Service em Dart

Serviço de cadastro, login e perfil de usuários do AUventura Park, implementado em Dart com Shelf. No Docker Compose e no Kubernetes, esta implementação atende o nome `user-service` e mantém compatibilidade com o contrato HTTP e os tokens JWT esperados pelos demais serviços.

## Rotas

O serviço atende às rotas abaixo; pelo API Gateway, use o prefixo `/api`.

| Método | Rota do serviço | Sucesso | Principais erros |
| --- | --- | --- | --- |
| POST | `/signup` | 201 `{"id": 42, "nome": "Ana", "email": "ana@example.com"}` | 400 JSON inválido, 409 e-mail já cadastrado, 422 campos obrigatórios |
| POST | `/login` | 200 `{"token": "<JWT>", "user": {"id": 42, "nome": "Ana", "email": "ana@example.com"}}` | 401 credenciais inválidas, 422 campos obrigatórios |
| GET | `/me` | 200 `{"user": {"id": 42, "nome": "Ana", "email": "ana@example.com"}}` | 401 token ausente/inválido/expirado, 404 usuário inexistente |
| GET | `/health/live` | 200 | — |
| GET | `/health/ready` | 200 | 503 quando o banco não está disponível |

Para consultar `/me`, envie `Authorization: Bearer <token>`. Os erros seguem o formato `application/problem+json` e incluem também o campo `error`, utilizado pelos clientes atuais.

Os tokens são JWT HS256 com as claims `id`, `nome` e `email`, assinados com `JWT_SECRET`. O segredo e as claims devem ser compatíveis com os serviços que validam o token. O tempo de expiração padrão é de duas horas.

## Arquitetura

O serviço separa as responsabilidades em camadas:

```text
lib/src/
  api.dart            composição e injeção de dependências
  config/             variáveis de ambiente e configuração do MySQL
  core/               erros de domínio
  models/             modelo de usuário
  repositories/       contratos e persistência MySQL
  services/           regras de cadastro, login e perfil
  controllers/        tradução entre HTTP e serviços
  web/                middlewares, respostas e tratamento de erros
  clients/            publicação de eventos no barramento
bin/
  user_service_dart.dart
test/
```

## Configuração

O serviço carrega variáveis do ambiente e, para execução local, do `.env` no diretório atual.

| Variável | Obrigatória | Padrão / finalidade |
| --- | --- | --- |
| `APP_ENV` | Não | `development` |
| `SERVER_PORT` | Não | `3001` |
| `LOG_LEVEL` | Não | `info` |
| `DB_HOST` | Sim | Host do MySQL |
| `DB_PORT` | Não | `3306` |
| `DB_NAME` | Sim | Nome do banco |
| `DB_USER` | Sim | Usuário do banco |
| `DB_PASSWORD` | Sim | Senha do banco |
| `DB_POOL_SIZE` | Não | `10` conexões |
| `JWT_SECRET` | Sim | Segredo de assinatura dos tokens |
| `JWT_EXPIRATION_HOURS` | Não | `2` horas |
| `BARRAMENTO_URL` | Não | `http://localhost:10000` |

Não publique o `.env` nem valores reais de credenciais. O serviço não cria o schema do banco: a tabela `users` deve existir antes de iniciar.

## Executar com Docker Compose

Na raiz do repositório, configure o `.env` conforme o [README principal](../../../README.md). Para iniciar este serviço e suas dependências:

```bash
docker compose up -d --build user-service
```

O Compose inicia também os serviços necessários, incluindo MySQL e barramento. Para subir o sistema completo:

```bash
docker compose up --build -d
```

## Executar localmente

É necessário ter Dart SDK 3.13.5 ou superior, um MySQL acessível com a tabela `users` criada e, para publicar eventos, um barramento acessível pela URL definida em `BARRAMENTO_URL`. O MySQL do Compose publica a porta em `127.0.0.1:3306`; ajuste `DB_HOST`, `DB_PASSWORD` e `JWT_SECRET` no `.env` local conforme o ambiente.

Na pasta `back/services/user-service-dart`:

```powershell
Copy-Item .env.example .env
```

No macOS, Linux ou Git Bash:

```bash
cp .env.example .env
```

Em seguida, instale as dependências e execute:

```bash
dart pub get
dart run bin/user_service_dart.dart
```

Se o barramento estiver indisponível, cadastro e login continuam funcionando; a falha ao publicar eventos é registrada pelo serviço.

## Testes

```bash
dart pub get
dart test
```

Os testes cobrem regras de negócio com repositório em memória, rotas HTTP e compatibilidade de senhas com o `bcryptjs` usado pela implementação Node.
