FROM node:22-alpine AS build
WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json ./
RUN npm ci

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_GRPC_URL
ENV VITE_GRPC_URL=${VITE_GRPC_URL}

COPY . .

RUN npm run build

FROM nginx:1.27.4

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]