# ft_transcendence Project Documentation

## Summary

ft_transcendence is a full-stack web platform that combines real-time chat, social features, and multiplayer gaming in a single experience. It brings together user accounts, friend management, game sessions, and live messaging so users can connect, compete, and communicate seamlessly.

## Project Overview

This repository is a group project built collaboratively. My contributions focused on the real-time chat module and the translator module.

## Tech Stack

- **Frontend:** TypeScript 98.6%, React
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Real-Time Communication:** Socket.IO

## Database Schema

### Users Table
- **user_id:** Integer (Primary Key)
- **username:** Varchar(50)
- **email:** Varchar(100)
- **password_hash:** Varchar(255)

### Friends Table
- **user_id:** Integer (Foreign Key)
- **friend_id:** Integer (Foreign Key)
- **created_at:** Timestamp

### Game Table
- **game_id:** Integer (Primary Key)
- **user_id:** Integer (Foreign Key)
- **game_status:** Varchar(50)
- **created_at:** Timestamp

### Chat Table
- **chat_id:** Integer (Primary Key)
- **user_id:** Integer (Foreign Key)
- **message_count:** Integer
- **created_at:** Timestamp

### Message Table
- **message_id:** Integer (Primary Key)
- **chat_id:** Integer (Foreign Key)
- **sender_id:** Integer (Foreign Key)
- **content:** Text
- **created_at:** Timestamp

### Blocked Users Table
- **user_id:** Integer (Foreign Key)
- **blocked_user_id:** Integer (Foreign Key)

## Chat Module Documentation

### Socket.IO Events
- **message:** Triggers when a message is sent in a chat.
- **join:** Emitted when a user joins a chat.
- **leave:** Emitted when a user leaves a chat.
- **typing:** Indicates that a user is typing a message.

### Validation Schemas
- All inputs are validated using Yup to ensure data integrity.

### Security Features
- JWT (JSON Web Tokens) for user authentication and session management.
- Rate limiting on API endpoints to prevent abuse.
- Data sanitization to prevent XSS and SQL injection attacks.

## Getting Started
1. **Clone the repo:** `git clone https://github.com/anass-hajjaji/ft_transcendence.git`
2. **Install dependencies:** `npm install`
3. **Run the application:** `npm start`
4. **Open your browser and navigate to:** `http://localhost:3000`

## API Endpoints
- `POST /api/users`: Create a new user.
- `POST /api/auth/login`: Authenticate user and return token.
- `GET /api/chats/:chatId`: Retrieve chat messages.


## Features
- Real-time messaging using Socket.IO.
- Translator module for multilingual communication.
- User authentication and authorization.
- Friend management system.
- Complete gaming functionalities.

## Author Information
- **Name:** Anass Hajjaji
- **GitHub:** [anass-hajjaji](https://github.com/anass-hajjaji)
