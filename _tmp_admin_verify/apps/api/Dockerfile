FROM node:20-alpine
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @hubforge/api run build
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
