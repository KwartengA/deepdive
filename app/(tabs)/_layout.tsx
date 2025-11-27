import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {

  return (
   <Tabs screenOptions={{
    tabBarActiveTintColor: "#3b82f6",
    tabBarInactiveTintColor: "#9ca3af",
    tabBarStyle: {
      position: 'absolute',
      bottom: 30,
      left: 10,
      right: 10,
      backgroundColor: '#00000',
      borderTopWidth: 0,
      elevation: 0,
      height: 65,
      paddingBottom: 10,
      paddingTop: 10,
      paddingHorizontal: 60,
      borderRadius: 45,
      shadowRadius: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500',
    },
    tabBarShowLabel: true,
    tabBarItemStyle: {
      paddingHorizontal: 5,
    },
    }}>
      
<Tabs.Screen
name = 'home'  options={{
  title: "Home",
  headerShown:false,
  tabBarIcon:({color})=>(
    <Entypo name="home" size={28} color={color} />
  ),
}}
/>

<Tabs.Screen
name = 'analytics'  options={{
  title: "Analytics",
  headerShown:false,
  tabBarIcon:({color}) => (
    <MaterialCommunityIcons name="google-analytics" size={28} color={color} />
  )
}}
/>

<Tabs.Screen
name = 'settings'  options={{
  title: "Settings",
  headerShown:false,
  tabBarIcon:({color}) => (
   <Ionicons name="settings" size={28} color={color} />
  )
}}
/>

   </Tabs>
  );
}

