import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from "react-native-pager-view";
import { router} from "expo-router";
import { onboarding } from "@/constants";


export default function Welcome() {

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, }}>
      <TouchableOpacity
        onPress={() => {
          router.push('/(auth)/sign-up');
        }}
        style={{ width: '100%', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 20 }}
      >
        <Text>Skip</Text>
      </TouchableOpacity>

        <PagerView
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
        >
          {onboarding.map((item) => (
            <View key={item.id} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={item.image} style={{ width: 256, height: 256, marginBottom: 24 }} resizeMode="contain" />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>{item.title}</Text>
              <Text style={{ textAlign: 'center', color: '#4b5563', paddingHorizontal: 24 }}>{item.description}</Text>
            </View>
          ))}
        </PagerView>
        
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16 }}>
          {onboarding.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                marginHorizontal: 4,
                borderRadius: 99,
                backgroundColor: currentIndex === index ? '#3b82f6' : '#d1d5db',
              }}
            />
          ))}
        </View>
    </SafeAreaView>
  );
}