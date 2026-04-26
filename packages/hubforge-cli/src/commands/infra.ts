import path from 'node:path';
import { getFlagValue } from '../lib/args.js';
import { writeTextFile } from '../lib/fs.js';
import { getExecutionCwd } from '../lib/runtime.js';

export async function runInfraCommand(args: string[]): Promise<void> {
  const target = getFlagValue(args, '--target') ?? 'compose';
  if (target !== 'k8s') {
    throw new Error("Unsupported infra target. Use: hubforge infra --target k8s");
  }

  const cwd = getExecutionCwd();
  const base = path.join(cwd, 'infra', 'k8s');

  await writeTextFile(path.join(base, 'namespace.yaml'), namespaceYaml());
  await writeTextFile(path.join(base, 'api-deployment.yaml'), apiDeploymentYaml());
  await writeTextFile(path.join(base, 'portal-deployment.yaml'), portalDeploymentYaml());
  await writeTextFile(path.join(base, 'ui-deployment.yaml'), uiDeploymentYaml());
  await writeTextFile(path.join(base, 'redis-statefulset.yaml'), redisStatefulSetYaml());
  await writeTextFile(path.join(base, 'nats-statefulset.yaml'), natsStatefulSetYaml());
  await writeTextFile(path.join(base, 'postgres-statefulset.yaml'), postgresStatefulSetYaml());

  console.log('[hubforge] Generated Kubernetes manifests under ./infra/k8s');
}

function namespaceYaml(): string {
  return `apiVersion: v1
kind: Namespace
metadata:
  name: hubforge
`;
}

function apiDeploymentYaml(): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hubforge-api
  namespace: hubforge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-api
  template:
    metadata:
      labels:
        app: hubforge-api
    spec:
      containers:
        - name: api
          image: ghcr.io/futureedgepro/hubforge-api:latest
          ports:
            - containerPort: 4000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: hubforge-secrets
                  key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: hubforge-api
  namespace: hubforge
spec:
  selector:
    app: hubforge-api
  ports:
    - port: 4000
      targetPort: 4000
`;
}

function portalDeploymentYaml(): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hubforge-portal
  namespace: hubforge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-portal
  template:
    metadata:
      labels:
        app: hubforge-portal
    spec:
      containers:
        - name: portal
          image: ghcr.io/futureedgepro/hubforge-portal:latest
          ports:
            - containerPort: 3001
---
apiVersion: v1
kind: Service
metadata:
  name: hubforge-portal
  namespace: hubforge
spec:
  selector:
    app: hubforge-portal
  ports:
    - port: 3001
      targetPort: 3001
`;
}

function uiDeploymentYaml(): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hubforge-ui
  namespace: hubforge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-ui
  template:
    metadata:
      labels:
        app: hubforge-ui
    spec:
      containers:
        - name: ui
          image: ghcr.io/futureedgepro/hubforge-ui:latest
          ports:
            - containerPort: 3010
---
apiVersion: v1
kind: Service
metadata:
  name: hubforge-ui
  namespace: hubforge
spec:
  selector:
    app: hubforge-ui
  ports:
    - port: 3010
      targetPort: 3010
`;
}

function redisStatefulSetYaml(): string {
  return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: hubforge-redis
  namespace: hubforge
spec:
  serviceName: hubforge-redis
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-redis
  template:
    metadata:
      labels:
        app: hubforge-redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: hubforge-redis
  namespace: hubforge
spec:
  selector:
    app: hubforge-redis
  ports:
    - port: 6379
      targetPort: 6379
`;
}

function natsStatefulSetYaml(): string {
  return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: hubforge-nats
  namespace: hubforge
spec:
  serviceName: hubforge-nats
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-nats
  template:
    metadata:
      labels:
        app: hubforge-nats
    spec:
      containers:
        - name: nats
          image: nats:2
          args: ["-js"]
          ports:
            - containerPort: 4222
            - containerPort: 8222
---
apiVersion: v1
kind: Service
metadata:
  name: hubforge-nats
  namespace: hubforge
spec:
  selector:
    app: hubforge-nats
  ports:
    - name: client
      port: 4222
      targetPort: 4222
    - name: monitor
      port: 8222
      targetPort: 8222
`;
}

function postgresStatefulSetYaml(): string {
  return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: hubforge-postgres
  namespace: hubforge
spec:
  serviceName: hubforge-postgres
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-postgres
  template:
    metadata:
      labels:
        app: hubforge-postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: hubforge
            - name: POSTGRES_USER
              value: hubforge
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: hubforge-secrets
                  key: postgres-password
---
apiVersion: v1
kind: Service
metadata:
  name: hubforge-postgres
  namespace: hubforge
spec:
  selector:
    app: hubforge-postgres
  ports:
    - port: 5432
      targetPort: 5432
`;
}