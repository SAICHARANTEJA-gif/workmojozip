import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.workmojo.cooperative',
  appName: 'WORK MOJO',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f172a',
      showSpinner: false,
      androidSpinnerStyle: 'large',
    },
    StatusBar: {
      backgroundColor: '#0f172a',
      style: 'DARK',
    },
  },
};

export default config;
