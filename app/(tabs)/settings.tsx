import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Image, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import SettingsMenuItem from "@/components/SettingsMenuItem";
import SettingsSection from "@/components/SettingsSection";
import * as Sentry from "@sentry/react-native";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";

export default function Settings() {
    const { user } = useUser();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showDisplaySoundModal, setShowDisplaySoundModal] = useState(false);

    const [feedbackName, setFeedbackName] = useState("");
    const [feedbackEmail, setFeedbackEmail] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileName, setProfileName] = useState("");

    const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
    const [tempProfileName, setTempProfileName] = useState("");

    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
    const [hapticsEnabled, setHapticsEnabled] = useState(false);
    
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setTempProfileImage(result.assets[0].uri);
        }
    };

    const handleEditProfile = () => {
        setTempProfileImage(profileImage);
        setTempProfileName(profileName);
        setShowProfileModal(true);
    };

    const handleSaveProfile = () => {
        setProfileImage(tempProfileImage);
        setProfileName(tempProfileName);
        setShowProfileModal(false);
    };

    const handleCancelProfile = () => {
        setTempProfileImage(profileImage);
        setTempProfileName(profileName);
        setShowProfileModal(false);
    };
    


    useEffect(() => {
        if (user) {
            Sentry.setUser({
                id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                username: user.fullName || user.firstName || "User",
            });

            if (user.fullName) {
                setFeedbackName(user.fullName);
            }
            if (user.primaryEmailAddress?.emailAddress) {
                setFeedbackEmail(user.primaryEmailAddress.emailAddress);
            }
        }
    }, [user]);

    const handleSubmitFeedback = () => {
        if (!feedbackMessage.trim()) {
            Alert.alert("Error", "Please enter your feedback message");
            return;
        }

        try {
            Sentry.captureMessage("User Feedback Submitted", {
                level: "info",
                contexts: {
                    feedback: {
                        name: feedbackName || "Anonymous",
                        email: feedbackEmail || "no-email@provided.com",
                        message: feedbackMessage,
                    },
                },
                tags: {
                    feedback_type: "user_submitted",
                },
            });

            Alert.alert(
                "Thank You!",
                "Your feedback has been submitted successfully. We appreciate your input!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setFeedbackName("");
                            setFeedbackEmail("");
                            setFeedbackMessage("");
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to submit feedback. Please try again.");
            console.error("Feedback submission error:", error);
        }
    };
    return (
        <SafeAreaView className="flex-1 bg-gray-200">
            <StatusBar hidden />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="items-center py-6 mb-2">
                    <View className="w-40 h-40 bg-gray-900 rounded-full items-center justify-center mb-4 overflow-hidden">
                        {profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : null}
                    </View>

                    {profileName && (
                        <Text className="text-xl font-semibold text-gray-900 mb-1">
                            {profileName}
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={handleEditProfile}
                        className="mt-3 px-6 py-2 bg-gray-200 rounded-md"
                    >
                        <Text className="text-blue-400 text-md font-medium">
                            Edit Profile
                        </Text>
                    </TouchableOpacity>
                </View>

                
                <View className="px-4">
                    <SettingsSection title="MY ACCOUNT">

                        <SettingsMenuItem
                            iconFamily="Ionicons"
                            icon="hand-left"
                            iconColor="#191970"
                            title="Display & Sound"
                            description="Manage how content is displayed to you."
                            onPress={() => setShowDisplaySoundModal(true)}
                        />

                        <SettingsMenuItem
                            iconFamily="Ionicons"
                            icon="notifications-outline"
                            iconColor="#004526"
                            title="Notifications"
                            description="Select the kinds of notifications you get about your activities and recommendations."
                            onPress={() => setShowNotificationsModal(true)}
                        />

                        <SettingsMenuItem
                            iconFamily="MaterialIcons"
                            icon="feedback"
                            iconColor="#FEBE10"
                            title="Submit Feedback"
                            description="Send a description of a challenge encountered or a feature you want to recommend"
                            onPress={() => setShowFeedbackModal(true)}
                        />

                    </SettingsSection>

                </View>
            </ScrollView>

            <Modal
                visible={showFeedbackModal}
                animationType="fade"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowFeedbackModal(false)}
            >
                <SafeAreaView className="flex-1 bg-gray-950">
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
                            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                                <Text className="text-blue-500 text-base">Cancel</Text>
                            </TouchableOpacity>
                            <Text className="text-lg font-semibold">Submit Feedback</Text>
                            <View style={{ width: 60 }} />
                        </View>

                        <ScrollView className="flex-1 px-6 pt-6">
                            <Text className="text-white text-xl mb-6">
                                We'd love to hear from you! Your feedback helps us improve.
                            </Text>

                            <View className="mb-5">
                                <Text className="text-white font-medium mb-2">Name (Optional)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base"
                                    placeholder="Your name"
                                    value={feedbackName}
                                    onChangeText={setFeedbackName}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View className="mb-5">
                                <Text className="text-white font-medium mt-3 mb-2">Email (Optional)</Text>
                                <TextInput
                                    className="bg-gray-50 border rounded-lg px-4 py-3  text-base"
                                    placeholder="your.email@example.com"
                                    value={feedbackEmail}
                                    onChangeText={setFeedbackEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-white font-medium mt-3 mb-2">Message *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base"
                                    style={{ minHeight: 120 }}
                                    placeholder="Tell us what you think..."
                                    value={feedbackMessage}
                                    autoCapitalize="none"
                                    autoCorrect= {false}
                                    onChangeText={setFeedbackMessage}
                                    multiline
                                    textAlignVertical="top"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <TouchableOpacity
                                className="bg-white rounded-full py-4 items-center mt-4"
                                onPress={() => {
                                    handleSubmitFeedback();
                                    setShowFeedbackModal(false);
                                }}
                            >
                                <Text className="text-black font-bold text-xl">Submit Feedback</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={showProfileModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCancelProfile}
            >
                <SafeAreaView className="flex-1 bg-gray-950">
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between px-4 py-4">
                            <TouchableOpacity onPress={handleCancelProfile}>
                                <Text className="text-blue-500 text-lg">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSaveProfile}>
                                <Text className="text-blue-500 text-lg font-semibold">Save</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            <View className="items-center pt-8 pb-6">
                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="relative"
                                >
                                    <View className="w-32 h-32 bg-gray-700 rounded-full items-center justify-center overflow-hidden">
                                        {tempProfileImage ? (
                                            <Image
                                                source={{ uri: tempProfileImage }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        ) : null}
                                    </View>
                                    <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-10 h-10 items-center justify-center">
                                        <Ionicons name="camera" size={20} color="white" />
                                    </View>
                                </TouchableOpacity>
                                <Text className="text-gray-400 text-sm mt-4">Tap to change photo</Text>
                            </View>

                            <View className="px-6">
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                                        Your Name
                                    </Text>
                                    <TextInput
                                        className="bg-gray-800 text-white rounded-lg px-4 py-4 text-base"
                                        placeholderTextColor="#6B7280"
                                        value={tempProfileName}
                                        onChangeText={setTempProfileName}
                                        autoCapitalize="words"
                                    />
                                  
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={showPersonalInfoModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowPersonalInfoModal(false)}
            >
                <SafeAreaView className="flex-1 bg-gray-950">
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
                            <TouchableOpacity onPress={() => setShowPersonalInfoModal(false)}>
                                <Text className="text-blue-500 text-lg">Close</Text>
                            </TouchableOpacity>
                            <Text className="text-lg font-semibold text-white">Personal Information</Text>
                            <View style={{ width: 60 }} />
                        </View>

                        <View className="px-6 pt-6">
                            <View className="bg-gray-800 rounded-xl p-4 mb-4">
                                <Text className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                                    Full Name
                                </Text>
                                <Text className="text-white text-lg">
                                    {user?.fullName || "Not provided"}
                                </Text>
                            </View>

                            <View className="bg-gray-800 rounded-xl p-4">
                                <Text className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                                    Email Address
                                </Text>
                                <Text className="text-white text-lg">
                                    {user?.primaryEmailAddress?.emailAddress || "Not provided"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={showNotificationsModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowNotificationsModal(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center px-4">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-md">
                        <View className="items-center mb-6">
                            <Text className="text-xl font-semibold text-gray-900 mb-2">
                                Notification Preferences
                            </Text>
                            <Text className="text-gray-600 text-center text-sm">
                                Choose what notifications you want to receive.
                            </Text>
                        </View>

                        <View className="mb-6">
                            <View className="flex-row items-start py-4 border-b border-gray-100">
                                <Switch
                                    value={pushNotificationsEnabled}
                                    onValueChange={setPushNotificationsEnabled}
                                    trackColor={{ false: '#E5E7EB', true: '#50C878' }}
                                    thumbColor="#ffffff"
                                />
                                <View className="flex-1 ml-4">
                                    <Text className="text-gray-900 font-medium mb-1">
                                        Push Notifications
                                    </Text>
                                    <Text className="text-gray-500 text-sm leading-5">
                                        Receive notifications on your device about updates and activities.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="bg-blue-50 rounded-xl p-3 flex-row mb-6">
                            <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
                            <Text className="text-blue-700 text-xs flex-1">
                                Maximize your app usage by keeping notification settings active.
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowNotificationsModal(false)}
                                className="flex-1 py-3 bg-gray-100 rounded-xl items-center"
                            >
                                <Text className="text-gray-700 font-medium">Discard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowNotificationsModal(false)}
                                className="flex-1 py-3 bg-blue-600 rounded-xl items-center"
                            >
                                <Text className="text-white font-medium">Apply Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            <Modal
                visible={showDisplaySoundModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowDisplaySoundModal(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center px-4">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-md">
                        <View className="items-center mb-6">
                            <Text className="text-xl font-semibold text-gray-900 mb-2">
                                Display & Sound
                            </Text>
                            <Text className="text-gray-600 text-center text-sm">
                                Manage how content is displayed to you.
                            </Text>
                        </View>

                        <View className="mb-6">
                            <View className="flex-row items-start py-4 border-b border-gray-100">
                                <Switch
                                    value={hapticsEnabled}
                                    onValueChange={setHapticsEnabled}
                                    trackColor={{ false: '#E5E7EB', true: '#50C878' }}
                                    thumbColor="#ffffff"
                                />
                                <View className="flex-1 ml-4">
                                    <Text className="text-gray-900 font-medium mb-1">
                                        Enable Haptics
                                    </Text>
                                    <Text className="text-gray-500 text-sm leading-5">
                                        Vibration feedback for interactions and gestures.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="bg-blue-50 rounded-xl p-3 flex-row mb-6">
                            <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
                            <Text className="text-blue-700 text-xs flex-1">
                                Haptic feedback enhances your app experience with tactile responses.
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowDisplaySoundModal(false)}
                                className="flex-1 py-3 bg-gray-100 rounded-xl items-center"
                            >
                                <Text className="text-gray-700 font-medium">Discard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowDisplaySoundModal(false)}
                                className="flex-1 py-3 bg-blue-600 rounded-xl items-center"
                            >
                                <Text className="text-white font-medium">Apply Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}