# Sugar Development README

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

## Setup Instructions

### 1. Clone the Repository
- Clone the repository from GitHub:
  ```bash
  git clone https://github.com/yourusername/sugar.git
  cd sugar
  ```

### 2. Install Dependencies
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

### 3. Configure Environment Variables
- Ensure you have a `.env` file in the `backend` directory with the following variables:
  ```
  PORT=3000
  JWT_SECRET=your_jwt_secret_here
  NODE_ENV=development
  MONGODB_URI=mongodb+srv://dev-user:CAnyLmwtjZXRDrkl@sugarcluster.mssvz.mongodb.net/?retryWrites=true&w=majority&appName=SugarCluster
  CORS_ORIGIN=http://localhost:3000
  ```

### 4. Start the Development Servers
- Start the backend server:
  ```bash
  node server.js
  ```
- Open another terminal and navigate to the frontend directory:
  ```bash
  cd src
  npx expo start
  ```
- Choose the simulator of your choice to run the app.

## Development Workflow

### Creating a New Feature
- Create a new branch for your feature:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Develop your feature, ensuring you follow coding standards and best practices.

### Testing
- Run tests to ensure your changes do not break existing functionality:
  ```bash
  npm test
  ```
- Write new tests if applicable.

### Submitting a Pull Request
- Push your branch to the remote repository:
  ```bash
  git push origin feature/your-feature-name
  ```
- Create a pull request on GitHub, providing a detailed description of your changes.
- Request reviews from team members.

### Merging and Deployment
- Once approved, merge your pull request into `main`.
- Ensure the CI/CD pipeline deploys the changes to Heroku.

## Monitoring and Scaling
- Set up monitoring tools to track app performance.
- Optimize database queries and use indexing for better performance.
- Implement caching strategies to improve response times.

## Security Best Practices
- Validate and sanitize inputs on both frontend and backend.

## Troubleshooting
- **Database Connection Issues:** Ensure your `MONGODB_URI` is correct and network settings allow access.

## Contact
For any questions or issues, please contact the project maintainer at [rodi1364@colorado.edu].
