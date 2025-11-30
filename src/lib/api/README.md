# API Integration Structure

This directory contains the API integration setup using Axios following best practices.

## Structure

```
src/lib/api/
├── axios.ts              # Axios instance with interceptors
├── constants.ts           # API endpoints and base URL
├── types.ts              # API response types
├── index.ts              # Barrel export
└── services/
    ├── authService.ts    # Authentication API calls
    ├── taskService.ts    # Task API calls
    ├── categoryService.ts # Category API calls
    └── userService.ts    # User profile API calls
```

## Usage

### 1. Import Services

```typescript
import { authService, taskService, categoryService, userService } from '@/lib/api'
```

### 2. Using Services

```typescript
// Example: Login
try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'password123'
  })
  
  if (response.success) {
    localStorage.setItem('authToken', response.data.token)
    // Handle success
  }
} catch (error) {
  // Handle error (already transformed by interceptor)
  console.error(error.message)
}

// Example: Get Tasks
try {
  const response = await taskService.getTasks({ category: 'categoryId' })
  if (response.success) {
    const tasks = response.data
    // Use tasks
  }
} catch (error) {
  console.error(error.message)
}
```

### 3. Using Custom Hook

```typescript
import { useApi } from '@/hooks/useApi'
import { taskService } from '@/lib/api'

function MyComponent() {
  const { data, loading, error, execute } = useApi()

  const fetchTasks = async () => {
    try {
      await execute(() => taskService.getTasks())
    } catch (err) {
      // Error handled by hook
    }
  }

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <div>{/* Render data */}</div>}
    </div>
  )
}
```

## Features

### Request Interceptor
- Automatically adds `Authorization` header with Bearer token from localStorage
- Token key: `authToken`

### Response Interceptor
- Transforms responses to return `response.data` directly
- Handles common HTTP errors (401, 403, 404, 500)
- Automatically clears token on 401 (unauthorized)
- Transforms errors to consistent `ApiError` format

### Error Handling
All errors are transformed to:
```typescript
{
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

The API base URL defaults to `http://localhost:3000/api` if not set.

## Adding New Services

1. Create a new service file in `services/` directory
2. Define types and interfaces
3. Export service functions
4. Add to `index.ts` for easy importing

Example:
```typescript
// services/exampleService.ts
import apiClient from '../axios'
import { API_ENDPOINTS } from '../constants'
import type { ApiResponse } from '../types'

export const exampleService = {
  getExample: async (): Promise<ApiResponse<Example>> => {
    return (await apiClient.get(API_ENDPOINTS.EXAMPLE.BASE)) as unknown as ApiResponse<Example>
  }
}
```

## Next Steps

1. Update API endpoints in `constants.ts` to match your backend
2. Replace dummy data with actual API calls in components
3. Add loading states and error handling in UI
4. Implement token refresh logic if needed
5. Add request/response logging for debugging

