import React, { useState } from 'react';
import { TouchableOpacity, Text, View, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SettingsMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap;
  title: string;
  onPress?: () => void;
  hasAccordion?: boolean;
  children?: React.ReactNode;
  iconFamily?: 'Ionicons' | 'MaterialIcons';
  iconColor?: string;
}

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
  icon,
  title,
  onPress,
  hasAccordion = false,
  children,
  iconFamily = 'Ionicons',
  iconColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    if (hasAccordion && children) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(!isExpanded);
    } else if (onPress) {
      onPress();
    }
  };

  const renderIcon = () => {
    if (iconFamily === 'MaterialIcons') {
      return <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={24} color={iconColor} />;
    }
    return <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color={iconColor} />;
  };

  return (
    <View className="mb-2">
      <TouchableOpacity
        className="flex-row items-center justify-between bg-gray-800 rounded-xl px-4 py-4"
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ expanded: hasAccordion ? isExpanded : undefined }}
      >
        <View className="flex-row items-center flex-1">
          <View className="mr-3">
            {renderIcon()}
          </View>
          <Text className="text-base font-medium text-white">{title}</Text>
        </View>

        {hasAccordion && children ? (
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#173d9c"
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#173d9c" />
        )}
      </TouchableOpacity>

      {hasAccordion && children && isExpanded && (
        <View className="mt-2 bg-white rounded-xl px-4 py-3 border border-gray-100">
          {children}
        </View>
      )}
    </View>
  );
};

export default SettingsMenuItem;
