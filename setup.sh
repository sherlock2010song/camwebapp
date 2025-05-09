#!/bin/bash

# Camera OCR Web App Setup Script

echo "🚀 Setting up Camera OCR Web Application..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the server: cd server && npm start"
echo "2. In a new terminal, start the client: cd client && npm start"
echo ""
echo "The web application will be available at http://localhost:3000"
