# Base image
FROM node:16

# Set working directory
WORKDIR app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the app port
EXPOSE 5000

# Start the app
CMD ["node", "index.js"]
