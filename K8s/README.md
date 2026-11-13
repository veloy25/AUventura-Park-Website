# Kubernetes local

Os manifests desta pasta iniciam o MySQL, o API Gateway e os microsserviços do AUventura Park no namespace `auventura`. O User Service e o barramento usam imagens Dart próprias; os demais serviços de aplicação usam a imagem Node `auventura/backend:local`.

## Requisitos

- Um cluster Kubernetes local em execução (por exemplo, o Kubernetes do Docker Desktop).
- `kubectl` configurado para acessar esse cluster.
- Docker para construir as imagens.

Os manifests usam imagens locais com `imagePullPolicy: Never`, sem registry. O cluster precisa enxergar as imagens construídas; em ambientes que não compartilham o armazenamento de imagens do Docker, importe as imagens para o runtime do cluster.

## 1. Criar as credenciais

Copie o arquivo de exemplo e altere os valores antes de criar o Secret:

```powershell
Copy-Item .\K8s\.env.example .\K8s\.env
```

No macOS, Linux ou Git Bash:

```bash
cp K8s/.env.example K8s/.env
```

Defina valores próprios para `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` e `JWT_SECRET`. Não versione nem compartilhe `K8s/.env`.

Crie o namespace e o Secret:

```bash
kubectl apply -f K8s/namespace.yaml
kubectl create secret generic auventura-secrets --namespace auventura --from-env-file=K8s/.env
```

O Secret precisa existir antes de iniciar o banco e os serviços. Se ele já existir e você precisar atualizá-lo:

```bash
kubectl create secret generic auventura-secrets --namespace auventura --from-env-file=K8s/.env --dry-run=client -o yaml | kubectl apply -f -
```

## 2. Construir as imagens

Execute os comandos na raiz do repositório:

```bash
docker build -t auventura/backend:local ./back
docker build -t auventura/user-service-dart:local ./back/services/user-service-dart
docker build -t auventura/barramento-dart:local ./back/services/barramento-service-dart
```

Reconstrua a imagem correspondente após alterar um serviço. Como as imagens usam a tag `:local` e `imagePullPolicy: Never`, não há busca em registry.

## 3. Aplicar os manifests

Na raiz do repositório, aplique os recursos nesta ordem:

```bash
kubectl apply -f K8s/mysql.yaml
kubectl apply -f K8s/notificacoes-service.yaml
kubectl apply -f K8s/barramento-service.yaml
kubectl apply -f K8s/user-service.yaml
kubectl apply -f K8s/depoimentos-service.yaml
kubectl apply -f K8s/agendamentos-service.yaml
kubectl apply -f K8s/pets-service.yaml
kubectl apply -f K8s/daycare-service.yaml
kubectl apply -f K8s/contato-service.yaml
kubectl apply -f K8s/api-gateway.yaml
```

Confira Pods e Services:

```bash
kubectl get pods,services -n auventura
```

Espere os Pods ficarem prontos. Os probes do User Service verificam `/health/live` e `/health/ready`; o barramento usa `/health`.

## 4. Acessar a API

O Service `api-gateway` é do tipo `LoadBalancer`. Em clusters locais como Docker Desktop, normalmente fica disponível em `http://localhost:3000`. Confira o endereço atribuído pelo cluster:

```bash
kubectl get service api-gateway -n auventura
```

O health check do Gateway está em `http://localhost:3000/health`. As rotas da aplicação usam o prefixo `/api/`, por exemplo `POST /api/signup`. Consulte [MICROSERVICES.md](../back/MICROSERVICES.md) para a lista de rotas.

Para conferir a inicialização do User Service:

```bash
kubectl logs deployment/user-service -n auventura
```

## Atualizar um serviço

Depois de reconstruir a imagem alterada, reinicie o Deployment correspondente. Por exemplo:

```bash
docker build -t auventura/user-service-dart:local ./back/services/user-service-dart
kubectl rollout restart deployment/user-service -n auventura
kubectl rollout status deployment/user-service -n auventura
```

Para um serviço Node, reconstrua `auventura/backend:local` e reinicie o Deployment dele.

## Alternar entre Kubernetes e Docker Compose

Ambos expõem o API Gateway na porta `localhost:3000`; execute um ambiente por vez. Para liberar a porta antes de iniciar o Compose:

```bash
kubectl scale deployment --all --replicas=0 -n auventura
kubectl delete service api-gateway -n auventura
```

Então inicie o Compose na raiz do projeto:

```bash
docker compose up -d
```

Para voltar ao Kubernetes, pare o Compose e reaplique os manifests conforme a ordem indicada acima.
