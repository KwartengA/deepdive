import React from 'react';
import { View, Text } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <View className="mb-6">
      <Text className="text-xs font-semibold text-black uppercase tracking-wide mb-3 px-3">
        {title}
      </Text>
      {children}
    </View>
  );
};

export default SettingsSection;
