FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

# Added arguments for nginx
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .
RUN npm run build

# Copies files into nginx (file server) -> good practise for deployment
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html