import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/colors";
export default function SelectRoleScreen() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* === زر الإعدادات (بسيط جداً في الزاوية) === */}
      <Pressable
        onPress={() => router.push("/admin-login")}
        hitSlop={20}
        style={({ pressed }) => [
          styles.settingsBtn,
          pressed && { opacity: 0.5 },
        ]}
      >
        <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
      </Pressable>

      {/* === المحتوى الرئيسي === */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* العناوين */}
        <View style={styles.headerText}>
          <Text style={styles.welcome}>مرحباً بك</Text>
          <Text style={styles.appName}>نظام الرعاية الطبية</Text>
        </View>

        {/* زر الفحص (Scan) - تصميم نظيف */}
        <Pressable
          onPress={() => router.push("/user-scan")}
          style={({ pressed }) => [
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <Animated.View
            style={[
              styles.scanCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons name="qr-code-outline" size={60} color={Colors.textLight} />
            <Text style={styles.scanText}>اضغط هنا</Text>
          </Animated.View>
        </Pressable>

        <Text style={styles.hint}>للدخول، قم بمسح الرمز (QR)</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  settingsBtn: {
    position: "absolute",
    top: 50,
    left: 24,
    padding: 0,
    zIndex: 10,
  },

  content: {
    alignItems: "center",
    width: "100%",
  },

  headerText: {
    marginBottom: 50,
    alignItems: "center",
  },

  welcome: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },

  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.accent,
    letterSpacing: 0.5,
  },

  // الزر الدائري (Clean & Minimal)
  scanCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    // ظل خفيف وناعم جداً (Soft Shadow)
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },

  scanText: {
    marginTop: 10,
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },

  hint: {
    marginTop: 40,
    fontSize: 14,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
});