# Sugar Development README

## 1. Overview
Sugar is a hyper-local online marketplace for buying and selling food. This project consists of a backend API built with Node.js and Express, a MongoDB database hosted on MongoDB Atlas, and a frontend developed using React Native with Expo.

## 2. Tech Stack
- **Frontend:** React Native, Expo, TypeScript, React Navigation
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **UI Library:** React Native Paper (Material Design 3)
- **State Management:** React Context API
- **API Client:** Axios
- **Forms:** Formik, Yup (for validation)
- **Image Handling:** expo-image-picker
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Heroku (Backend), Expo Application Services (EAS) potentially for Frontend builds
- **CI/CD:** GitHub Actions
- **Linting/Formatting:** ESLint, Prettier

## 3. Prerequisites
- Node.js (v14 or later recommended)
- npm (usually comes with Node.js)
- MongoDB Atlas account (free tier recommended for development)
- Expo Go app installed on your mobile device (for testing)
- Git

## 4. Setup Instructions

### 4.1. Clone the Repository
```bash
git clone https://github.com/yourusername/sugar.git # Replace with your repo URL
cd sugar
```

### 4.2. Backend Setup (`/backend` directory)

**a) Install Dependencies:**
```bash
cd backend
npm install
```

**b) Configure Environment Variables:**
Create a `.env` file in the `/backend` directory with the following content. **Ensure this file is added to `.gitignore`.**

```dotenv
PORT=3000
JWT_SECRET=YOUR_STRONG_RANDOM_SECRET_HERE # Replace with a strong, unique secret
NODE_ENV=development
MONGODB_URI=mongodb+srv://dev-user:sugardevuser1@sugarcluster.mssvz.mongodb.net/sugar_marketplace?retryWrites=true&w=majority&appName=SugarCluster # Replace with your MongoDB Atlas connection string
JWT_EXPIRATION=1h # Or your preferred token expiration
```
*   Replace `MONGODB_URI` with your actual connection string from MongoDB Atlas.
*   Replace `JWT_SECRET` with a secure, randomly generated string.

### 4.3. Frontend Setup (Root `/` directory)

**a) Install Dependencies:**
Navigate back to the project root directory if you are in `/backend`.
```bash
cd ..
npm install
```
*   **Troubleshooting Tip:** If you encounter peer dependency conflicts, especially after adding new libraries, try running:
    ```bash
    npm install --legacy-peer-deps
    ```

**b) Configure Environment Variables:**
Create a `.env` file in the project **root** directory (`/`) with the following content. **Ensure this file is added to `.gitignore`.**

```dotenv
# Base URL for the backend API
API_BASE_URL=http://localhost:3000 # Use your machine's local IP if testing on a physical device: http://[YOUR_LOCAL_IP]:3000

# Optional: Specify device type if needed for specific logic (not currently used)
# DEVICE_TYPE=mac # or 'android'
```
*   Replace `localhost` with your computer's local network IP address if you are running the app on a physical device using Expo Go. You can usually find this via `ipconfig` (Windows) or `ifconfig` (macOS/Linux).

## 5. Running the Application

You'll need two separate terminal windows.

**Terminal 1: Start the Backend Server**
```bash
cd backend
node server.js
# Or use nodemon if installed: nodemon server.js
```
The backend should start, typically on port 3000.

**Terminal 2: Start the Frontend Development Server**
```bash
# Ensure you are in the project root directory
npx expo start
```
This will start the Metro bundler. Scan the QR code shown in the terminal using the Expo Go app on your device, or press `i` for iOS simulator / `a` for Android emulator if configured.

## 6. Core Application Features

This section details the primary user-facing features implemented in the Sugar application.

### 6.1. Marketplace (`HomeScreen.tsx`)

**Purpose:** Provides a central view for users to browse food items listed by others in the community. It separates items into "Free" and "Other Items" categories.

**Location:** `src/screens/HomeScreen.tsx`

**Data Flow:**
1.  **Fetching:** On screen focus (`useFocusEffect`), fetches all available listings via a `GET` request to `${API_BASE_URL}/api/marketplace`.
2.  **Sorting:** Fetched items are sorted by creation date (`createdAt`) in descending order (newest first).
3.  **Filtering:** Items are categorized based on price:
    *   **Free Items:** Listings where the `price` is exactly "$0.00" or "0.00".
    *   **Other Items:** All other priced listings.
