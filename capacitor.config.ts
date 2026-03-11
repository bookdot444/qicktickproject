import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qicktick.app',
  appName: 'Qicktick',
  webDir: 'out', // leave this, but it won’t be used
  server: {
    url: 'https://qicktick.com/',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: true,
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;