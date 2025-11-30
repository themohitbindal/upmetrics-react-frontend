# Design Document: API Integration

## Overview

This design document outlines the architecture and implementation approach for integrating the backend REST API into the React frontend task management application. The integration replaces dummy data with real API calls, implements JWT-based authentication with React Context, and establishes a clean folder structure following best practices.

## Architecture

The integration follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  (Pages, UI Components)                                      │
├─────────────────────────────────────────────────────────────┤
│                    React Context                             │
│  (AuthContext - global auth state)                           │
├─────────────────────────────────────────────────────────────┤
│                    API Services                              │
│  (authApi, tasksApi, categoriesApi, usersApi)               │
├─────────────────────────────────────────────────────────────┤
│                    Axios Client                              │
│  (Base config, interceptors, error handling)                │
├─────────────────────────────────────────────────────────────┤
│                    Backend API                               │
│  (http://localhost:3000)                                     │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Folder Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instance with interceptors
│   ├── auth.ts           # Authentication API functions
│   ├── tasks.ts          # Task CRUD API functions
│   ├── categories.ts     # Category API functions
│   └── users.ts          # User profile API functions
├── contexts/
│   └── AuthContext.tsx   # Authentication context provider
├── components/
│   ├── ProtectedRoute.tsx    # Route guard component
│   └── ... (existing components)
├── types/
│   ├── task.ts           # Task and Category types (existing)
│   ├── user.ts           # User types (new)
│   └── api.ts            # API response wrapper types (new)
├── pages/
│   └── ... (existing pages, updated for API)
└── ...
```

### API Client (src/api/axios.ts)

```typescript
interface AxiosConfig {
  baseURL: string           // http://localhost:3000
  headers: {
    'Content-Type': string  // application/json
  }
}

// Request interceptor: adds Authorization header if token exists
// Response interceptor: handles 401 by clearing auth and redirecting
```

### API Services

Each service module exports functions that return typed promises:

```typescript
// auth.ts
signUp(data: SignUpData, imageFile?: File): Promise<AuthResponse>
signIn(credentials: SignInData): Promise<AuthResponse>
resetPassword(email: string, password: string): Promise<MessageResponse>

// tasks.ts
getAll(categoryId?: string): Promise<TasksResponse>
getById(taskId: string): Promise<TaskResponse>
create(taskData: CreateTaskData): Promise<TaskResponse>
update(taskId: string, taskData: UpdateTaskData): Promise<TaskResponse>
delete(taskId: string): Promise<DeleteResponse>

// categories.ts
getAll(): Promise<CategoriesResponse>
create(categoryData: CreateCategoryData): Promise<CategoryResponse>

// users.ts
getById(userId: string): Promise<UserResponse>
update(userId: string, userData: UpdateUserData, imageFile?: File): Promise<UserResponse>
```

### Auth Context (src/contexts/AuthContext.tsx)

```typescript
interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignUpData, imageFile?: File) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}
```

### Protected Route Component

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
}
// Redirects to /login if not authenticated
// Shows loading spinner while checking auth state
```

## Data Models

### User Type (src/types/user.ts)

```typescript
interface User {
  _id: string
  email: string
  name?: string
  age?: number
  profileImage?: string
  createdAt: string
  updatedAt: string
}

interface SignUpData {
  email: string
  password: string
  name?: string
  age?: number
}

interface SignInData {
  email: string
  password: string
}

interface UpdateUserData {
  name?: string
  age?: number
}
```

### API Response Types (src/types/api.ts)

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
}

interface ApiListResponse<T> {
  success: boolean
  count: number
  data: T[]
}

interface AuthResponse {
  success: boolean
  token: string
  data: User
}

interface MessageResponse {
  success: boolean
  message: string
}
```

### Updated Task Type (src/types/task.ts)

```typescript
interface Task {
  _id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: string | Category  // Can be ID or populated object
  createdAt: string
  updatedAt: string
}

interface Category {
  _id: string
  name: string
  slug?: string
  isSystem?: boolean
  createdAt?: string
  updatedAt?: string
}

interface CreateTaskData {
  title: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  category: string  // Category ID
}

