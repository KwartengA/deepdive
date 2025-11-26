import { Text, View, Image, Button, TextInput, Alert, Animated, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { useState, useEffect, useRef } from "react";
import { images, icons } from "@/constants";
import InputField from "@/components/InputField";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { StatusBar } from "expo-status-bar";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (verificationSuccess) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [verificationSuccess]);

  const onSignUpPress = async () => {
    if (!isLoaded || loading) return;

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.name,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setCode("");
      setPendingVerification(true);
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage ?? "Something went wrong";
      setError(msg);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded || loading) return;

    setLoading(true);
    setError("");

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (err: any) {
      const msg = err.errors?.[0]?.longMessage ?? "Failed to resend code.";
      setError(msg);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || loading) return;

    if (code.length !== 6) {
      setError("Please enter a 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("Verification status:", signUpAttempt.status);

      if (signUpAttempt.status === "complete") {
        console.log("Setting active session...");
        await setActive({ session: signUpAttempt.createdSessionId });
        console.log("Session activated, showing success...");

        setPendingVerification(false);
        setVerificationSuccess(true);

        setTimeout(() => {
          setVerificationSuccess(false);
          router.replace("/(tabs)/home");
        }, 2000);
      } else {
        console.error("Sign up status:", signUpAttempt.status);
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", JSON.stringify(err, null, 2));

      const errorCode = err.errors?.[0]?.code;
      const errorMessage = err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message;

      if (errorCode === "verification_already_verified") {
        console.log("Email already verified, redirecting to sign in...");
        setPendingVerification(false);
        Alert.alert(
          "Already Verified",
          "This email has already been verified. Please sign in.",
          [
            {
              text: "Go to Sign In",
              onPress: () => router.replace("/(auth)/sign-in"),
            },
          ]
        );
      } else if (errorCode === "form_code_incorrect") {
        setError("Invalid code. Please check and try again.");
      } else if (errorCode === "verification_expired") {
        setError("Code expired. Please request a new one.");
      } else {
        const msg = errorMessage ?? "Verification failed. Please try again.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden/>
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
            <CustomButton
              title={loading ? "Creating Account..." : "Sign Up"}
              onPress={onSignUpPress}
              disabled={loading}
            />
            {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}

            <View className="flex-row justify-center mt-5">
              <Text className="text-gray-500">Already have an account? </Text>
              <Link href="/(auth)/sign-in">
                <Text className="text-blue-500">Sign In</Text>
              </Link>
            </View>

            <View className="flex-row justify-center mt-5">
              <TouchableOpacity hitSlop={0.5} onPress={()=>{
                router.replace("/(tabs)/home");
              }}>
                <Text>Home</Text>
              </TouchableOpacity>
            </View>
          </>
          
        ) : null}
      </View>

      <Modal
        isVisible={pendingVerification}
        onBackdropPress={() => {}}
        backdropOpacity={0.5}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View className="bg-white rounded-3xl p-6 pb-10 mx-5 w-11/12 max-w-md">
          <View className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

          <Text className="text-2xl font-bold text-center mb-2">
            Verify Your Email
          </Text>
          <Text className="text-gray-600 text-center mb-8 px-4">
            We've sent a 6-digit code to{"\n"}
            <Text className="font-semibold text-black">{form.email}</Text>
          </Text>

          <InputField
            label=""
            placeholder="000000"
            value={code}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              setCode(cleaned);
              if (error) setError("");
            }}
            keyboardType="number-pad"
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

          <TouchableOpacity
            onPress={onResendCode}
            disabled={loading}
            className="mt-4 py-2"
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <Text className="text-blue-500 text-center text-sm">
              Didn't receive the code? Resend
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={verificationSuccess}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
        useNativeDriver
      >
        <View className="bg-white rounded-3xl p-8 mx-5 w-11/12 max-w-md items-center">
          <View className="bg-green-100 rounded-full p-6 mb-6">
            <Image source={images.check} className="w-20 h-20" resizeMode="contain" />
          </View>

          <Text className="text-2xl font-bold text-center text-green-600 mb-3">
            Account Verified!
          </Text>

          <Text className="text-gray-600 text-center mb-4">
            Your email has been successfully verified.
          </Text>

          <Animated.Text
            style={{ opacity: fadeAnim }}
            className="text-gray-500 text-center text-sm"
          >
            Redirecting to home screen...
          </Animated.Text>
        </View>
      </Modal>
    </View>
  );
}