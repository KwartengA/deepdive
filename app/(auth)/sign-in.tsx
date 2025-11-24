import { View, Text, Image } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { images, icons } from "@/constants";

export default function SignIn() {
  const [form, setForm] = useState({
    email:"",
    password:"",
  })

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded || loading) return;

    setLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error("Sign-in error:", JSON.stringify(err, null, 2));

      const errorCode = err.errors?.[0]?.code;
      const errorMessage = err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message;

      let msg = "Invalid credentials";

      if (errorCode === "form_identifier_not_found") {
        msg = "No account found with this email. Please sign up first.";
      } else if (errorCode === "form_password_incorrect") {
        msg = "Incorrect password. Please try again.";
      } else if (errorCode === "user_locked") {
        msg = "Account locked due to too many attempts. Try again later.";
      } else if (errorMessage) {
        msg = errorMessage;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="relative w-full h-[250px]">
        <Image source={images.signUp} className="z-0 w-full h-[250px]" />
        <Text className="text-4xl text-black font-bold absolute bottom-5 left-5">
          Welcome Back
        </Text>
      </View>
      <View className="p-5">
        <InputField
          label="Email"
          placeholder="Enter email"
          icon={icons.email}
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email : value })}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <InputField
          label="Password"
          placeholder="Enter password"
          icon={icons.lock}
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
          secureTextEntry={true}
          textContentType="password"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <CustomButton
          title={loading ? "Signing In..." : "Sign In"}
          onPress={onSignInPress}
          disabled={loading}
        />
        {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}

        <View className="flex-row justify-center mt-5">
          <Text className="text-gray-500">Don't have an account? </Text>
          <Link href="/(auth)/sign-up">
            <Text className="text-blue-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
