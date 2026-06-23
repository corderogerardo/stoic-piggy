import '../global.css';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { ApiProvider } from '@stoicpiggy/api';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/lib/providers';

SplashScreen.preventAutoHideAsync();

// On a real device, localhost won't reach your machine — set EXPO_PUBLIC_API_URL
// to your LAN IP, e.g. http://192.168.1.20:3001/trpc.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/trpc';

export default function RootLayout() {
  const [loaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApiProvider url={API_URL}>
          <AppProviders>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="auto" />
          </AppProviders>
        </ApiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
