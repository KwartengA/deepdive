import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '@/theme';

export default function TabsLayout() {
    
  return (
   <Tabs screenOptions={{tabBarActiveTintColor: "blue", 
    tabBarInactiveTintColor:theme.calmblue,
    }}>
<Tabs.Screen
name = 'home'  options={{
  title: "Home", 
  headerShown:false,
  tabBarIcon:({size,color})=>(
    <Entypo name="home" size={size} color={color} />
  ),
}}
/>

<Tabs.Screen 
name = 'analytics'  options={{
  title: "Analytics", 
  headerShown:false,
  tabBarIcon:({size,color}) => (
    <MaterialCommunityIcons name="google-analytics" size={size} color={color} />
  )
}}
/>

<Tabs.Screen 
name = 'settings'  options={{
  title: "Settings", 
  headerShown:false,
  tabBarIcon:({size,color}) => (
   <Ionicons name="settings" size={size} color={color} />
  )
}}
/>

   </Tabs>
  );
}

