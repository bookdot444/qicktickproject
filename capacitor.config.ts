import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qicktick.app',
  appName: 'Qicktick',

  // Required by Capacitor, even when using a live website
  webDir: 'out',

  server: {
    url: 'https://qicktick.com',
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'qicktick.com',
      '*.qicktick.com'
    ]
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#FFFFFF',
      showSpinner: true,
      androidScaleType: 'CENTER_CROP'
    }
  },

  android: {
    allowMixedContent: false
  }
};

export default config;