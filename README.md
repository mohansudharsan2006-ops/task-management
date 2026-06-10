# Task Management App

A simple task management application with a frontend and backend.

## Project structure

- `frontend/` - static HTML, CSS, and JavaScript for the client side
- `backend/` - Express server, MongoDB models, controllers, and routes
- `database/` - placeholder for local database data

## Setup

1. Install backend dependencies:
   ```powershell
   cd "f:\mohan\task management\backend"
   npm install
   ```
2. Start MongoDB locally.
3. Run the backend server:
   ```powershell
   npm run dev
   ```
4. Open the app in your browser at `http://localhost:5000`.

## Notes

- The backend now serves the frontend from the `frontend/` folder.
- The frontend uses the same-origin path `/api` for API calls.
- Store your auth token in local storage for dashboard access.
