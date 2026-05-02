# TaskFlow - Full Stack Project Management App

TaskFlow is a fully functional web application where users can create projects, assign tasks, and track progress with role-based access.

## Features
- **Authentication**: JWT-based login and signup.
- **Role-based Access Control**: 
  - **Admin**: Can create projects, manage all tasks, create users, assign priorities, and delete items.
  - **Member**: Can view projects and tasks, update the status of their assigned tasks, and edit task descriptions.
- **Projects**: Group tasks into projects with dynamic progress tracking.
- **Task Management**: Kanban-style status tracking (To Do, In Progress, Done) and Priority badges (High, Medium, Low).
- **Collaboration**: Real-time task comments and details view.
- **My Tasks**: A personalized dashboard filtering only the tasks assigned to the currently logged-in user.
- **Dashboard**: High-level overview of projects and task statistics.
- **Rich Aesthetics**: Premium UI built with vanilla CSS, featuring glassmorphism, dynamic animations, and responsive design.

## Tech Stack
- **Frontend**: React (Vite), React Router, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT.
- **Styling**: Vanilla CSS (No Tailwind, as requested).

## Local Development
1. Clone the repository.
2. Ensure you have MongoDB running locally, or configure a `MONGO_URI` environment variable.
3. Install dependencies from the root directory:
   ```bash
   npm run build
   ```
   *Note: The `build` script in `package.json` installs dependencies for both frontend and backend and builds the frontend.*
4. Start the development server (runs both frontend and backend concurrently):
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`. The backend runs on `http://localhost:5000`.

## Railway Deployment
This application is fully prepared for a 1-click deployment on Railway using Nixpacks.
1. Create a [Railway](https://railway.app/) account and link your GitHub repository.
2. In Railway, provision a **MongoDB** database plugin.
3. Add the following environment variables to your web service:
   - `MONGO_URI`: (The connection URL provided by Railway MongoDB)
   - `JWT_SECRET`: A secure random string (e.g., `my_super_secret_key`)
   - `NODE_ENV`: `production`
4. The deployment will automatically install root dependencies, build the frontend via `npm run build`, and start the Express server via `npm start`. The Express server automatically serves the compiled Vite assets.

