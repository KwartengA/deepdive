import { SafeAreaView } from "react-native-safe-area-context";
import {Text, TouchableOpacity, View} from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { StatusBar } from "expo-status-bar";

export default function Home(){
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar hidden/>
            <View className="flex-row items-center justify-between px-4 mb-4">
                <View className="w-10 h-10 bg-blue-300 rounded-full items-center justify-center">
                    <Text className="text-sm font-semibold">KA</Text>
                </View>

                <Text className="font-bold text-2xl">Home</Text>

                <View className="flex-row gap-5">
                    <TouchableOpacity hitSlop={10}>
                        <FontAwesome5 name="tasks" size={24} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity hitSlop={10}>
                        <FontAwesome name="bell" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
 
            <View className="px-4 mb-4">
                <InputField
                    label=""
                    placeholder="Search"
                    icon={icons.search}
                    textContentType="none"
                    autoCorrect={false}
                    autoCapitalize="none"
                    className="px-4 mb-4"
                />
            </View>
        </SafeAreaView>
    )
}