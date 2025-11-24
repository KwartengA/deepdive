import {View,Text,Button} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function Home(){
    const { signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.replace("/(auth)/welcome");
    };

    return (
        <View className="flex-1 justify-center items-center p-5">
            <Text className="text-2xl mb-4">Home</Text>
            <Button title="Sign Out (For Testing)" onPress={handleSignOut} />
        </View>
    )
}