# Sugar

## Overview
Sugar is a hyper-local online marketplace for buying and selling food. This project consists of a backend API built with Node.js and Express, a MongoDB database hosted on MongoDB Atlas, and a frontend developed using React Native with Expo.

## Tech Stack
- **Frontend:** React Native, Expo
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Heroku
- **CI/CD:** GitHub Actions

## Prerequisites
- Node.js (v14 or later)
- npm
- MongoDB Atlas account (free tier)
- Heroku account (free tier)
- Expo Go app for testing

## Development Environment Setup

### Clone the Repository
- Clone the repository from GitHub:
  ```bash
  git clone https://github.com/yourusername/sugar.git
  cd sugar
  ```

### Install Dependencies
- Navigate to the backend directory and install dependencies:
  ```bash
  cd backend
  npm install
  ```
- Navigate to the frontend directory in a separate terminal and install dependencies:
  ```bash
  cd src
  npm install
  ```

### Environment Variables
- Ensure you have a `.env` file in the `backend` directory with the following variables:
  ```
  PORT=3000
  JWT_SECRET=your_jwt_secret_here
  NODE_ENV=development
  MONGODB_URI=mongodb+srv://dev-user:CAnyLmwtjZXRDrkl@sugarcluster.mssvz.mongodb.net/?retryWrites=true&w=majority&appName=SugarCluster
  CORS_ORIGIN=http://localhost:3000
  ```
- Share the `.env` file securely with your team or provide the necessary variables.

## Connecting to the Backend
- Start the backend server:
  ```bash
  node server.js
  ```

## Integrating Services
- Ensure all third-party services are configured as needed.
- Follow any additional setup instructions for services like analytics or authentication.

## Local Deployment
- For deploying changes, ensure you have access to the Heroku app.
- Use GitHub Actions for automated deployment to the shared environment.

## Project Setup

### 1. Backend Setup
- Navigate to the backend directory:
  ```bash
  cd backend
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` file with the following variables:
  ```
  PORT=3000
  JWT_SECRET=your_jwt_secret_here
  NODE_ENV=development
  MONGODB_URI=your_mongodb_uri_here
  CORS_ORIGIN=http://localhost:3000
  ```
- Start the backend server:
  ```bash
  node server.js
  ```

### 2. Frontend Setup
- Navigate to the frontend directory in a separate terminal:
  ```bash
  cd src
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Start the Expo development server:
  ```bash
  npx expo start
  ```
- Choose the simulator of your choice to run the app.

### 3. Database Setup
- Create a MongoDB Atlas cluster and database.
- Update the `MONGODB_URI` in the `.env` file with your connection string.

### 4. Deployment
- Deploy the backend to Heroku using GitHub Actions.
- Ensure environment variables are set in Heroku.

### 5. Full Project Setup
- Ensure all dependencies are installed for both backend and frontend.
- Follow the instructions above to set up and run each part of the project.

## Development and Maintenance

### Development Workflow
- Use GitHub for version control and collaboration.
- Follow the branching strategy for feature development.
- Submit pull requests for code reviews.

### Working on a New Feature

#### Creating a New Branch
- Before starting work on a new feature, create a new branch:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Ensure your branch name is descriptive of the feature you are working on.

#### Developing the Feature
- Follow the setup instructions to ensure your development environment is ready.
- Implement the feature in your branch.

#### Testing
- Run tests to ensure your changes do not break existing functionality:
  ```bash
  npm test
  ```
- Write new tests if applicable.

#### Submitting a Pull Request
- Once your feature is complete, push your branch to the remote repository:
  ```bash
  git push origin feature/your-feature-name
  ```
- Go to GitHub and create a pull request from your branch to `main`.
- Add a detailed description of the changes and any relevant information.
- Request reviews from team members.

#### Code Review and Merging
- Address any feedback from code reviews.
- Once approved, merge the pull request into `main`.
- Pull the latest changes from `main` to keep your local repository up to date:
  ```bash
  git checkout main
  git pull origin main
  ```

### Monitoring and Analytics
- Set up monitoring tools to track app performance.
- Use services like Google Analytics or Firebase for insights into user behavior.

### Scaling the App
- Optimize database queries and use indexing for better performance.
- Implement caching strategies to improve response times.
- Use a content delivery network (CDN) for serving static assets.

### Security Best Practices
- Validate and sanitize inputs on both frontend and backend.
- Implement CORS and rate limiting on your backend to prevent abuse.
- Regularly update dependencies to patch vulnerabilities.

### Troubleshooting
- **Database Connection Issues:** Check your `MONGODB_URI` and network settings.
- **Expo Issues:** Ensure the Expo Go app is up to date.

### Contribution Guidelines
- Use descriptive commit messages and pull request descriptions.

### Contact
For any questions or issues, please contact the project maintainer at [rodi1364@colorado.edu].

## Testing
- No tests are included at the user auth level.
- Run tests for both frontend and backend:
  ```bash
  npm test
  ```
- Ensure all tests pass before merging changes.

## Additional Information
- For any questions or issues, please contact the project maintainer at [your-email@example.com].
