# AUventura Park

O AUventura Park é uma plataforma para tutores e equipe de uma creche para cães. O projeto oferece aplicações web e mobile conectadas a uma API composta por microsserviços.

## Funcionalidades

- Cadastro, login e consulta do perfil do usuário.
- Cadastro e gerenciamento de pets.
- Consulta de serviços, horários e agendamentos.
- Consulta de vagas e agendamento de daycare.
- Publicação e consulta de depoimentos.
- Envio de mensagens de contato.
- Consulta e gerenciamento de notificações.

## Tecnologias

- **Web:** React 19, Vite 8 e Bootstrap.
- **Mobile:** Flutter e Dart.
- **Backend:** Node.js, Express e microsserviços em Dart com Shelf.
- **Banco de dados:** MySQL 8.4.
- **Execução:** Docker Compose e Kubernetes.

## Arquitetura

O API Gateway recebe as requisições da aplicação na porta `3000` e as encaminha aos serviços internos.

| Componente | Implementação | Responsabilidade |
| --- | --- | --- |
| API Gateway | Node.js / Express | Entrada HTTP e roteamento para os serviços |
| User Service | Dart / Shelf | Cadastro, login e perfil dos usuários |
| Depoimentos Service | Node.js / Express | Depoimentos |
| Agendamentos Service | Node.js / Express | Agendamentos e horários |
| Pets Service | Node.js / Express | Cadastro e gerenciamento de pets |
| Daycare Service | Node.js / Express | Vagas e estadias na creche |
| Contato Service | Node.js / Express | Mensagens enviadas pelo formulário |
| Notificações Service | Node.js / Express | Notificações dos usuários |
| Barramento de eventos | Dart / Shelf | Distribuição de eventos entre serviços |
| Banco de dados | MySQL | Persistência dos dados |

O User Service em Dart mantém o contrato HTTP e o formato de JWT compatíveis com o serviço anterior em Node.js. O barramento também tem uma implementação em Node.js mantida no repositório; os ambientes Docker Compose e Kubernetes usam as versões em Dart. O barramento distribui eventos por HTTP e mantém em memória até 1.000 eventos recentes; esse histórico não é persistido e se perde quando o serviço reinicia.

## Requisitos

- Docker Desktop ou Docker Engine com Docker Compose.
- Node.js 22.12 ou superior e npm para executar o frontend web.
- Flutter e Dart 3.13.5 ou superior para executar o aplicativo mobile ou desenvolver os serviços Dart localmente.

## Executar com Docker Compose

Execute os comandos a seguir na raiz do repositório.

### 1. Configurar as variáveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

No macOS, Linux ou Git Bash:

```bash
cp .env.example .env
```

Edite o `.env` e substitua os valores demonstrativos de `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` e `JWT_SECRET`. Não compartilhe nem versione esse arquivo.

### 2. Iniciar o backend e o banco de dados

```bash
docker compose up --build -d
docker compose ps
```

O Compose inicia o MySQL, o API Gateway e os microsserviços. Para acompanhar os logs:

```bash
docker compose logs -f
```

O Gateway fica disponível em `http://localhost:3000`. A rota `/health` verifica a saúde da API; os recursos são acessados por rotas `/api/...`, por exemplo `http://localhost:3000/api/depoimentos`. O MySQL fica disponível na máquina local em `127.0.0.1:3306` e os dados persistem no volume `mysql_data`.

> O Compose lê o `.env` da raiz do repositório. Alterar `DB_PASSWORD` não muda a senha de uma instalação MySQL já inicializada no volume `mysql_data`.

### 3. Iniciar o frontend web

Em outro terminal:

```bash
cd front
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`. O proxy do Vite encaminha as chamadas `/api` ao Gateway em `http://localhost:3000`.

### 4. Iniciar o aplicativo mobile

Com o backend em execução, use outro terminal:

```bash
cd front_mobile
flutter pub get
flutter run
```

No emulador Android, o app acessa o computador anfitrião pelo endereço `http://10.0.2.2:3000`. Em outras plataformas, o endereço configurado é `http://localhost:3000`.

### Encerrar os serviços

Na raiz do repositório:

```bash
docker compose down
```

Para remover também os dados persistidos do banco:

```bash
docker compose down -v
```

> `docker compose down -v` apaga o volume MySQL e todos os dados armazenados nele.

## Testes e verificações

Frontend web:

```bash
cd front
npm run lint
npm run build
```

Aplicativo mobile:

```bash
cd front_mobile
flutter test
```

User Service em Dart:

```bash
cd back/services/user-service-dart
dart pub get
dart test
```

Barramento em Dart:

```bash
cd back/services/barramento-service-dart
dart pub get
dart test
```

## Estrutura do repositório

```text
.
├── back/
│   ├── services/
│   │   ├── api-gateway/
│   │   ├── user-service-dart/
│   │   ├── barramento-service-dart/
│   │   └── *-service/             # Demais microsserviços Node.js
│   └── shared/
├── front/                         # Aplicação web React
├── front_mobile/                  # Aplicativo Flutter
├── K8s/                           # Manifests e instruções para Kubernetes
├── compose.yaml
└── README.md
```

## Documentação

- [Arquitetura e rotas dos microsserviços](back/MICROSERVICES.md)
- [Execução local com Kubernetes](K8s/README.md)
- [User Service em Dart](back/services/user-service-dart/README.md)
