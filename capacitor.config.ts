import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qicktick.app',
  appName: 'Qicktick',
  webDir: 'out',
  server: {
    url: 'https://qicktick.com',
    cleartext: false, // VERY IMPORTANT
    allowNavigation: ['qicktick.com', '*.qicktick.com']
  }
};

export default config;
