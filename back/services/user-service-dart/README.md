# User Service (Dart)

Cadastro, login e perfil de usuários do AUventura Park, em Dart com `shelf`. Substitui o `user-service` Node no Docker Compose mantendo o mesmo contrato, então o API Gateway, o app Flutter e o front React continuam funcionando sem mudança.

## Rotas

O gateway expõe estas rotas como `/api/signup`, `/api/login` e `/api/me`.

| Método | Rota | Sucesso | Erros |
|---|---|---|---|
| POST | `/signup` | 201 `{id, nome, email}` | 409 e-mail repetido, 422 campos ausentes, 400 JSON inválido |
| POST | `/login` | 200 `{token, user}` | 401 credenciais inválidas, 422 campos ausentes |
| GET | `/me` | 200 `{user}` (header `Authorization: Bearer <token>`) | 401 token ausente/inválido/expirado, 404 usuário não existe mais |
| GET | `/health/live` | 200 | |
| GET | `/health/ready` | 200 | 503 sem banco |

Erros seguem a RFC 9457 (`application/problem+json`) e trazem também o campo `error`, que é o que os clientes atuais leem.

O token é um JWT HS256 com `{id, nome, email}`, assinado com `JWT_SECRET`. Os outros serviços o validam com o mesmo segredo.

## Estrutura

```
lib/src/
  api.dart           monta as peças (injeção de dependência à mão)
  config/            variáveis de ambiente validadas e pool MySQL
  core/erros.dart    erros de domínio
  models/            User
  repositories/      contrato e implementação MySQL
  services/          regras de cadastro, login e perfil
  controllers/       tradução HTTP <-> serviço
  web/               problem+json e tratamento de erros
  clients/           cliente do barramento de eventos
```

## Como rodar

Exige Dart 3.13.5 ou superior e o MySQL do projeto no ar (`docker compose up -d db`, que publica `127.0.0.1:3306`).

```bash
cd back/services/user-service-dart
cp .env.example .env   # defina DB_PASSWORD e JWT_SECRET
dart pub get
dart run bin/user_service_dart.dart
```

Pelo Docker Compose (na raiz do repositório), ele já sobe como `user-service`:

```bash
docker compose up -d --build user-service
```

O serviço não cria tabelas: a tabela `users` é criada pelo `initializeDatabase` dos serviços Node.

## Testes

```bash
dart test
```

Cobrem a regra de negócio com um repositório em memória, as rotas por HTTP e a compatibilidade com senhas cadastradas pelo `bcryptjs` do Node.
