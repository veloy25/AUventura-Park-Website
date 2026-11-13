# Arquitetura e desenvolvimento dos microsserviços

Este documento descreve os serviços de backend do AUventura Park, suas responsabilidades, portas e rotas públicas. Para iniciar toda a aplicação, siga o [README principal](../README.md).

## Visão geral

O API Gateway recebe as chamadas do frontend e as encaminha aos serviços por HTTP. O MySQL é compartilhado pelos serviços Node e pelo User Service em Dart.

| Serviço | Implementação usada no Compose e no Kubernetes | Porta | Responsabilidade |
| --- | --- | ---: | --- |
| API Gateway | Node.js / Express | 3000 | Entrada HTTP e roteamento |
| User Service | Dart / Shelf | 3001 | Cadastro, login e perfil |
| Depoimentos Service | Node.js / Express | 3002 | Depoimentos |
| Agendamentos Service | Node.js / Express | 3003 | Agendamentos e horários |
| Pets Service | Node.js / Express | 3004 | Cadastro e gerenciamento de pets |
| Daycare Service | Node.js / Express | 3005 | Vagas e estadias na creche |
| Contato Service | Node.js / Express | 3006 | Mensagens de contato |
| Notificações Service | Node.js / Express | 3007 | Consumo de eventos e notificações |
| Barramento de eventos | Dart / Shelf | 10000 | Distribuição de eventos via HTTP |

As implementações Node.js do User Service e do barramento também permanecem em `services/user-service/` e `services/barramento-service/`. O script de desenvolvimento Node (`npm run dev`) inicia essas versões Node; o Docker Compose e os manifests Kubernetes usam as implementações em Dart.

## Comunicação e eventos

O Gateway encaminha as rotas `/api/...` ao serviço correspondente. Os serviços publicam eventos em `POST /eventos` no barramento, que os distribui por HTTP aos assinantes configurados.

Eventos encaminhados ao serviço de notificações:

- `user:created` — novo usuário cadastrado.
- `agendamento:created` — novo agendamento criado.
- `daycare:created` — entrada na creche registrada.

O User Service também publica `user:logged-in`; atualmente esse evento não tem assinante configurado. A implementação Dart do barramento guarda os últimos 1.000 eventos em memória e os disponibiliza em `GET /eventos`, opcionalmente filtrados por `?tipo=...`. O histórico é volátil: reiniciar o serviço o apaga. Falhas ao enviar para um assinante são registradas, sem impedir o envio aos demais.

## Rotas públicas no API Gateway

O Gateway está disponível em `http://localhost:3000`. As rotas abaixo refletem os endpoints definidos em `services/api-gateway/index.js`.

| Método | Rota | Serviço |
| --- | --- | --- |
| GET | `/` | Status da API |
| GET | `/health` | Health check do Gateway |
| POST | `/api/signup` | Usuários |
| POST | `/api/login` | Usuários |
| GET | `/api/me` | Usuários |
| GET, POST | `/api/depoimentos` | Depoimentos |
| GET | `/api/depoimentos/:id` | Depoimentos |
| GET, POST | `/api/agendamentos` | Agendamentos |
| GET | `/api/agendamentos/horarios-ocupados` | Agendamentos |
| GET, POST | `/api/pets` | Pets |
| DELETE | `/api/pets/:id` | Pets |
| GET | `/api/daycare/verificar-day-teste/:petId` | Daycare |
| GET | `/api/daycare/vagas` | Daycare |
| POST | `/api/daycare/agendar` | Daycare |
| GET, POST | `/api/contatos` | Contato |
| GET | `/api/notificacoes` | Notificações |
| GET | `/api/notificacoes/nao-lidas` | Notificações |
| PATCH | `/api/notificacoes/:id/lida` | Notificações |
| DELETE | `/api/notificacoes/:id` | Notificações |

As rotas que usam autenticação recebem o cabeçalho `Authorization: Bearer <token>`; o Gateway repassa esse cabeçalho ao serviço correspondente.

## Executar o backend

### Docker Compose (recomendado)

Na raiz do repositório, configure o `.env` usando `.env.example` e execute:

```bash
docker compose up --build -d
docker compose ps
```

O Compose usa o MySQL, o Gateway e os microsserviços definidos em `compose.yaml`. O User Service e o barramento são compilados a partir dos projetos Dart; os demais serviços de aplicação são Node.js. Consulte o [README principal](../README.md) para detalhes de credenciais, frontend e encerramento.

### Desenvolvimento com os serviços Node

O comando `npm run dev` inicia os serviços Node, inclusive as implementações Node do User Service e do barramento. Use-o como alternativa de desenvolvimento, não junto ao stack completo na mesma porta.

```bash
cd back
npm ci
npm run dev
```

Configure `back/.env` com os dados do MySQL, `JWT_SECRET`, portas dos serviços e URLs de comunicação entre eles. O MySQL precisa estar disponível antes de iniciar os serviços.

## Testes dos serviços Dart

Os projetos Dart exigem Dart SDK 3.13.5 ou superior. Para executar os testes do User Service:

```bash
cd back/services/user-service-dart
dart pub get
dart test
```

Para testar o barramento:

```bash
cd back/services/barramento-service-dart
dart pub get
dart test
```

Mais detalhes do contrato, configuração e execução do User Service estão no [README do serviço](services/user-service-dart/README.md).
