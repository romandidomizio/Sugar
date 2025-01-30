# Sugar Marketplace Backend

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
   ```

## Running the Application
- Development mode:
  ```
  npm run dev
  ```
- Production mode:
  ```
  npm start
  ```

## Deployment Platforms
Recommended platforms:
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform

## Security
- Always use HTTPS in production
- Rotate JWT secrets regularly
- Keep dependencies updated

## Testing
Run tests:
```
npm test
```

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
