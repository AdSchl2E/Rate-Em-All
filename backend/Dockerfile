FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including dev dependencies) for build
RUN npm install

COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 
