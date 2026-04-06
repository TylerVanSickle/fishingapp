import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hookline.app',
  appName: 'HookLine',
  webDir: 'out',

  // Point the webview at your live deployed URL
  // Change this to your actual Vercel/production URL
  server: {
    url: 'https://hooklines.vercel.app',
    cleartext: false,
  },

  ios: {
    contentInset: 'automatic',
    backgroundColor: '#060d1a',
    scrollEnabled: false,
  },

  android: {
    backgroundColor: '#060d1a',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#060d1a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#060d1a',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
