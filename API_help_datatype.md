# API Integration Guide for Frontend

## Overview
This document provides complete instructions for integrating the Task Management Backend API into your frontend application using Axios. The backend is a RESTful API built with Node.js/Express that requires JWT authentication for protected routes.

## Backend Configuration

**Base URL:** `http://localhost:3000` (or your configured backend port)

**API Documentation:** `http://localhost:3000/api-docs` (Swagger UI)

## Setup Instructions

### 1. Install Axios
```bash
npm install axios
# or
yarn add axios
```

### 2. Create Axios Instance with Authentication

Create a file `src/api/axios.js` (or similar path in your project):

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or your token storage method
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Token Management

After successful login/signup, store the token:
```javascript
// After successful authentication
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.data));
```

---

## API Endpoints Reference

### Authentication APIs (Public - No Token Required)

#### 1. Sign Up (Register New User)
- **Endpoint:** `POST /api/auth/signup`
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",          // optional
    "age": 28,                    // optional
    "profileImage": "https://example.com/avatar.jpg"  // optional
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "data": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "age": 28,
      "profileImage": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400`: Bad request (validation error, user already exists)
  - Response: `{ "success": false, "message": "error message" }`

#### 2. Sign In (Login)
- **Endpoint:** `POST /api/auth/signin`
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "data": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "age": 28,
      "profileImage": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400`: Bad request (validation error)
  - `401`: Invalid credentials
  - Response: `{ "success": false, "message": "error message" }`

#### 3. Reset Password
- **Endpoint:** `POST /api/auth/reset-password`
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "newpassword123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```
- **Error Responses:**
  - `400`: Bad request (validation error)
  - `404`: User not found
  - Response: `{ "success": false, "message": "error message" }`

---

### Task APIs (Protected - Token Required)

**All task endpoints require JWT token in Authorization header:**
```
Authorization: Bearer <your_jwt_token>
```

#### 4. Get All Tasks
- **Endpoint:** `GET /api/tasks`
- **Authentication:** Required
- **Query Parameters (optional):**
  - `categoryId`: Filter tasks by category ID
  - Example: `/api/tasks?categoryId=665f1f77bcf86cd799439022`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "task_id",
        "title": "Complete project documentation",
        "description": "Write comprehensive documentation",
        "status": "pending",
        "priority": "medium",
        "category": {
          "_id": "category_id",
          "name": "Work",
          "slug": "work",
          "isSystem": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```
- **Error Responses:**
  - `401`: Unauthorized (missing/invalid token)
  - `500`: Server error

#### 5. Get Single Task
- **Endpoint:** `GET /api/tasks/:id`
- **Authentication:** Required
- **URL Parameters:**
  - `id`: Task ID
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "task_id",
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation",
      "status": "pending",
      "priority": "medium",
      "category": {
        "_id": "category_id",
        "name": "Work",
        "slug": "work",
        "isSystem": true
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401`: Unauthorized
  - `404`: Task not found
  - `500`: Server error

#### 6. Create Task
- **Endpoint:** `POST /api/tasks`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "title": "Complete project documentation",  // required, max 200 chars
    "description": "Write comprehensive documentation",  // optional, max 1000 chars
    "status": "pending",  // optional: "pending" | "in-progress" | "completed", default: "pending"
    "priority": "medium",  // optional: "low" | "medium" | "high", default: "medium"
    "category": "665f1f77bcf86cd799439022"  // required, category ID (ObjectId)
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "task_id",
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation",
      "status": "pending",
      "priority": "medium",
      "category": "category_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400`: Bad request (validation error, invalid category)
  - `401`: Unauthorized

#### 7. Update Task
- **Endpoint:** `PUT /api/tasks/:id`
- **Authentication:** Required
- **URL Parameters:**
  - `id`: Task ID
- **Request Body (all fields optional, but at least one required):**
  ```json
  {
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in-progress",  // "pending" | "in-progress" | "completed"
    "priority": "high",  // "low" | "medium" | "high"
    "category": "665f1f77bcf86cd799439022"  // category ID
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "task_id",
      "title": "Updated task title",
      "description": "Updated description",
      "status": "in-progress",
      "priority": "high",
      "category": {
        "_id": "category_id",
        "name": "Work",
        "slug": "work"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400`: Bad request (validation error, invalid category)
  - `401`: Unauthorized
  - `404`: Task not found

#### 8. Delete Task
- **Endpoint:** `DELETE /api/tasks/:id`
- **Authentication:** Required
- **URL Parameters:**
  - `id`: Task ID
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Task deleted successfully",
    "data": {
      "_id": "task_id",
      "title": "Task title",
      ...
    }
  }
  ```
- **Error Responses:**
  - `401`: Unauthorized
  - `404`: Task not found
  - `500`: Server error

---

### Category APIs (Protected - Token Required)

#### 9. Get All Categories
- **Endpoint:** `GET /api/categories`
- **Authentication:** Required
- **Success Response (200):**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "category_id",
        "name": "Work",
        "slug": "work",
        "isSystem": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "category_id_2",
        "name": "Personal",
        "slug": "personal",
        "isSystem": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```