4.  **Display:** Uses two separate horizontal `FlatList` components to display cards for "Free Items" and "Other Items". If no items are available in a category or overall, appropriate messages are displayed.

**UI Components & Interaction:**
*   **Item Card (`Card`):** Displays a preview of each listing (Image, Title, Producer, Formatted Price). Uses `react-native-paper`.
*   **Modal (`Modal`, `Portal`):** Triggered by pressing an item card (`handleCardPress`). Displays detailed information about the selected item (`selectedItem`).
    *   **Modal Content:** Shows Title, Image, Producer, Price (formatted), Description, Origin, Certifications, Expiry Date, Location (reverse geocoded name if `shareLocation` is true).
    *   **Modal Dismiss:** Closes when tapped outside or via `handleModalDismiss`.
*   **Headers:** "Free Items" and "Other Items" headers use `Text` with `variant="headlineSmall"` and `color={theme.colors.primary}` for consistency.

**Key Data Attributes (`MarketplaceItem` Interface):**
This interface (`src/screens/HomeScreen.tsx`) defines the structure of items fetched from the marketplace. Key attributes relevant for **checkout functionality** include:
*   `_id`: (string) Unique identifier for the listing. **Crucial for identifying the item in the cart/checkout.**
*   `title`: (string) Name of the item.
*   `price`: (string) The listed price (e.g., "$10.00", "Free"). **Needs parsing for calculations.** Use the `parsePrice` helper in `HomeScreen` as a reference.
*   `unitType`: (string, optional: 'unit' | 'size') Indicates if the price is per unit or based on size/weight.
*   `sizeMeasurement`: (string, optional) Specific size/weight details (e.g., "lb", "kg", "oz") if `unitType` is 'size'.
*   `quantity`: (number) *Note: This field is defined in the backend model but might not be directly fetched/displayed on the `HomeScreen` card/modal currently. It's essential for managing stock during checkout and should be fetched/available.*
*   `userId`: (string) The ID of the user who listed the item. **Needed for messaging and potentially for seller information during checkout.**

**Integration Points & Building Upon:**
*   **Checkout:**
    *   The "Add to Cart" button (`handleAddToCart`) uses the `useCart` context hook (`src/contexts/CartContext.tsx`) to add the `selectedItem` to the cart state.
    *   The cart context likely needs enhancement to handle quantity selection and potentially fetching full item details (including available `quantity`) when an item is added.
    *   The checkout process will need to retrieve items from the `CartContext`, use their `_id`, `price`, `quantity`, etc., and interact with a backend checkout/order endpoint.
