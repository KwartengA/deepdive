import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  children: React.ReactNode;
  onMorePress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, children, onMorePress }) => {
  return (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
        {onMorePress && (
          <TouchableOpacity onPress={onMorePress}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
};

export default StatCard;
