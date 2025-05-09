# Getting Started with the Camera OCR Web App

This guide will help you set up and run the Camera OCR Web Application.

## Prerequisites

1. **Node.js and npm**: Install from [nodejs.org](https://nodejs.org/) (v14.x or later)
2. **MongoDB**: Install from [mongodb.com](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
3. **Mobile device**: For testing camera functionality (iOS device recommended)

## Setting Up MongoDB

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```
   mongod --dbpath /path/to/data/db
   ```
3. By default, the app will connect to: `mongodb://localhost:27017/camera-ocr-app`

### MongoDB Atlas (Cloud Option)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Set up a new cluster and get your connection string
3. Update the `.env` file in the server directory with your MongoDB URI

## Installation

1. Run the setup script to install all dependencies:
   ```
   ./setup.sh
   ```
   
2. If the script doesn't work, you can install manually:
   ```
   # Root directory
   npm install
   
   # Client directory
   cd client && npm install
   
   # Server directory
   cd server && npm install
   ```

## Running the Application

1. Start the backend server:
   ```
   cd server
   npm start
   ```
   The server will run on port 5000 by default.

2. In a new terminal, start the frontend development server:
   ```
   cd client
   npm start
   ```
   The React app will run on port 3000 by default.

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Testing on Mobile Devices

For best results testing the camera functionality on a mobile device:

### Using Local Network
1. Find your computer's local IP address (e.g., 192.168.1.100)
2. Ensure your mobile device is on the same Wi-Fi network
3. On your mobile device, navigate to:
   ```
   http://YOUR_LOCAL_IP:3000
   ```

### Using ngrok (For Public Access)
1. Install ngrok: [ngrok.com](https://ngrok.com/download)
2. Start ngrok on port 3000:
   ```
   ngrok http 3000
   ```
3. Use the provided ngrok URL on your mobile device

## Default Admin Account

- Username: `admin`
- Password: `admin123`

## Important Notes

1. Camera access requires HTTPS in production. For testing, allow camera access when prompted.
2. iOS browsers require user interaction before accessing the camera.
3. The OpenRouter API key is already configured in the server's `.env` file.
4. In production, secure your database and API keys properly.

## Troubleshooting

1. **Camera not working**: Ensure you've granted camera permissions and are using a secure context (HTTPS)
2. **MongoDB connection issues**: Check if MongoDB is running and the connection string is correct
3. **CORS errors**: The server is configured to allow requests from the client, but may need adjustment in certain hosting scenarios

For any other issues, check the server and client console logs for detailed error messages.
