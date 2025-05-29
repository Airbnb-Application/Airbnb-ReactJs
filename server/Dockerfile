# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package.json và package-lock.json nếu có (để tận dụng cache, không bắt buộc phải có)
COPY package*.json ./

# Cài đặt dependencies production (bỏ qua dev)
RUN npm install --omit=dev

# Copy toàn bộ source code
COPY . .

EXPOSE 8080

CMD ["npm", "start"]