# Task Manager - MERN Stack Application

A full-stack Task Manager (To-Do) application built with the MERN stack featuring user authentication, CRUD operations, and advanced security features.

## 🚀 Features

### Backend Features
- ✅ **User Authentication** - JWT-based registration and login
- ✅ **Protected Routes** - Authentication middleware for all task operations
- ✅ **CRUD Operations** - Complete task management (Create, Read, Update, Delete)
- ✅ **Advanced Security** - Rate limiting, account locking, session management
- ✅ **Token Management** - Refresh tokens, device tracking, session control
- ✅ **Data Validation** - Express-validator for input validation
- ✅ **Error Handling** - Comprehensive error handling with proper status codes
- ✅ **Password Security** - Bcrypt hashing with salt rounds

### Frontend Features
- ✅ **User Authentication** - Login/Register pages with form validation
- ✅ **Protected Routes** - React Router with authentication guards
- ✅ **Task Dashboard** - View, add, edit, and delete tasks
- ✅ **State Management** - Context API for global state
- ✅ **Responsive UI** - Modern design with Tailwind CSS
- ✅ **Real-time Updates** - Optimistic updates for better UX

### Bonus Features Implemented
- 🔒 **Advanced Security**: Rate limiting, IP blocking, account locking
- 🎯 **Session Management**: Multi-device login tracking and control
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🔄 **Token Refresh**: Automatic token refresh mechanism
- 📊 **Task Statistics**: Dashboard with task completion stats
- 🔍 **Search & Filter**: Advanced task filtering and search
- 📄 **Pagination**: Efficient data loading with pagination

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Express-validator** - Input validation
- **Express-rate-limit** - Rate limiting
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   ├── utils/
│   │   └── validators.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/task-manager.git
cd task-manager/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb+srv://Pranjal1602:Pranjal1602@cluster0.ogsun33.mongodb.net/
JWT_SECRET=a6953dfdbef06d598b8557b0ae55cb7bc7ae69e182f1b896772c450dadd9219937944921363cc92450e5896dbdac98bd6ac905b5c3bf6a9d6a52c075b718774d
JWT_REFRESH_SECRET=565a0f1e161fa92f413f656c9e31df5939b44248e09b6376fd66db278ffb0a2e25c8ec040d2c8129b7c9978d47538f8ceab99f6eae463833c43d836ff378a3aa
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=12
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=development
PORT=5000

# Security Configuration
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=7200000
MAX_CONCURRENT_SESSIONS=5
```

4. **Start the backend server**
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
npm run dev
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start the frontend application**
```bash
npm start
```
Application will run on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer your-jwt-token
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-jwt-token
```

#### Logout from All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer your-jwt-token
```

#### Get Active Sessions
```http
GET /api/auth/sessions
Authorization: Bearer your-jwt-token
```

### Task Endpoints

#### Get All Tasks
```http
GET /api/tasks?page=1&limit=10&status=pending&priority=high&search=task
Authorization: Bearer your-jwt-token
```

#### Get Single Task
```http
GET /api/tasks/:id
Authorization: Bearer your-jwt-token
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the task manager app",
  "status": "pending",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "title": "Updated title",
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer your-jwt-token
```

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with access and refresh token strategy
- Password hashing using bcrypt with configurable salt rounds
- Protected routes with authentication middleware
- Token blacklisting and session management

### Rate Limiting & Protection
- API rate limiting (100 requests per 15 minutes)
- Authentication rate limiting (5 attempts per 15 minutes)
- Account locking after failed login attempts
- IP-based protection

### Data Security
- Input validation and sanitization
- MongoDB injection prevention
- XSS protection with helmet
- CORS configuration
- Environment-based secrets management

## 🚦 Usage

### User Registration & Login
1. Visit the application at `http://localhost:5173`
2. Click "Register" to create a new account
3. Fill in your details and submit
4. Login with your credentials

### Task Management
1. After login, you'll be redirected to the dashboard
2. View all your tasks in a organized layout
3. Use the "Add Task" button to create new tasks
4. Click on tasks to edit or delete them
5. Filter tasks by status, priority, or search
6. Track your task completion statistics

### Session Management
1. View all active sessions in your profile
2. Logout from specific devices
3. Logout from all devices for security

## 📦 Deployment

### Backend Deployment (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy with the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build settings:
   - Build Command: `npm run build`
   - Publish Directory: `build`
3. Add environment variables


## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: https://github.com/Pranjalshukla1602/
- Email: pranjalshukla800@gmail.com
