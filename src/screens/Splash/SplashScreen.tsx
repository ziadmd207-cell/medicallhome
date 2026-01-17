// src/screens/Splash/SplashScreen.tsx

import { Ionicons } from "@expo/vector-icons"; // For retry icon
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";

export default function SplashScreen() {
  const router = useRouter();

  // State for Internet Check
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Start Process
    checkInternetAndLoad();
  }, []);

  const checkInternetAndLoad = async () => {
    setConnectionStatus("checking");

    // Reset Progress
    progressAnim.setValue(0);

    // Start Progress Bar (Visual: 3.5 seconds)
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3500,
      useNativeDriver: false,
    }).start(() => {
      // Check status after animation ends
      setTimeout(() => {
        // Proceed only if connected
        setConnectionStatus(status => {
          if (status === "connected") {
            finishSplash();
          }
          return status;
        });
      }, 500);
    });

    try {
      // Background check (silent)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok || response.status < 500) {
        setConnectionStatus("connected");
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      setConnectionStatus("disconnected");
    }
  };

  const finishSplash = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace("/select-role");
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Progress Bar Container */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
                // Change color if disconnected
                backgroundColor: connectionStatus === "disconnected" ? "#EF4444" : "#F59E0B",
              },
            ]}
          />
        </View>

        {/* Status Text & Retry Button */}
        {connectionStatus === "disconnected" ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>لا يوجد اتصال بالإنترنت!</Text>
            <Pressable style={styles.retryBtn} onPress={checkInternetAndLoad}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        )}

      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Medical App v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },

  logo: {
    width: 250,
    height: 250,
    marginBottom: Spacing.xl,
  },

  progressContainer: {
    width: 200,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 15,
  },

  progressBar: {
    height: "100%",
    borderRadius: 3,
  },

  loadingText: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
  },

  // Error State Styles
  errorBox: {
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    color: "#EF4444", // Red
    fontSize: 14,
    fontWeight: "700",
  },
  retryBtn: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  retryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  footer: {
    position: "absolute",
    bottom: 40,
    opacity: 0.6,
  },

  footerText: {
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
});