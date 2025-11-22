import { Text, View, Image, Button, TextInput, Modal, Alert } from "react-native";
import { useState } from "react";
import { images, icons } from "@/constants";
import InputField from "@/components/InputField";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import CustomButton from "@/components/CustomButton";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded || loading) return;

    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage ?? "Something went wrong";
      setError(msg);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || loading) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage ?? "Verification error";
      setError(msg);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="relative w-full h-[250px]">
        <Image source={images.signUp} className="z-0 w-full h-[250px]" />
        <Text className="text-4xl text-black font-bold absolute bottom-5 left-5 ">
          Create Your Account
        </Text>
      </View>
      <View className="p-5">
        {!pendingVerification ? (
          <>
            <InputField
              label="Name"
              placeholder="Enter name"
              icon={icons.person}
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
              autoCorrect = {false}
              autoCapitalize="none"
            />
            <InputField
              label="Email"
              placeholder="Enter email"
              icon={icons.email}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
              autoCorrect = {false}
              autoCapitalize="none"
            />
            <InputField
              label="Password"
              placeholder="Enter password"
              icon={icons.lock}
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
              autoCorrect = {false}
              autoCapitalize="none"
            />
            <CustomButton title="Sign Up" onPress={onSignUpPress} disabled={loading}  />
            {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
          </>
        ) : (
           <Modal
            isVisible={pendingVerification}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.6}
            onBackdropPress={() => {}}
            style={{ margin: 0, justifyContent: "flex-end" }}
          >
            <View className="bg-white rounded-t-3xl p-6 pb-10">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

              <Text className="text-2xl font-bold text-center mb-2">
                Verify Your Email
              </Text>
              <Text className="text-gray-600 text-center mb-8 px-4">
                We've sent a 6-digit code to{"\n"}
                <Text className="font-semibold text-black">{form.email}</Text>
              </Text>

              <InputField
                placeholder="000000"
                value={code}
                onChangeText={(text) => {
                  setCode(text.replace(/[^0-9]/g, "").slice(0, 6));
                  setError(""); // clear error when typing
                }}
                keyboardType="numeric"
                maxLength={6}
                className="text-center text-2xl tracking-widest letter-spacing-8 font-bold"
                autoFocus={true}
              />

              {error ? (
                <Text className="text-red-500 text-center mt-4">{error}</Text>
              ) : null}

              <CustomButton
                title={loading ? "Verifying..." : "Verify Code"}
                onPress={onVerifyPress}
                disabled={loading || code.length !== 6}
                className="mt-8"
              />

              <CustomButton
                title="Resend Code"
                onPress={async () => {
                  setLoading(true);
                  try {
                    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                    Alert.alert("Code Sent", "A new code has been sent to your email.");
                  } catch (err) {
                    setError("Failed to resend code");
                  } finally {
                    setLoading(false);
                  }
                }}

                className="mt-4"
              />
            </View>
          </Modal>
      </View>
    </View>
  );
}