interface UpdateTaskData {
  title?: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  category?: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Token Attachment
*For any* API request made when a JWT token exists in localStorage, the request interceptor SHALL attach the token to the Authorization header in the format `Bearer <token>`.
**Validates: Requirements 1.2**

### Property 2: Unauthorized Response Handling
*For any* API response with status code 401, the response interceptor SHALL clear the token and user data from localStorage.
**Validates: Requirements 1.3**

### Property 3: FormData Content-Type Handling
*For any* API request where the request body is an instance of FormData, the request interceptor SHALL remove the Content-Type header from the request config.
**Validates: Requirements 1.4**

### Property 4: Logout Clears Credentials
*For any* logout action, the authentication system SHALL remove both 'token' and 'user' keys from localStorage.
**Validates: Requirements 2.4**

### Property 5: Auth State Update on Success
*For any* successful authentication (login or signup), the Auth Context SHALL update its state to reflect isAuthenticated as true and store the user data.
**Validates: Requirements 3.2**

### Property 6: Logout Resets Auth State
*For any* logout action, the Auth Context SHALL reset user to null, token to null, and isAuthenticated to false.
**Validates: Requirements 3.4**

### Property 7: Unauthenticated Route Protection
*For any* attempt to render a protected route when isAuthenticated is false, the ProtectedRoute component SHALL redirect to the login page.
**Validates: Requirements 4.1**

### Property 8: Authenticated Route Access
*For any* attempt to render a protected route when isAuthenticated is true, the ProtectedRoute component SHALL render its children.
**Validates: Requirements 4.2**

### Property 9: Auth Page Redirect
*For any* authenticated user accessing the login or signup page, the application SHALL redirect to the home page.
**Validates: Requirements 4.3**

### Property 10: Task Creation Adds to List
*For any* successful task creation API call, the returned task SHALL be added to the tasks state array.
**Validates: Requirements 5.2**

### Property 11: Task Update Reflects in List
*For any* successful task update API call, the corresponding task in the tasks state array SHALL be replaced with the updated task data.
**Validates: Requirements 5.3**

### Property 12: Task Deletion Removes from List
*For any* successful task deletion API call, the deleted task SHALL be removed from the tasks state array.
**Validates: Requirements 5.4**

### Property 13: Category Creation Adds to List
*For any* successful category creation API call, the returned category SHALL be added to the categories state array.
**Validates: Requirements 6.2**

### Property 14: Profile Update Reflects in State
*For any* successful profile update API call, the user data in Auth Context SHALL be updated with the returned user data.
**Validates: Requirements 7.2**

### Property 15: Image Upload Validation
*For any* file selected for profile image upload, the system SHALL reject files that are not images or exceed 5MB in size.
**Validates: Requirements 7.3**

## Error Handling

### API Error Structure

All API errors follow a consistent structure:
```typescript
interface ApiError {
  success: false
  message: string
}
```

### Error Handling Strategy

1. **Network Errors**: Display "Network error. Please check your connection."
2. **401 Unauthorized**: Auto-redirect to login (handled by interceptor)
3. **400 Bad Request**: Display validation error message from API
4. **404 Not Found**: Display "Resource not found" message
5. **500 Server Error**: Display "Server error. Please try again later."

### Component Error States

Each component that makes API calls maintains:
- `error: string | null` - Current error message
- `isLoading: boolean` - Loading state

## Testing Strategy

### Dual Testing Approach

The implementation uses both unit tests and property-based tests:

1. **Unit Tests**: Verify specific examples and edge cases
2. **Property-Based Tests**: Verify universal properties across all inputs

### Property-Based Testing Library

Use **fast-check** for property-based testing in TypeScript/JavaScript.

```bash
npm install --save-dev fast-check
```

### Test Configuration

- Property tests run minimum 100 iterations
- Each property test is tagged with format: `**Feature: api-integration, Property {number}: {property_text}**`

### Unit Test Coverage

- API service functions (mock axios responses)
- Auth Context state transitions
- Protected Route rendering logic
- Form validation functions
- Error message extraction

### Property Test Coverage

- Token attachment for all request types
- 401 handling for all error responses
- FormData header handling
- Logout credential clearing
- Auth state consistency
- Route protection behavior
- CRUD operation state updates
- File validation rules

### Test File Structure

```
src/
├── api/
│   └── __tests__/
│       ├── axios.test.ts
│       ├── axios.property.test.ts
│       ├── auth.test.ts
│       └── tasks.test.ts
├── contexts/
│   └── __tests__/
│       ├── AuthContext.test.tsx
│       └── AuthContext.property.test.tsx
├── components/
│   └── __tests__/
│       └── ProtectedRoute.test.tsx
└── utils/
    └── __tests__/
        └── validation.property.test.ts
```
