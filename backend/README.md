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

## Environment Configuration

### Backend Environment Configuration

Ensure your `.env` file in the `backend` directory matches the following configuration exactly:

```
PORT=3000
JWT_SECRET=ncdewfh347456438r74r3ig2gdgwtsfqtfeh43k6jgnfnvwy61r42e1rsoefmo595699347yegegqggqhndfkkfkfnr05
NODE_ENV=development
MONGODB_URI=mongodb+srv://dev-user:sugardevuser1@sugarcluster.mssvz.mongodb.net/sugar_marketplace?retryWrites=true&w=majority&appName=SugarCluster
JWT_EXPIRATION=1h
```

### Frontend Environment Configuration

Create a `.env` file in the root of the project with the following content. Change `DEVICE_TYPE` to `android` if you are not using macOS:

```
DEVICE_TYPE=mac  # Set to 'android' or 'mac'
# EXPO_PUBLIC_API_URL=http://your-api-url.com/api/users
```

These configurations ensure that the application runs correctly across different development environments.

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
