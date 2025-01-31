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

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/sugar.git
cd sugar
```

### 2. Backend Setup
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

### 3. Frontend Setup
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

### 4. Database Setup
- Create a MongoDB Atlas cluster and database.
- Update the `MONGODB_URI` in the `.env` file with your connection string.

### 5. Deployment
- Deploy the backend to Heroku using GitHub Actions.
- Ensure environment variables are set in Heroku.

### Full Project Setup
- Ensure all dependencies are installed for both backend and frontend.
- Follow the instructions above to set up and run each part of the project.

## Development and Maintenance

### Development Workflow
- Use GitHub for version control and collaboration.
- Follow the branching strategy for feature development.
- Submit pull requests for code reviews.

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
- Run tests for both frontend and backend:
  ```bash
  npm test
  ```
- Ensure all tests pass before merging changes.
