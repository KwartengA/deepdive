import { Tabs } from 'expo-router';

export default function Home() {
    
  return (
   <Tabs>
<Tabs.Screen 
name = 'home'  options={{
  title: "Home", 
  headerShown:false
}}/>

<Tabs.Screen 
name = 'analytics'  options={{
  title: "Analytics", 
  headerShown:false
}}/>

<Tabs.Screen 
name = 'settings'  options={{
  title: "Settings", 
  headerShown:false
}}/>

   </Tabs>
  );
}

