# Implementation Plan

- [x] 1. Set up API infrastructure and types





  - [x] 1.1 Create TypeScript types for API responses and user data


    - Create `src/types/user.ts` with User, SignUpData, SignInData, UpdateUserData interfaces
    - Create `src/types/api.ts` with ApiResponse, ApiListResponse, AuthResponse, MessageResponse interfaces
    - Update `src/types/task.ts` with CreateTaskData, UpdateTaskData interfaces
    - _Requirements: 9.1, 9.2_
  - [x] 1.2 Create Axios client with interceptors


    - Create `src/api/axios.ts` with base URL `http://localhost:3000`
    - Implement request interceptor to attach JWT token from localStorage
    - Implement request interceptor to handle FormData Content-Type
    - Implement response interceptor to handle 401 errors
    - Add comment marking where to replace base URL for production
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.3 Write property tests for Axios interceptors

    - **Property 1: Token Attachment** - Test token is attached for all requests when present
    - **Property 2: Unauthorized Response Handling** - Test 401 clears credentials
    - **Property 3: FormData Content-Type Handling** - Test Content-Type removed for FormData
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [x] 2. Implement API service modules





  - [x] 2.1 Create authentication API service


    - Create `src/api/auth.ts` with signUp, signIn, resetPassword functions
    - Handle FormData for signup with profile image
    - Return typed AuthResponse and MessageResponse
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Create tasks API service


    - Create `src/api/tasks.ts` with getAll, getById, create, update, delete functions
    - Support optional categoryId filter for getAll
    - Return typed TasksResponse and TaskResponse
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 2.3 Create categories API service


    - Create `src/api/categories.ts` with getAll, create functions
    - Return typed CategoriesResponse and CategoryResponse
    - _Requirements: 6.1, 6.2_
  - [x] 2.4 Create users API service


    - Create `src/api/users.ts` with getById, update functions
    - Handle FormData for profile image upload
    - Return typed UserResponse
    - _Requirements: 7.1, 7.2_
  - [x] 2.5 Write unit tests for API services


    - Test auth API functions with mocked axios
    - Test tasks API functions with mocked axios
    - Test categories API functions with mocked axios
    - Test users API functions with mocked axios
    - _Requirements: 2.1, 2.2, 5.1, 5.2, 6.1, 7.1_

- [x] 3. Implement authentication context and routing





  - [x] 3.1 Create Auth Context provider


    - Create `src/contexts/AuthContext.tsx` with AuthProvider and useAuth hook
    - Implement login, signup, logout, updateUser methods
    - Restore session from localStorage on mount
    - Provide isAuthenticated, user, token, isLoading state
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 2.4_
  - [x] 3.2 Write property tests for Auth Context


    - **Property 4: Logout Clears Credentials** - Test logout removes token and user from localStorage
    - **Property 5: Auth State Update on Success** - Test successful auth updates context state
    - **Property 6: Logout Resets Auth State** - Test logout resets all auth state
    - **Validates: Requirements 2.4, 3.2, 3.4**
  - [x] 3.3 Create ProtectedRoute component


    - Create `src/components/ProtectedRoute.tsx`
    - Redirect to /login if not authenticated
    - Show loading spinner while checking auth
    - Render children if authenticated
    - _Requirements: 4.1, 4.2_
  - [x] 3.4 Write property tests for ProtectedRoute


    - **Property 7: Unauthenticated Route Protection** - Test redirect when not authenticated
    - **Property 8: Authenticated Route Access** - Test children render when authenticated
    - **Validates: Requirements 4.1, 4.2**
  - [x] 3.5 Update App.tsx with AuthProvider and protected routes


    - Wrap app with AuthProvider
    - Protect /home and /profile routes with ProtectedRoute
    - Add redirect from auth pages when already logged in
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 3.6 Write property test for auth page redirect


    - **Property 9: Auth Page Redirect** - Test authenticated users redirected from login/signup
    - **Validates: Requirements 4.3**

- [x] 4. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
-

- [x] 5. Integrate authentication pages with API




  - [x] 5.1 Update Login page to use API


    - Import useAuth hook and call login method
    - Add loading state to disable button during submission
    - Add error state to display API error messages
    - Navigate to /home on successful login
    - _Requirements: 2.2, 2.5, 8.1, 8.2, 8.3_
  - [x] 5.2 Update Signup page to use API


    - Import useAuth hook and call signup method
    - Add profile image file input with preview
    - Add loading and error states
    - Navigate to /home on successful signup
    - _Requirements: 2.1, 2.5, 7.3, 8.1, 8.2, 8.3_
  - [x] 5.3 Update ForgotPassword page to use API


    - Import resetPassword from auth API
    - Add new password field for password reset
    - Add loading and error states
    - Show success message on completion
    - _Requirements: 2.3, 2.5, 8.1, 8.2, 8.3_
  - [x] 5.4 Write property test for image upload validation


    - **Property 15: Image Upload Validation** - Test file type and size validation
    - **Validates: Requirements 7.3**

- [x] 6. Integrate Home page with task and category APIs



  - [x] 6.1 Update Home page to fetch tasks and categories from API


    - Replace dummy data imports with API calls
    - Fetch categories and tasks on component mount
    - Add loading state while fetching
    - Add error state for failed fetches
    - _Requirements: 5.1, 6.1, 8.1, 8.2, 8.4_
  - [x] 6.2 Update task creation to use API


    - Call tasksApi.create in handleSaveTask for new tasks
    - Update local state with returned task data
    - Handle and display errors
    - _Requirements: 5.2, 5.5_

  - [x] 6.3 Update task update to use API
    - Call tasksApi.update in handleSaveTask for existing tasks
    - Update local state with returned task data
    - Handle and display errors
    - _Requirements: 5.3, 5.5_

  - [x] 6.4 Update task deletion to use API
    - Call tasksApi.delete in handleDeleteTask
    - Remove task from local state on success
    - Handle and display errors
    - _Requirements: 5.4, 5.5_
  - [x] 6.5 Write property tests for task CRUD operations



    - **Property 10: Task Creation Adds to List** - Test new task added to state
    - **Property 11: Task Update Reflects in List** - Test updated task replaces old in state
    - **Property 12: Task Deletion Removes from List** - Test deleted task removed from state
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [x] 7. Integrate User Profile page with API





  - [x] 7.1 Update UserProfile page to fetch and display user data


    - Get user ID from Auth Context
    - Fetch user profile on mount using usersApi.getById
    - Display user data in form fields
    - Add loading state while fetching
    - _Requirements: 7.1, 7.4, 8.1, 8.4_
  - [x] 7.2 Implement profile update with image upload

    - Add profile image file input with preview
    - Validate image file type and size before upload
    - Call usersApi.update with FormData
    - Update Auth Context with new user data
    - Add loading and error states
    - _Requirements: 7.2, 7.3, 7.5, 8.1, 8.2, 8.3_
  - [x] 7.3 Write property test for profile update


    - **Property 14: Profile Update Reflects in State** - Test user data updated in context
    - **Validates: Requirements 7.2**

- [x] 8. Add Header logout functionality






  - [x] 8.1 Update Header component with logout and user display

    - Import useAuth hook
    - Display user name or email in header
    - Add logout button that calls logout method
    - Show user profile image if available
    - _Requirements: 2.4, 3.3_

- [x] 9. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
