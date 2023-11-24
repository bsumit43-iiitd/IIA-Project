FROM node:18.7.0-alpine

COPY . /recipedb2
WORKDIR /recipedb2/
EXPOSE 3001
RUN npm i
RUN npm run build
RUN npm install -g serve

CMD ["serve", "-s", "-l", "3001", "dist/"]

