import '../global.css';
import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file');
}

export default function RootLayout() {

  return (
<ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}> 
  <Stack>
    <Stack.Screen name= "index" options={{headerShown:false}}/>
    <Stack.Screen name= "(auth)" options={{headerShown:false}}/>
    <Stack.Screen name= "(tabs)" options={{headerShown:false}}/>
    
    </Stack>

    </ClerkProvider>
  );
}
