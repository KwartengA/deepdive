import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Image } from "react-native";
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
    const [feedbackName, setFeedbackName] = useState("");
    const [feedbackEmail, setFeedbackEmail] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");


    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileName, setProfileName] = useState("");
    const [profileStatus, setProfileStatus] = useState("");

    const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
    const [tempProfileName, setTempProfileName] = useState("");
    const [tempProfileStatus, setTempProfileStatus] = useState("");
    
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
        setTempProfileStatus(profileStatus);
        setShowProfileModal(true);
    };

    const handleSaveProfile = () => {
        setProfileImage(tempProfileImage);
        setProfileName(tempProfileName);
        setProfileStatus(tempProfileStatus);
        setShowProfileModal(false);
    };

    const handleCancelProfile = () => {
        setTempProfileImage(profileImage);
        setTempProfileName(profileName);
        setTempProfileStatus(profileStatus);
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
        <SafeAreaView className="flex-1 bg-gray-950">
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

                    {profileStatus && (
                        <Text className="text-sm text-gray-600 mb-3">
                            {profileStatus}
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={handleEditProfile}
                        className="mt-3 px-6 py-2 bg-black rounded-md"
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
                            icon="person-outline"
                            iconColor="#3b82f6"
                            title="Personal Information"
                            hasAccordion
                        >
                            <Text className="text-gray-600 text-sm">
                                View and edit your personal details
                            </Text>
                        </SettingsMenuItem>

                        <SettingsMenuItem
                            iconFamily="Ionicons"
                            icon="timer-outline"
                            iconColor="#CD5700"
                            title="Timer Preferences"
                            hasAccordion
                        >
                            <Text className="text-gray-600 text-sm">
                                Customize your timer
                            </Text>
                        </SettingsMenuItem>

                        <SettingsMenuItem
                            iconFamily="Ionicons"
                            icon="hand-left"
                            iconColor="#AFEEEE"
                            title="Display & Sound"
                            hasAccordion
                        >
                            <Text className="text-gray-600 text-sm">
                                Configure your haptics
                            </Text>
                        </SettingsMenuItem>

                        <SettingsMenuItem
                            iconFamily="Ionicons"
                            icon="notifications-outline"
                            iconColor="#e60023"
                            title="Notifications"
                            hasAccordion
                        >
                            <Text className="text-gray-600 text-sm">
                                Configure notification preferences
                            </Text>
                        </SettingsMenuItem>

                    <SettingsMenuItem
                            iconFamily="MaterialIcons"
                            icon="feedback"
                            iconColor="#FEBE10"
                            title="Submit Feedback"
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

                                <View className="mb-6">
                                    <Text className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                                        Status
                                    </Text>
                                    <TextInput
                                        className="bg-gray-800 text-white rounded-lg px-4 py-4 text-base"
                                        placeholderTextColor="#6B7280"
                                        value={tempProfileStatus}
                                        onChangeText={setTempProfileStatus}
                                        multiline
                                    />
                    
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}