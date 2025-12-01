# Upmetrics React Frontend

This is the frontend application for Upmetrics, built with React, TypeScript, and Vite. It provides a modern, responsive user interface for the Upmetrics platform.

## 🛠️ Tech Stack

This project uses the following key technologies and libraries:

- **Core Framework**: [React](https://react.dev/) (v18)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State/Auth Persistence**: [js-cookie](https://github.com/js-cookie/js-cookie)
- **Linting**: ESLint

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v16 or higher recommended).
- **npm**: Usually comes with Node.js.

### Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd upmetrics-react-frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will typically start at `http://localhost:5173`.

## ⚙️ Configuration

The application configuration, such as API endpoints, is currently managed in the source code.

- **API Configuration**: Check `src/lib/api/constants.ts` to configure the backend API URL (e.g., switching between `localhost` and a production server).

## 📜 Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production to the `dist` folder.
-   `npm run preview`: Locally previews the production build.
-   `npm run lint`: Runs ESLint to check for code quality issues.
-   `npm run dev:host`: Runs the dev server and exposes it to the network (accessible via IP).

## 📂 Project Structure

-   `src/components`: Reusable UI components.
-   `src/pages`: Page components corresponding to routes.
-   `src/contexts`: React Context definitions (e.g., AuthContext).
-   `src/lib`: Utility libraries and API services.
-   `src/config`: Configuration files (e.g., routes).
-   `public`: Static assets.
