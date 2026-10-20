FROM node:20-alpine

WORKDIR /app

# .npmrc enables legacy-peer-deps (some deps still declare React <=18 peers)
COPY package*.json .npmrc ./
RUN npm install

COPY . .

EXPOSE 3000

# Development server (hot reload); use `npm run build` for a production bundle
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
