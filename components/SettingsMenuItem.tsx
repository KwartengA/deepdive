import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface SettingsMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  onPress?: () => void;
  iconFamily?: 'Ionicons' | 'MaterialIcons';
  iconColor?: string;
}

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
  icon,
  title,
  description,
  onPress,
  iconFamily = 'Ionicons',
  iconColor,
}) => {
  const renderIcon = () => {
    if (iconFamily === 'MaterialIcons') {
      return <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={18} color={iconColor} />;
    }
    return <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={iconColor} />;
  };

  return (
    <View className="border-b border-gray-300">
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-4"
        onPress={onPress}
        accessibilityRole="button"
      >
        <View className="flex-row items-center flex-1">
          <View className="mr-4">
            {renderIcon()}
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900">{title}</Text>
            {description && (
              <Text className="text-sm text-gray-500 mt-0.5">{description}</Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsMenuItem;
