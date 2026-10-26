# Kubernetes local

## Preparar as credenciais

Copie `.env.example` para `.env` nesta pasta e defina `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` e `JWT_SECRET`. O arquivo `.env` está no `.gitignore`.

Depois de criar o namespace, crie o Secret:

```sh
kubectl apply -f K8s/namespace.yaml
kubectl create secret generic auventura-secrets --namespace auventura --from-env-file=K8s/.env
```

O Secret precisa existir antes de iniciar o MySQL e os serviços que o utilizam.

## Construir a imagem local

O Docker Desktop deste ambiente usa o armazenamento de imagens `containerd`. Na raiz do projeto, construa a imagem antes de aplicar os Deployments:

```sh
docker build -t auventura/backend:local ./back
```

Os Deployments usam a imagem `auventura/backend:local` com `imagePullPolicy: Never`, sem registry local. Após modificar o backend, reconstrua a imagem e reinicie os Deployments para os Pods usarem a nova versão.

## Aplicar os recursos

Na raiz do projeto, aplique os arquivos nesta ordem. Os Services do Kubernetes resolvem as dependências pelo nome; o Deployment reinicia os Pods se uma dependência ainda estiver iniciando.

```sh
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

Verifique Pods e Services:

```sh
kubectl get pods,services -n auventura
```

O Service `api-gateway` usa `LoadBalancer`, que o Docker Desktop publica no host. Confira o endereço e a porta:

```sh
kubectl get service api-gateway -n auventura
```

Então acesse `http://localhost:3000`. O PVC `mysql-data` mantém os dados do MySQL entre recriações do Pod, desde que o cluster local preserve os volumes.
