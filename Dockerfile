FROM node:22-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
ENV VITE_API_BASE=/api
ENV VITE_WS_BASE=/ws
RUN npm run build

FROM node:22-slim AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend ./
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY backend/package*.json ./backend/
RUN npm ci --prefix backend --omit=dev

COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

RUN mkdir -p storage/reports storage/decks storage/forge

EXPOSE 8080
CMD ["node", "backend/dist/index.js"]
