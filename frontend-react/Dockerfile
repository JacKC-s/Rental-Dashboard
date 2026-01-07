FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
CMD ["npm", "run", "build"]

# Copies files into nginx (file server) -> good practise for deployment
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html