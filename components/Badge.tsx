import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface BadgeProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  isActive?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  title,
  onPress,
  isActive = false,
  className,
  ...props
}) => {
  return (
    <TouchableOpacity
      className={`
        px-2.5 py-1 rounded-full mx-1 border
        ${isActive
          ? 'bg-blue-500 border-blue-500'
          : 'bg-gray-100 border-gray-300'
        }
        ${className || ''}
      `}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      {...props}
    >
      <Text
        className={`
          text-xs font-medium
          ${isActive ? 'text-white' : 'text-gray-800'}
        `}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Badge;
