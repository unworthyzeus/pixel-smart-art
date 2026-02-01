# Mobile App Guide (Android & iOS)

This project has been configured with **Capacitor** to run as a native mobile app on Android and iOS.

## Project Structure

- `android/` - The native Android project (can be opened in Android Studio).
- `ios/` - The native iOS project (can be opened in Xcode on macOS).
- `out/` - The static web build that serves as the app's frontend.
- `capacitor.config.ts` - Configuration for the mobile app.

## How to Run in Development

### 1. Build the Web App
Before running on mobile, you must build the Next.js project to generate the static files:

```bash
npm run build
```

### 2. Sync to Native
Sync the built web files to the native Android/ios folders:

```bash
npx cap sync
```

### 3. Open in Native IDE

#### Android (Windows/Mac/Linux)
Requires [Android Studio](https://developer.android.com/studio).

```bash
npx cap open android
```
- Wait for Gradle sync to finish.
- Select an emulator or connected device.
- Click the **Run (Play)** button.

#### iOS (macOS Only)
Requires [Xcode](https://developer.apple.com/xcode/).

```bash
npx cap open ios
```
- Wait for Xcode to load (Package.swift processing).
- Select a simulator (e.g., iPhone 15) or connected device.
- Click the **Run (Play)** button.

## Mobile Features

The app is currently configured to:
- **Hide Scrollbars**: For a native app feel.
- **Support Safe Areas**: Handles notches and home bars via `safe-area-inset` CSS.
- **Haptics**: Ready for haptic feedback integration.

## Troubleshooting

- **"CocoaPods not installed"**: This is normal on Windows. You can ignore it until you move to a Mac for iOS development.
- **API Errors**: Since this is a static export, ensure you don't use any Next.js API Routes (`/pages/api` or `app/api`). The logic should be client-side.
- **Images not loading**: Ensure all images comply with the unoptimized setting in `next.config.ts`.
