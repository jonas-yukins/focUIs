import React, { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, ImageBackground } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useOAuth, useUser, useAuth } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  
  const { startOAuthFlow: startGoogleAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startAppleAuthFlow } = useOAuth({
    strategy: "oauth_apple",
  });

  const backgroundUri = useBackgroundAsset();

  useEffect(() => {
    if (isSignedIn) {
      navigation.navigate("HomeScreen");
    }
  }, [userLoaded, authLoaded, isSignedIn, user]);

  const onPress = async (authType: string) => {
    try {
      if (authType === "google") {
        const result = await startGoogleAuthFlow();
        
        const { createdSessionId, setActive, signIn, signUp } = result;
        
        if (createdSessionId) {
          await setActive({ session: createdSessionId });
          navigation.navigate("HomeScreen");
        } else {
          // Handle sign-up flow for new users
          if (signUp && signUp.status === "missing_requirements") {
            // Check if phone number is truly required or optional
            const isPhoneRequired = signUp.requiredFields.includes("phone_number");
            
            if (isPhoneRequired) {
              // If phone is required, we need to handle this differently
              // For now, just try to create the account anyway
              try {
                await signUp.update({
                  phoneNumber: "+1234567890" // Dummy number - you should handle this properly
                });
                
                const { createdSessionId: newSessionId } = await signUp.create({});
                
                if (newSessionId) {
                  await setActive({ session: newSessionId });
                  navigation.navigate("HomeScreen");
                }
              } catch (updateError) {
                Alert.alert(
                  "Configuration Issue",
                  "Your Clerk dashboard requires a phone number for sign-ups. Please update your Clerk dashboard settings to make phone number optional, or implement a phone number collection screen.",
                  [{ text: "OK" }]
                );
              }
            } else {
              // Phone is optional, just create the user
              try {
                const { createdSessionId: newSessionId } = await signUp.create({});
                
                if (newSessionId) {
                  await setActive({ session: newSessionId });
                  navigation.navigate("HomeScreen");
                }
              } catch (signUpError) {
                // Sign-up error handled silently
              }
            }
          } else if (signIn && signIn.firstFactorVerification?.error) {
            Alert.alert(
              "Sign In Error",
              "This Google account is not associated with an existing user. Please sign up first.",
              [{ text: "OK" }]
            );
          }
        }
      } else if (authType === "apple") {
        const result = await startAppleAuthFlow();
        
        const { createdSessionId, setActive } = result;
        
        if (createdSessionId) {
          await setActive({ session: createdSessionId });
          navigation.navigate("HomeScreen");
        }
      }
    } catch (err) {
      Alert.alert(
        "Authentication Error",
        `Failed to sign in with ${authType}. Error: ${err.message || "Unknown error"}`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Image
              source={require("../assets/icons/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Log in to your account</Text>
            <Text style={styles.subtitle}>Welcome! Please login below.</Text>
            <TouchableOpacity
              style={styles.buttonGoogle}
              onPress={() => onPress("google")}
            >
              <Image
                style={styles.googleIcon}
                source={require("../assets/icons/google.png")}
              />
              <Text style={{ ...styles.buttonText, color: "#F7F7F7" }}>
                Continue with Google
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonApple}
              onPress={() => onPress("apple")}
            >
              <AntDesign name="apple1" size={24} color="#F7F7F7" />
              <Text
                style={{ ...styles.buttonText, color: "#F7F7F7", marginLeft: 12 }}
              >
                Continue with Apple
              </Text>
            </TouchableOpacity>
            <View style={styles.signupContainer}>
              <Text style={{ fontFamily: "Regular", color: "#C8D2E0" }}>Don’t have an account? </Text>
              <Text style={{ color: "#C8D2E0" }}>Sign up above.</Text>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  card: {
    backgroundColor: 'rgba(23, 47, 80, 0.7)',
    padding: 24,
    alignItems: "center",
    width: "92%",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 74,
    height: 74,
    marginTop: 20,
  },
  title: {
    marginTop: 49,
    fontSize: RFValue(21),
    fontFamily: "SemiBold",
    color: "#F7F7F7",
  },
  subtitle: {
    marginTop: 8,
    fontSize: RFValue(14),
    color: "#C8D2E0",
    fontFamily: "Regular",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#344054",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontFamily: "Regular",
    fontSize: RFValue(14),
    color: "#F7F7F7",
    backgroundColor: 'rgba(30, 40, 60, 0.7)',
  },
  buttonEmail: {
    backgroundColor: "#172F50",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 24,
    minHeight: 44,
  },
  buttonText: {
    textAlign: "center",
    color: "#F7F7F7",
    fontFamily: "SemiBold",
    fontSize: RFValue(14),
  },
  buttonTextWithIcon: {
    marginLeft: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#000",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#000",
    fontFamily: "Medium",
  },
  buttonGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(30, 40, 60, 0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#23304A",
    width: "100%",
    marginBottom: 12,
    height: 44,
  },
  buttonApple: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(30, 40, 60, 0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#23304A",
    width: "100%",
    marginBottom: 32,
    height: 44,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  signupText: {
    color: "#4D9DE0",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  errorText: {
    fontSize: RFValue(14),
    color: "tomato",
    fontFamily: "Medium",
    alignSelf: "flex-start",
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default LoginScreen;
