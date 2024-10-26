# Stage development
FROM node:22.2.0-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN npx prisma generate

# Stage production
FROM node:22.2.0-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache make gcc g++ python3

# Copy only the necessary files
COPY package*.json ./
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/src/prisma/schema.prisma ./src/prisma/schema.prisma

# Install bcrypt and other dependencies
RUN npm install bcrypt --build-from-source 
RUN npm install --only=production

CMD ["node", "dist/main"]
