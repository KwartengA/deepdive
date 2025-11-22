import { View, Text, TextInput, TouchableOpacity, Button } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded || loading) return;

    setLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage ?? "Invalid credentials";
      setError(msg);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl text-black font-bold mb-5">Sign In</Text>
      <TextInput
        className="border border-gray-300 p-2 rounded mb-4"
        placeholder="Enter email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextInput
        className="border border-gray-300 p-2 rounded mb-4"
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        textContentType="password"
      />
      <Button title="Sign In" onPress={onSignInPress} disabled={loading} />
      {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-500">Don't have an account? </Text>
        <Link href="/(auth)/sign-up">
          <Text className="text-blue-500">Sign Up</Text>
        </Link>
      </View>
    </View>
  );
}
