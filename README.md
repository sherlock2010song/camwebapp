# Camera OCR Web Application

A web application that allows users to capture images using a mobile camera and perform OCR (Optical Character Recognition) using AI through OpenRouter API.

## Features

- Mobile camera integration (optimized for iOS)
- OCR processing using OpenRouter AI API (google/gemini-2.0-flash)
- User authentication (username/password)
- Cross-device text sharing
- Admin account for management

## Setup

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
3. Configure environment variables in `.env` files
4. Start development servers:
   ```
   # Start backend server
   cd server && npm start
   
   # Start frontend development server
   cd client && npm start
   ```

### Environment Variables

Create `.env` files in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/camera-ocr-app
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Usage

1. Access the web application on your mobile device
2. Log in with your credentials
3. Capture images using the camera
4. View the OCR-processed text
5. Copy the text on any of your devices
