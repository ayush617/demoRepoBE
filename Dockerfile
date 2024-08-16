# Use the official Node.js image as the base
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your app's code
COPY . .

# Expose port 3000
EXPOSE 3000

# Define the command to run your app
CMD ["node", "index.js"]
