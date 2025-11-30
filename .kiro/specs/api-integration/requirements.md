# Requirements Document

## Introduction

This document specifies the requirements for integrating a RESTful backend API into the existing React frontend task management application. The integration will replace all dummy data with real API calls, implement JWT-based authentication, and add proper state management for user sessions, tasks, and categories. The backend runs on `http://localhost:3000` and provides endpoints for authentication, tasks, categories, and user management.

## Glossary

- **API Client**: An Axios instance configured with base URL, interceptors for authentication, and error handling
- **JWT Token**: JSON Web Token used for authenticating protected API requests
- **Auth Context**: React context providing authentication state and methods across the application
- **Protected Route**: A route that requires valid authentication to access
- **Task**: A work item with title, description, status, priority, and category
- **Category**: A grouping mechanism for tasks (e.g., Development, Design, Marketing)
- **User**: An authenticated account with profile information including email, name, age, and profile image

## Requirements

### Requirement 1: API Client Setup

**User Story:** As a developer, I want a centralized API client configuration, so that all API calls use consistent authentication and error handling.

#### Acceptance Criteria

1. WHEN the application initializes THEN the API Client SHALL be configured with base URL `http://localhost:3000` and default JSON content type headers
2. WHEN an authenticated request is made THEN the API Client SHALL automatically attach the JWT token from localStorage to the Authorization header
3. WHEN a 401 Unauthorized response is received THEN the API Client SHALL clear stored credentials and redirect the user to the login page
4. WHEN a request contains FormData THEN the API Client SHALL remove the Content-Type header to allow browser-set multipart boundaries
5. WHEN an API error occurs THEN the API Client SHALL return a standardized error object containing the error message from the response

### Requirement 2: User Authentication

**User Story:** As a user, I want to sign up, sign in, and reset my password, so that I can securely access my tasks.

#### Acceptance Criteria

1. WHEN a user submits valid signup credentials (email, password, optional name, age, profile image) THEN the Authentication System SHALL create the account and store the returned JWT token and user data in localStorage
2. WHEN a user submits valid login credentials THEN the Authentication System SHALL authenticate the user and store the returned JWT token and user data in localStorage
3. WHEN a user requests password reset with a valid email THEN the Authentication System SHALL update the password and display a success message
4. WHEN a user logs out THEN the Authentication System SHALL clear the JWT token and user data from localStorage and redirect to the login page
5. WHEN authentication fails THEN the Authentication System SHALL display the error message returned by the API

### Requirement 3: Authentication State Management

**User Story:** As a developer, I want centralized authentication state, so that components can access user data and auth status consistently.

#### Acceptance Criteria

1. WHEN the application loads THEN the Auth Context SHALL check localStorage for existing token and user data to restore the session
2. WHEN a user successfully authenticates THEN the Auth Context SHALL update the global authentication state with user data and logged-in status
3. WHEN a component needs authentication status THEN the Auth Context SHALL provide isAuthenticated, user data, and loading state
4. WHEN a user logs out THEN the Auth Context SHALL reset the authentication state to unauthenticated

### Requirement 4: Protected Routes

**User Story:** As a user, I want protected pages to require authentication, so that my data remains secure.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access a protected route THEN the Protected Route component SHALL redirect to the login page
2. WHEN an authenticated user accesses a protected route THEN the Protected Route component SHALL render the requested page
3. WHEN an authenticated user accesses the login or signup page THEN the application SHALL redirect to the home page

### Requirement 5: Task Management

**User Story:** As a user, I want to create, view, update, and delete tasks, so that I can manage my work items.

#### Acceptance Criteria

1. WHEN the home page loads THEN the Task System SHALL fetch all tasks from the API and display them organized by category
2. WHEN a user creates a new task with title, description, status, priority, and category THEN the Task System SHALL send a POST request and add the returned task to the display
3. WHEN a user updates an existing task THEN the Task System SHALL send a PUT request and update the task in the display with the returned data
4. WHEN a user deletes a task THEN the Task System SHALL send a DELETE request and remove the task from the display
5. WHEN a task API operation fails THEN the Task System SHALL display the error message to the user

### Requirement 6: Category Management

**User Story:** As a user, I want to view and create categories, so that I can organize my tasks into logical groups.

#### Acceptance Criteria

1. WHEN the home page loads THEN the Category System SHALL fetch all categories from the API and use them as task board columns
2. WHEN a user creates a new category with name and slug THEN the Category System SHALL send a POST request and add the returned category to the display
3. WHEN category data is loading THEN the Category System SHALL display a loading indicator

### Requirement 7: User Profile Management

**User Story:** As a user, I want to view and update my profile, so that I can manage my account information.

#### Acceptance Criteria

1. WHEN the profile page loads THEN the User System SHALL fetch the current user's profile data from the API
2. WHEN a user updates their profile (name, age, profile image) THEN the User System SHALL send a PUT request with FormData and update the displayed profile
3. WHEN a user uploads a profile image THEN the User System SHALL validate the file is an image under 5MB before uploading
4. WHEN profile data is loading THEN the User System SHALL display a loading indicator
5. WHEN a profile update fails THEN the User System SHALL display the error message to the user

### Requirement 8: Loading and Error States

**User Story:** As a user, I want visual feedback during API operations, so that I know when data is loading or when errors occur.

#### Acceptance Criteria

1. WHEN an API request is in progress THEN the UI SHALL display appropriate loading indicators
2. WHEN an API request fails THEN the UI SHALL display a user-friendly error message
3. WHEN form submission is in progress THEN the submit button SHALL be disabled and show loading state
4. WHEN data is successfully loaded THEN the UI SHALL remove loading indicators and display the data

### Requirement 9: Type Safety

**User Story:** As a developer, I want TypeScript interfaces for all API responses, so that the codebase has proper type checking.

#### Acceptance Criteria

1. WHEN API response types are defined THEN the Type System SHALL include interfaces for User, Task, Category, and all API response wrappers
2. WHEN API service functions are implemented THEN the Type System SHALL provide proper return types for all functions
3. WHEN components consume API data THEN the Type System SHALL enforce correct property access through TypeScript interfaces
