# Stage 1: Build
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Build arg for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