- **Error Responses:**
  - `401`: Unauthorized
  - `500`: Server error

#### 10. Create Category
- **Endpoint:** `POST /api/categories`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "name": "Health tasks",  // required, max 100 chars, unique
    "slug": "health-tasks"   // required, unique, lowercase
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "category_id",
      "name": "Health tasks",
      "slug": "health-tasks",
      "isSystem": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400`: Bad request (validation error, duplicate name/slug)
  - `401`: Unauthorized

**Note:** Update and Delete operations are NOT allowed for categories (returns 405 Method Not Allowed).

---

### User APIs (Protected - Token Required)

#### 11. Get User Profile
- **Endpoint:** `GET /api/users/:id`
- **Authentication:** Required
- **URL Parameters:**
  - `id`: User ID (typically the logged-in user's ID)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "age": 28,
      "profileImage": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401`: Unauthorized
  - `404`: User not found

#### 12. Update User Profile
- **Endpoint:** `PUT /api/users/:id`
- **Authentication:** Required
- **URL Parameters:**
  - `id`: User ID
- **Request Body (all fields optional, email cannot be updated):**
  ```json
  {
    "name": "Updated Name",
    "age": 30,
    "profileImage": "https://example.com/new-avatar.jpg"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "user_id",
      "email": "user@example.com",  // unchanged
      "name": "Updated Name",
      "age": 30,
      "profileImage": "https://example.com/new-avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400`: Bad request (validation error, email update attempted)
  - `401`: Unauthorized
  - `404`: User not found

---

## Implementation Example

### Create API Service Files

#### `src/api/auth.js`
```javascript
import api from './axios';

export const authAPI = {
  signUp: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },

  signIn: async (credentials) => {
    const response = await api.post('/api/auth/signin', credentials);
    return response.data;
  },

  resetPassword: async (email, newPassword) => {
    const response = await api.post('/api/auth/reset-password', {
      email,
      password: newPassword,
    });
    return response.data;
  },
};
```

#### `src/api/tasks.js`
```javascript
import api from './axios';

export const tasksAPI = {
  getAll: async (categoryId = null) => {
    const url = categoryId 
      ? `/api/tasks?categoryId=${categoryId}` 
      : '/api/tasks';
    const response = await api.get(url);
    return response.data;
  },

  getById: async (taskId) => {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },

  update: async (taskId, taskData) => {
    const response = await api.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
  },

  delete: async (taskId) => {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data;
  },
};
```

#### `src/api/categories.js`
```javascript
import api from './axios';

export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  },
};
```

#### `src/api/users.js`
```javascript
import api from './axios';

export const usersAPI = {
  getById: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  update: async (userId, userData) => {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  },
};
```

---

## Integration Steps

1. **Replace all dummy data** in your components with API calls
2. **Implement authentication flow:**
   - Sign up/Sign in forms → call auth APIs → store token
   - Add protected route wrapper that checks for token
   - Redirect to login if token is missing/invalid

3. **Replace task data:**
   - Load tasks on component mount using `tasksAPI.getAll()`
   - Create task form → `tasksAPI.create()`
   - Update task → `tasksAPI.update()`
   - Delete task → `tasksAPI.delete()`
   - Filter by category → `tasksAPI.getAll(categoryId)`

4. **Replace category data:**
   - Load categories on mount → `categoriesAPI.getAll()`
   - Use category IDs when creating/updating tasks

5. **Replace user data:**
   - Load user profile → `usersAPI.getById(userId)`
   - Update profile → `usersAPI.update(userId, data)`

6. **Add loading states** for all API calls
7. **Add error handling** with user-friendly messages
8. **Handle token expiration** (401 errors) by redirecting to login

---

## Important Notes

- **Task Status Values:** `"pending"`, `"in-progress"`, `"completed"`
- **Task Priority Values:** `"low"`, `"medium"`, `"high"`
- **Category is required** when creating a task
- **Email cannot be updated** in user profile
- **Categories cannot be updated or deleted** (only read and create)
- **All protected routes require JWT token** in Authorization header
- **Token format:** `Bearer <token>` (automatically handled by axios interceptor)
- **Response structure:** All successful responses have `success: true` and `data` field
- **Error structure:** All errors have `success: false` and `message` field

---

## Testing Checklist

- [ ] Sign up creates user and stores token
- [ ] Sign in authenticates and stores token
- [ ] Protected routes work with valid token
- [ ] 401 errors redirect to login
- [ ] Tasks can be created, read, updated, deleted
- [ ] Tasks can be filtered by category
- [ ] Categories can be fetched and created
- [ ] User profile can be fetched and updated
- [ ] Loading states show during API calls
- [ ] Error messages display properly
- [ ] Token persists across page refreshes

---

## Example Usage in React Component

```javascript
import { useState, useEffect } from 'react';
import { tasksAPI } from './api/tasks';
import { categoriesAPI } from './api/categories';

function TasksList() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, categoriesRes] = await Promise.all([
        tasksAPI.getAll(selectedCategory),
        categoriesAPI.getAll(),
      ]);
      setTasks(tasksRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await tasksAPI.create(taskData);
      setTasks([response.data, ...tasks]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

---

**End of Integration Guide**

