# ========================
# ⚙️ Build stage
# ========================
FROM node:20-alpine3.18 AS builder

# Cài công cụ build để tránh lỗi native module (rollup)
RUN apk update && \
    apk add --no-cache python3 make g++ build-base

WORKDIR /app

# Copy package.json
COPY package.json ./

# Sử dụng npm install thay vì npm ci
RUN npm install

# Copy toàn bộ source
COPY . .

# Build production bằng npm
RUN npm run build

# ========================
# 🚀 Production stage
# ========================
FROM nginx:stable-alpine

# Copy build output từ stage builder vào nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Thay config nginx nếu có
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở port 80
EXPOSE 80

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"]