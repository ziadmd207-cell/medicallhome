import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";

import { db } from "../../firebase/firebaseConfig";

// Colors match the "Restricted Access" dark UI
const THEME = {
  darkBg: "#F8FAFC", // ⚪ Light background
  cardBg: "#FFFFFF",
  accent: "#D68C22", // Bronze/Gold color
  textMain: "#1E293B", // Dark text
  textMuted: "#64748B",
  inputBg: "#F1F5F9", // Light input background
};

export default function AdminLoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Store real credentials locally to avoid DB spam
  const [serverCredentials, setServerCredentials] = useState<any>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 🎬 Animations (Fade & Slide Up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 1. Start Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Fetch Credentials ONCE
    fetchAdminCredentials();
  }, []);

  const fetchAdminCredentials = async () => {
    try {
      const docRef = doc(db, "admin_settings", "current");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setServerCredentials(snap.data());
        setIsDataLoaded(true);
      } else {
        Alert.alert("خطأ نظام", "بيانات الأدمن غير موجودة في السيرفر");
      }
    } catch (error) {
      console.log("Network Error", error);
      // Silent fail, user will see error when they try to click login
    }
  };

  /* ===== Login Logic (Optimized) ===== */
  const handleLogin = async () => {
    // 1. Validation
    if (!username || !password) {
      Alert.alert("مطلوب", "أدخل اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);

    // 2. Check if we have the server data
    if (!isDataLoaded || !serverCredentials) {
      // Try fetching again (maybe internet is back)
      await fetchAdminCredentials();

      // If still failed
      if (!serverCredentials) {
        setLoading(false);
        Alert.alert("خطأ اتصال", "تأكد من وجود إنترنت ثم حاول مرة أخرى");
        return;
      }
    }

    // 3. Compare Locally (Instant & No DB Cost)
    // Simulate tiny delay for better UX (feels like processing)
    setTimeout(() => {
      const storedUser = serverCredentials.username;
      const storedPass = serverCredentials.passwordHash;

      if (username.trim() === storedUser && password.trim() === storedPass) {
        router.replace("/admin-dashboard");
      } else {
        Vibration.vibrate(); // Add shake/vibrate for feedback
        Alert.alert("دخول مرفوض", "اسم المستخدم أو كلمة المرور خطأ");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.contentBox,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          },
        ]}
      >
        {/* === Lock Icon Circle === */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={28} color={THEME.accent} />
          </View>
        </View>

        {/* === Typography === */}
        <Text style={styles.title}>RESTRICTED ACCESS</Text>
        <Text style={styles.subtitle}>Enter Administrator Credentials</Text>

        {/* === Form === */}
        <View style={styles.form}>

          {/* Identity ID Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={THEME.accent} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={THEME.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Passkey Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color={THEME.accent} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={THEME.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* === Authenticate Button === */}
          <Pressable
            style={({ pressed }) => [
              styles.authBtn,
              pressed && { opacity: 0.9 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authBtnText}>AUTHENTICATE</Text>
            )}
          </Pressable>

          {/* === Bottom Link === */}
          <Pressable onPress={() => router.back()} style={{ marginTop: 24 }}>
            <Text style={styles.backLink}>{"< Return to Public Access"}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

/* ===== Styles to match Image ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.darkBg,
    justifyContent: "center",
    alignItems: "center",
  },

  contentBox: {
    width: "100%",
    paddingHorizontal: 30,
    alignItems: "center",
    maxWidth: 400, // Prevent stretching on wide screens (tablets)
  },

  iconContainer: {
    marginBottom: 24,
    alignItems: "center",
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(214, 140, 34, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: "center",
    fontVariant: ["small-caps"], // Optional if font supports it
  },

  subtitle: {
    fontSize: 12,
    color: THEME.textMuted,
    marginBottom: 48,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  form: {
    width: "100%",
    gap: 16,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 56,
    paddingHorizontal: 16,
  },

  inputIcon: {
    marginRight: 14,
    opacity: 0.8,
  },

  input: {
    flex: 1,
    color: THEME.textMain,
    fontSize: 14,
    height: "100%",
    fontWeight: "500",
  },

  authBtn: {
    backgroundColor: THEME.accent,
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8, // Android shadow
  },

  authBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1.2,
  },

  backLink: {
    color: THEME.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});