import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/colors";

export default function SelectRoleScreen() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence animations for better performance on Android
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Start loops AFTER intro animation
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(arrowAnim, {
              toValue: -10,
              duration: 800,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.quad),
            }),
            Animated.timing(arrowAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.quad),
            }),
          ])
        ),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* === Settings Button === */}
      <Pressable
        onPress={() => router.push("/admin-login")}
        hitSlop={20}
        style={({ pressed }) => [
          styles.settingsBtn,
          pressed && { opacity: 0.5 },
        ]}
      >
        <View style={styles.settingsIconBg}>
          <Ionicons name="settings-outline" size={22} color={Colors.accent} />
        </View>
      </Pressable>

      {/* === Main Content === */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Header Strings */}
        <View style={styles.headerText}>
          <Text style={styles.welcome}>مرحباً بك في</Text>
          <Text style={styles.appName}>ميديكال هوم</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>للخدمات التأمينية</Text>
          </View>
        </View>

        {/* Scan Button Area */}
        <View style={styles.scanWrapper}>
          <Pressable
            onPress={() => router.push("/user-scan")}
            style={({ pressed }) => [
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <Animated.View
              style={[
                styles.scanCircle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.innerCircle}>
                <Ionicons name="qr-code" size={64} color={Colors.accent} />
              </View>
              <Text style={styles.scanText}>إبدأ المسح</Text>
            </Animated.View>
          </Pressable>

          {/* Animated Arrow instead of static text */}
          <Animated.View
            style={[
              styles.arrowContainer,
              { transform: [{ translateY: arrowAnim }] }
            ]}
          >
            <Ionicons name="chevron-up" size={28} color={Colors.accent} style={{ opacity: 0.6 }} />
            <Text style={styles.arrowText}>اضغط هنا للدخول</Text>
          </Animated.View>
        </View>
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
    padding: 24,
  },

  settingsBtn: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
  },

  settingsIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },

  appName: {
    fontSize: 34,
    fontWeight: "900",
    color: Colors.accent, // Switched to Accent
    textAlign: "center",
    letterSpacing: -0.5,
  },

  badge: {
    backgroundColor: "rgba(199, 122, 30, 0.1)", // Accent color transparent (Honey/Gold)
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },

  badgeText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.accent, // Switched to Accent
  },

  scanWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  scanCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: Colors.accent, // Switched to Accent
    justifyContent: "center",
    alignItems: "center",
    elevation: 15,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },

  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.textLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  scanText: {
    color: Colors.textLight,
    fontSize: 19,
    fontWeight: "800",
  },

  arrowContainer: {
    marginTop: 40,
    alignItems: "center",
  },

  arrowText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 0,
  },
});
