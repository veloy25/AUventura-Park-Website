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

O `user-service` e o `barramento-service` são implementados em Dart e têm imagem própria. Construa as duas também:

```sh
docker build -t auventura/user-service-dart:local ./back/services/user-service-dart
docker build -t auventura/barramento-dart:local ./back/services/barramento-service-dart
```

Os Deployments usam imagens `:local` com `imagePullPolicy: Never`, sem registry local. Os demais serviços usam `auventura/backend:local` (Node). Após modificar um serviço, reconstrua a imagem dele e reinicie o Deployment para os Pods usarem a nova versão:

```sh
kubectl rollout restart deployment/user-service -n auventura
```

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


## Conferir que o Dart está no ar

O `user-service` e o `barramento-service` têm probes de saúde (`/health/live` e `/health/ready` no primeiro, `/health` no segundo). Os Pods só ficam `READY 1/1` depois que respondem:

```sh
kubectl get pods -n auventura
kubectl logs deployment/user-service -n auventura
```

O log do `user-service` mostra `User Service ouvindo em http://localhost:3001`. Para testar de ponta a ponta, cadastre e entre pelo gateway:

```sh
curl -X POST http://localhost:3000/api/signup -H 'content-type: application/json' -d '{"nome":"Teste","email":"teste@k8s.local","senha":"troque"}'
curl -X POST http://localhost:3000/api/login -H 'content-type: application/json' -d '{"email":"teste@k8s.local","senha":"troque"}'
```

## Kubernetes e Docker Compose na mesma máquina

Os dois publicam o gateway em `localhost:3000`, então só um pode estar de pé por vez. Para voltar ao Compose, zere os Deployments e remova o Service do gateway (o `LoadBalancer` continua ocupando a porta mesmo sem Pods):

```sh
kubectl scale deployment --all --replicas=0 -n auventura
kubectl delete service api-gateway -n auventura
```

Para voltar ao Kubernetes, pare o Compose (`docker compose stop`) e reaplique os manifests; o `kubectl apply` recria o Service e restaura as réplicas.
