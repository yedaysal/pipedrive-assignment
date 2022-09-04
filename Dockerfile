FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY . .
RUN npm install axios body-parser cron dotenv ejs express mongoose morgan nodemon winston

EXPOSE 8080
CMD [ "node", "app.js" ]