*   **Messaging:**
    *   The "Message Seller" button (`handleMessageSeller`) in the modal currently logs the `selectedItem.userId`.
    *   **To build the messaging feature:** This handler should be modified to navigate to a new `ChatScreen` or similar component.
    *   It **must** pass the `selectedItem.userId` (the seller's ID) and potentially the `selectedItem._id` (listing ID) as navigation parameters to the chat screen to initiate or resume a conversation with the correct seller about the specific item. The authenticated user's ID can be retrieved from `AuthContext`.

### 6.2. Post New Listing (`PostScreen.tsx`)

**Purpose:** Allows authenticated users to create new food listings to be displayed on the marketplace.

**Location:** `src/screens/PostScreen.tsx`

**Workflow:**
1.  **Authentication:** Screen access might be restricted to logged-in users (handled via navigation setup).
2.  **Form:** Uses `Formik` for form state management and `Yup` for validation.
3.  **Image Selection:** Users can optionally select an image via the "Select Image" button (`handleChooseImageSource`), which presents an `Alert` to choose between taking a photo (`takePhoto`) or selecting from the library (`selectImage`). Uses `expo-image-picker`.
4.  **Image Upload:** If a *new* image is selected:
    *   It's uploaded *first* using `FormData` via a `POST` request to `${API_BASE_URL}/api/fooditems/upload-image`. This requires the auth token.
    *   The backend responds with the relative path of the stored image (e.g., `uploads/image-123.jpg`).
5.  **Form Submission (`handleSubmit`):**
    *   Form data (including the image path received from the upload step, if any) is compiled.
    *   Location coordinates are fetched using `expo-location` if `shareLocation` is true.
    *   Data is sent via a `POST` request to `${API_BASE_URL}/api/fooditems`, including the auth token in the headers.
    *   On success, navigates back or to `MyListingsScreen`. Errors are displayed.

**Form Fields & Validation (`validationSchema`):**
*   `title`: (string, required)
*   `producer`: (string, required)
*   `price`: (string, required) Validated using regex `/^(\$?(0(\.\d{1,2})?|([1-9]\d*(\.\d{1,2})?))|Free)$/i` to match formats like `$10.00`, `10.00`, `0.50`, `$0.50`, `0`, `$0`, or `Free` (case-insensitive). The `$` prefix is added visually using `TextInput.Affix` and is not part of the stored/validated value unless typed by the user (validation allows optional $). `keyboardType="decimal-pad"`.
*   `unitType`: (enum: 'unit' | 'size', required) Radio buttons control conditional rendering of `sizeMeasurement`.
*   `quantity`: (string representing number, required) Must be a positive integer. `keyboardType="numeric"`.
*   `sizeMeasurement`: (string, required *if* `unitType` is 'size')
*   `description`: (string, optional)
*   `origin`: (string, optional)
*   `certifications`: (array of strings, optional) Checkbox group.
*   `contactMethod`: (enum: 'Email' | 'Phone' | 'Direct Message', required) Dropdown.
*   `expiryDate`: (Date | null, optional) Date picker.
*   `shareLocation`: (boolean) Checkbox.
*   `location`: (object { latitude, longitude }, required *if* `shareLocation` is true) Map interaction planned.
*   `imageUri`: (string | null) Stores local URI before upload or backend path after upload.

**Building Upon:**
*   Add more complex validation rules in the `Yup` schema.
*   Introduce new fields to the form, ensuring they are added to `initialValues`, `Formik`'s JSX, the validation schema, and the backend model/route (`backend/models/FoodItem.js`, `backend/routes/foodItems.js`).
*   Modify image handling (e.g., allow multiple images, add cropping).
*   Integrate a map view component for selecting location visually.

### 6.3. My Listings (`MyListingsScreen.tsx` & `EditListingScreen.tsx`)

**Purpose:** Allows users to view, manage, and edit the listings they have previously created.

**Location:**
*   View/Manage: `src/screens/MyListingsScreen.tsx`
*   Edit: `src/screens/EditListingScreen.tsx`

**Data Flow (`MyListingsScreen`):**
1.  **Fetching:** On screen focus (`useFocusEffect`), fetches the user's specific listings via a `GET` request to `${API_BASE_URL}/api/fooditems/my-listings`. Requires the auth token.
2.  **Display:** Shows the fetched listings in a vertical `FlatList`. Each item includes Title, Price, Image, and action buttons.

**Actions (`MyListingsScreen`):**
*   **Add New:** A button navigates the user to `PostScreen`.
*   **Edit:** An "Edit" button (`handleEdit`) on each listing card navigates the user to `EditListingScreen`, passing the `item._id` as a route parameter.
*   **Delete:** A "Delete" button (`handleDelete`) triggers an `Alert` confirmation. If confirmed, sends a `DELETE` request to `${API_BASE_URL}/api/fooditems/:itemId` (using the item's `_id`). Requires the auth token. Refreshes the list on successful deletion.

**Workflow (`EditListingScreen`):**
1.  **Fetch Data:** Retrieves the `itemId` from route parameters. Fetches the specific listing data via a `GET` request to `${API_BASE_URL}/api/fooditems/:itemId`. Requires the auth token.
2.  **Pre-populate Form:** Uses the fetched data to set the `initialValues` for the `Formik` form, allowing the user to see and modify existing data.
3.  **Image Handling:** Similar to `PostScreen`. If the user selects a *new* image, it's uploaded first via `POST` to `${API_BASE_URL}/api/fooditems/upload-image`. The existing image URI is used otherwise.
4.  **Form Submission:** On submit (`handleSubmit`), sends the updated form data (including new image path, if applicable) via a `PUT` request to `${API_BASE_URL}/api/fooditems/:itemId`. Requires the auth token. Navigates back on success.

**Form Fields & Validation (`EditListingScreen`):**
*   Mirrors the fields and validation schema of `PostScreen`, adapted for editing. Ensures consistency in data requirements.

**Building Upon:**
*   Add functionality to mark items as "Sold" or "Unavailable" instead of just deleting.
*   Implement filtering or sorting options for the user's listings.
*   Enhance the UI for managing listings (e.g., show listing status).
*   Refine error handling and user feedback during edit/delete operations.

## 7. Component Playground 🎨

**Location:** `src/screens/ComponentPlaygroundScreen.tsx`

**Purpose:**
The Component Playground is a development screen designed to:
- Rapidly prototype and test UI components in isolation.
- Showcase different variations and states of components.
- Facilitate design reviews and ensure consistency.
- Aid in debugging component-specific issues.

**Usage During Development:**
- The playground provides buttons to navigate directly to all major application screens, speeding up the development workflow.
- It serves as a living style guide where developers can see examples of core components (Buttons, Inputs, Cards, etc.) using the application's theme.

**Adding Components to the Playground:**
1. Open `src/screens/ComponentPlaygroundScreen.tsx`.
2. Import the component you want to showcase.
3. Add a new `View` section within the `ScrollView`.
4. Include a `Text` component as a title for the section.
5. Render different variations of your component within this section.

```typescript
// Example: Adding NewComponent to ComponentPlaygroundScreen.tsx
import NewComponent from '../components/NewComponent';
// ... other imports

const ComponentPlaygroundScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const theme = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ... other component sections ... */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New Component Variants</Text>
        <NewComponent variant="primary" label="Primary Action" />
        <NewComponent variant="secondary" label="Secondary Action" disabled />
        {/* Add more variants as needed */}
      </View>

      {/* ... navigation buttons ... */}
    </ScrollView>
  );
};
```

## 8. State Management (React Context API)

**Location:** `src/contexts/`

**Approach:**
We utilize React's built-in Context API along with `useReducer` and `useContext` hooks for managing global application state. This provides a lightweight, type-safe solution without external dependencies.

**Global State Structure (`AppContext.tsx`):**
The main context combines several domain-specific states:
- **Authentication State (`AuthState`):** Manages user login status, user details (`user`), JWT token (`token`), and authentication errors (`error`). Handled by `AuthReducer`. Located in `src/contexts/AuthContext.tsx` (or integrated within `AppContext.tsx`).
- **Theme State (`ThemeState`):** Manages UI theme preferences (e.g., `mode: 'light' | 'dark'`, potentially custom colors). Handled by `ThemeReducer`. Integrated within `AppContext.tsx` or a separate `ThemeContext.tsx`.
- **Location State (`LocationState`):** Stores user's geographic information (`latitude`, `longitude`, `address`). Handled by `LocationReducer`. Integrated within `AppContext.tsx` or a separate `LocationContext.tsx`.
- **Cart State (`CartContext.tsx`):** Manages the user's shopping cart (`items`). Uses its own provider (`CartProvider`) and hook (`useCart`).

**Using the Context:**
```typescript
// Example: Accessing Auth state in a component
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAppContext } from '../contexts/AppContext'; // Assuming combined context

const ProfileScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    // Potentially call an AuthService logout function here too
  };

  return (
    <View>
      {state.auth.isAuthenticated ? (
        <>
          <Text>Welcome, {state.auth.user?.username || 'User'}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <Text>Please log in.</Text>
      )}
    </View>
  );
};

export default ProfileScreen;
```

**Key Principles:**
- **Immutability:** Reducers must return new state objects instead of mutating the existing state.
- **Type Safety:** TypeScript interfaces (`AppState`, `AuthAction`, etc.) define the structure of state and actions.
- **Separation of Concerns:** Contexts are often split by domain (Auth, Theme, Cart) to keep management focused.

## 9. Design System (React Native Paper)

**Library:** [React Native Paper](https://callstack.github.io/react-native-paper/)

**Custom Theme:** `src/theme/SugarTheme.ts`

**Philosophy:**
We exclusively use React Native Paper components for all UI elements to ensure a consistent, modern look and feel based on Material Design 3. This approach promotes:
- **Consistency:** Uniform styling across the app.
- **Maintainability:** Centralized theme management.
- **Accessibility:** Built-in accessibility features.
- **Responsiveness:** Components adapt to different screen sizes.

**Key Guidelines:**
- **Always Import `useTheme`:** Access theme colors, fonts, and spacing via the `useTheme` hook from `react-native-paper`.
- **Use Paper Components:** Replace standard React Native components (`View`, `Text`, `Button`, `TextInput`) with their Paper counterparts (`Surface`, `Text`, `Button`, `TextInput`).
- **Leverage Theme:** Apply styling primarily through theme properties (e.g., `color={theme.colors.primary}`, `style={theme.fonts.headlineSmall}`). Avoid inline styles for theme-related properties.
- **Custom Theme (`SugarTheme.ts`):** Defines the application's specific color palette, fonts, and component variants based on the default Material Design 3 theme.

**Example Usage:**
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

const MyComponent: React.FC = () => {
  const theme = useTheme(); // Access the theme

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
        Welcome!
      </Text>
      <Button
        mode="contained" // Paper button style
        onPress={() => console.log('Pressed')}
        style={{ marginTop: 16 }}
        // Button automatically uses theme's primary color for contained mode
      >
        Get Started
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MyComponent;
```

## 10. Development Workflow

### Branching Strategy
- Use feature branches based off the main development branch (e.g., `main` or `develop`).
- Branch naming convention: `feature/your-feature-name` or `fix/bug-description`.
  ```bash
  git checkout main
  git pull
  git checkout -b feature/new-checkout-flow
  ```

### Testing (No tests implemented yet)
- **Goal:** Implement unit and integration tests using Jest and React Native Testing Library.
- When implemented, run tests via:
  ```bash
  npm test
  ```

### Submitting Changes (Pull Requests)
1. Develop the feature/fix on your branch.
2. Commit changes with clear, concise messages.
3. Push your branch to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Create a Pull Request (PR) on GitHub against the main development branch.
5. Provide a detailed description of changes in the PR.
6. Request code reviews from team members.

### Merging
- Once the PR is approved and passes any CI checks, merge it into the main development branch.

## 11. Linting & Formatting

- **Tools:** ESLint and Prettier are configured for code quality and consistent style.
- **Check:** Run `npm run lint` to identify linting errors.
- **Format:** Run `npm run format` to automatically format code according to Prettier rules.
- **Recommendation:** Configure your code editor to format on save using ESLint and Prettier plugins.

## 12. Continuous Integration (CI/CD)

- **Platform:** GitHub Actions.
- **Workflow:** A basic CI/CD pipeline is likely configured (check `.github/workflows`) for automated testing (when tests exist) and potentially deployment on pushes/merges to the main branch.
- **Deployment:** Currently targets Heroku for the backend. Frontend deployment might involve Expo Application Services (EAS) builds later.

## 13. Monitoring & Scaling
- **Current State:** Basic logging is implemented.
- **Future Considerations:**
    - Integrate performance monitoring tools (e.g., Sentry, Datadog).
    - Optimize database queries using indexing (MongoDB Atlas provides tools for this).
    - Implement caching strategies (backend API responses, frontend data).

## 14. Security Best Practices
- **Input Validation:** Validate and sanitize all user inputs on both frontend (Yup) and backend.
- **Authentication:** Use JWT securely (HTTPS, httpOnly cookies if applicable for web, secure storage in mobile).
- **Authorization:** Ensure backend endpoints verify user permissions before performing actions (e.g., checking if the user owns the listing they are trying to edit/delete).
- **Secrets Management:** Never commit sensitive information (API keys, JWT secrets, database credentials) directly to the codebase. Use `.env` files and ensure they are in `.gitignore`.
- **Dependencies:** Regularly update dependencies to patch security vulnerabilities.

## 15. Troubleshooting

- **Dependency Issues:** If `npm install` fails or causes unexpected errors, try deleting `node_modules` and `package-lock.json` (or `yarn.lock`) and running `npm install --legacy-peer-deps` again.
- **API Connection Errors (Expo Go):** If the app can't connect to the local backend:
    - Ensure the backend server is running.
    - Verify the `API_BASE_URL` in the frontend's `.env` file is correct. If using a physical device, it must be your computer's local network IP (e.g., `http://192.168.1.10:3000`), not `localhost`.
    - Check firewall settings aren't blocking the connection on the required port (3000).
- **Database Connection Issues:** Ensure your `MONGODB_URI` in the backend `.env` file is correct and that your current IP address is whitelisted in MongoDB Atlas network access settings.
- **Image Upload/Display Issues:** Verify backend file permissions and that the `${API_BASE_URL}` used for constructing image URLs in the frontend is correct.

## 16. Contact
For any questions or issues, please contact the project maintainer at [rodi1364@colorado.edu].