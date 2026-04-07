import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.phytopathometric.app',
  appName: 'PhytoPathometric',
  webDir: 'dist/public',
  server: {
    androidScheme: 'http',
    url: 'http://10.46.1.70:3000',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};
export default config;
