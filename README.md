# Sugar Development README

## Overview
Sugar is a hyper-local online marketplace for buying and selling food. This project consists of a backend API built with Node.js and Express, a MongoDB database hosted on MongoDB Atlas, and a frontend developed using React Native with Expo.

## Tech Stack
- **Frontend:** React Native, Expo, React Native Paper
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Heroku
- **CI/CD:** GitHub Actions
- **Design System:** Material Design 3 via React Native Paper

### Design Philosophy: React Native Paper
We use React Native Paper as our primary UI component library to ensure:
- Consistent, modern design across all components
- Material Design 3 compliance
- Responsive and adaptive UI
- Easy theming and customization
- Accessibility and cross-platform compatibility

#### Key Design Principles
- **Unified Styling**: All UI elements use Paper components
- **Custom Theming**: Implemented via `SugarTheme.ts`
- **Variant Support**: Components support multiple states and styles
- **Responsive Design**: Adaptive to different screen sizes and platforms

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
  cd backend
  node server.js
  ```
- Open another terminal and navigate to the root directory:
  ```bash
  npx expo start
  ```
- Choose the simulator of your choice to run the app.

## Component Playground 🎨

### Purpose
The Component Playground is a powerful development tool designed to:
- Rapidly prototype and test UI components
- Showcase component variations
- Facilitate design reviews
- Aid in component development and testing

### Key Features
- **Component Visualization**: Display multiple variants of components
- **Interactive Testing**: Simulate different states and interactions
- **Development Navigation**: Easy screen switching for rapid iteration

### Navigation During Development

#### Screen Navigation
During development, all screens are configured with:
- Direct navigation buttons
- Back navigation buttons
- Consistent header styling

#### How to Use Navigation
1. **Component Playground Screen**
   - Provides buttons to navigate to all other screens
   - Demonstrates different component variants
   - Allows quick access to different parts of the app

2. **Screen-Specific Navigation**
   - Each screen has a "Back" button to return to the previous screen
   - Buttons to navigate between screens for quick testing

### Component Playground Workflow

#### Adding Components to Playground
1. Open `src/screens/ComponentPlaygroundScreen.tsx`
2. Import your new component
3. Add a section to showcase different variants:

```typescript
import NewComponent from '../components/NewComponent';

const ComponentPlaygroundScreen: React.FC = () => {
  return (
    <ScrollView>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New Component Variants</Text>
        
        <NewComponent variant="primary" />
        <NewComponent variant="secondary" />
        <NewComponent disabled />
      </View>
    </ScrollView>
  );
};
```

#### Best Practices
- Show multiple component states
- Include different prop combinations
- Add console logs to test interactions
- Use consistent styling sections

### Development Navigation Principles

#### Goals
- Minimize context switching
- Rapid screen and component testing
- Simplified development workflow

#### Navigation Strategies
- One-click access to any screen
- Consistent back navigation
- Clear, intuitive routing

### Disabling Development Navigation
To remove development navigation features:
1. Update `MainNavigator.tsx`
2. Remove development-specific routing
3. Set appropriate initial screen

## React Native Paper Integration 🎨

### Overview
React Native Paper is our comprehensive UI component library, providing a consistent, modern design system across our Sugar Marketplace app.

### Key Features
- 🌈 Custom Theming
- 🧩 Modular Components
- ♿ Accessibility Support
- 🚀 Performance Optimized

### Theme Configuration
Our custom theme is defined in `src/theme/SugarTheme.ts`:
- Primary Color: Sea Green (#2E8B57)
- Secondary Color: Medium Sea Green (#3CB371)
- Accent Color: Light Green (#90EE90)
- Background: Honeydew (#F0FFF0)

### Available Paper Components
1. **PaperInput**
   - Supports label, error states
   - Outlined mode
   - Validation integration
   ```typescript
   <PaperInput 
     label="Email" 
     error={touched.email && errors.email}
   />
   ```

2. **PaperButton**
   - Multiple variants: primary, secondary, tertiary
   - Modes: contained, outlined, text
   ```typescript
   <PaperButton 
     variant="primary" 
     mode="contained"
   >
     Submit
   </PaperButton>
   ```

3. **PaperCard**
   - Flexible content layout
   - Optional image and actions
   ```typescript
   <PaperCard
     title="Product Name"
     content="Description"
     imageUri="..."
   />
   ```

4. **PaperModal**
   - Customizable dialogs
   - Confirmation workflows
   ```typescript
   <PaperModal
     visible={isModalVisible}
     title="Confirm Action"
     content="Are you sure?"
     onConfirm={handleConfirm}
   />
   ```

### Best Practices
- Always use Paper components over custom components
- Leverage `useTheme()` for dynamic styling
- Maintain consistent spacing and typography
- Use semantic color mapping

### Performance Tips
- Minimize custom styling
- Use predefined modes and variants
- Lazy load complex components

### Customization
Modify `SugarTheme.ts` to:
- Adjust color palette
- Configure font styles
- Set global spacing

### Troubleshooting
- Ensure all Paper components are wrapped in `<PaperProvider>`
- Check theme configuration
- Verify import paths

### Future Roadmap
- Implement more complex Paper components
- Create design system documentation
- Continuous theme refinement

### Theming Best Practices
- Use `useTheme()` hook for dynamic theming
- Leverage predefined color constants
- Maintain consistent border radius and spacing

## Development Workflow

### Creating a New Feature
- Create a new branch for your feature:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Develop your feature, ensuring you follow coding standards and best practices.

### Testing (no tests are written yet)
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

## Additional Documentation

### State Management
- **React Context and Hooks**
  - Centralized state management using React Context API
  - Type-safe global state with TypeScript
  - Lightweight and performant solution

### Global State Structure
Our application state is managed through a comprehensive context system:
- **Authentication State**: User login, token management
- **Theme State**: Light/dark mode, color preferences
- **Location State**: User's geographic information

### Using the App Context
```typescript
// In any component
import { useAppContext } from './contexts/AppContext';

function MyComponent() {
  const { state, dispatch } = useAppContext();

  // Access state
  const isLoggedIn = state.auth.isAuthenticated;
  const currentTheme = state.theme.mode;

  // Dispatch actions
  const handleLogin = (user, token) => {
    dispatch({ 
      type: 'LOGIN', 
      payload: { user, token } 
    });
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };
}
```

### Key Context Features
- Centralized state management
- Type-safe actions and state
- Easy to extend and modify
- No external dependencies
- Integrated with React's hooks system

### Testing
- **Testing Library:**
  - Using `@testing-library/react-native` and `@testing-library/jest-native` for component testing.
  - Jest is configured as the test runner.

### Linting and Formatting
- **ESLint and Prettier:**
  - Configured for code quality and style consistency.
  - Run `npm run lint` to check for linting errors.
  - Run `npm run format` to format code using Prettier.

### Continuous Integration
- **GitHub Actions:**
  - CI/CD pipeline configured for automated testing and deployment.
  - Deployment to Heroku on push to the main branch.

### Environment Variables
- **Configuration:**
  - Use `.env` files to manage environment-specific variables.
  - Ensure `.env` is included in `.gitignore` to prevent sensitive data from being committed.

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
