# Project Documentation for FT_Transcendence

## Project Overview
FT_Transcendence is a chat application designed to facilitate real-time communication among users. It utilizes modern web technologies to provide a seamless and interactive experience.

## Tech Stack
- **Language**: TypeScript (98.6%)
- **Framework**: Node.js with Express
- **Database**: PostgreSQL
- **Real-time Communication**: Socket.IO
- **Frontend**: React.js

## Database Schema
```
User {
  id: UUID,
  username: String,
  email: String,
  password: String,
  createdAt: Date,
  updatedAt: Date
}

Message {
  id: UUID,
  senderId: UUID,
  receiverId: UUID,
  content: String,
  timestamp: Date
}

ChatRoom {
  id: UUID,
  name: String,
  participants: Array<UUID>
}
```

## Chat Module Documentation with Socket.IO Events
- **Connection Event**: `socket.on('connect', callback)` - called when a user connects to the server.
- **Message Sending**: `socket.emit('message', { senderId, content })` - sends a message to the server.
- **Receive Messages**: `socket.on('message', callback)` - receives a message from the server.
- **User Typing**: `socket.emit('typing', { userId })` - indicates that a user is typing a message.
- **Disconnect Event**: `socket.on('disconnect', callback)` - called when a user disconnects from the server.

## Validation Schemas
- **User Registration**: Validate username, email, and password.
- **Message Content**: Validate message length and formatting.

## Usage Examples
```javascript
// Sending a message
socket.emit('message', { senderId: user.id, content: 'Hello!' });

// Handling incoming messages
socket.on('message', (message) => {
  console.log(`Received message: ${message.content}`);
});
```

## Security Features
- **Data Encryption**: Passwords hashed using bcrypt.
- **Input Validation**: Sanitizing inputs to prevent SQL injection and XSS.
- **Authentication**: JSON Web Tokens (JWT) for secure user authentication.

## Getting Started Guide
1. Clone the repository: `git clone https://github.com/anass-hajjaji/ft_transcendence.git`
2. Navigate to the project directory: `cd ft_transcendence`
3. Install dependencies: `npm install`
4. Run the application: `npm start`

## API Endpoints
- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Authenticate user and return JWT.
- **GET /api/messages**: Retrieve messages for a user.
- **POST /api/messages**: Send a new message.
- **GET /api/chatrooms**: Get user chat rooms.
