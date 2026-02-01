import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixelsmart.app',
  appName: 'Pixel Smart Art',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      backgroundColor: '#180c2e',
      launchShowDuration: 2000,
      launchAutoHide: true,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    }
  }
};

export default config;
