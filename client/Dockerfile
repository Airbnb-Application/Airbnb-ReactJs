# ========================
# ⚙️ Build stage
# ========================
FROM node:20-alpine AS builder

# Cài công cụ build để tránh lỗi native module (rollup)
RUN apk add --no-cache python3 make g++

# Enable yarn nếu dùng corepack
RUN corepack enable

WORKDIR /app

# Copy yarn.lock và package.json
COPY package.json yarn.lock ./

# Cài dependencies
RUN yarn install --frozen-lockfile

# Copy toàn bộ source
COPY . .

# Build production
RUN yarn build

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