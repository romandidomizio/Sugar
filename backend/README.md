# Sugar Backend

## Prerequisites
- Node.js (v14 or later)
- npm

## Setup
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   MONGODB_URI=your_mongodb_uri_here
   CORS_ORIGIN=your_cors_origin_here
   ```

## Database Setup
- Ensure you have a MongoDB Atlas account.
- Create a cluster and database for the Sugar Marketplace.
- Update the `.env` file with your `MONGODB_URI`.

## Environment Variables
- `PORT`: The port on which the server runs.
- `JWT_SECRET`: Secret key for JWT authentication.
- `NODE_ENV`: Environment mode (development/production).
- `MONGODB_URI`: MongoDB connection string.
- `CORS_ORIGIN`: Allowed origins for CORS.

## Running the Application
- Start the backend server:
  ```bash
  node server.js
  ```
- Open another terminal and navigate to the frontend directory:
  ```bash
  cd ../src
  ```
- Start the Expo development server:
  ```bash
  npx expo start
  ```
- Choose the simulator of your choice to run the app.

## API Documentation
- **User Registration**: `POST /api/users/register`
- **User Login**: `POST /api/users/login`
- **Get User Profile**: `GET /api/users/profile` (protected)

## Testing
- Run tests using:
  ```
  npm test
  ```
- Ensure all tests pass before deployment.

## Security Best Practices
- Validate and sanitize all inputs.
- Use helmet and rate limiting to enhance security.
- Regularly update dependencies to patch vulnerabilities.

## Troubleshooting
- **Database Connection Issues**: Check your `MONGODB_URI` and network settings.
- **Environment Variables**: Ensure all required variables are set in `.env`.

## Deployment Platforms
- Recommended platforms:
  - Heroku
  - AWS Elastic Beanstalk
  - DigitalOcean App Platform

## Security
- Always use HTTPS in production
- Rotate JWT secrets regularly
- Keep dependencies updated

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
