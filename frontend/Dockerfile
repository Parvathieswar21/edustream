FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies and build
COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
