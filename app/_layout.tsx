import '../global.css';
import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import * as Sentry from "@sentry/react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

Sentry.init({
  dsn: "https://256d01043a9f125b52174ac9d52e53d7@o4510431789121536.ingest.de.sentry.io/4510432358236240",
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
});



function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <Stack>
          <Stack.Screen name= "index" options={{headerShown:false}}/>
          <Stack.Screen name= "(auth)" options={{headerShown:false}}/>
          <Stack.Screen name= "(tabs)" options={{headerShown:false}}/>
        </Stack>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);