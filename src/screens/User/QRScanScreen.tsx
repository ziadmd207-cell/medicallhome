import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, Vibration, View } from "react-native";

import { db } from "../../firebase/firebaseConfig";
import { Colors } from "../../theme/colors";

export default function QRScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState(false);

  // Store the correct QR locally to avoid multiple database calls
  const [targetQr, setTargetQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const qrIconAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current; // For the floating effect

  useEffect(() => {
    requestPermission();
    fetchCorrectQR();

    // Scan Line Loop (Runs forever)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // QR Guide Card Animation: Slow Emergence -> Float -> Hide
    Animated.sequence([
      Animated.delay(400),
      // 1. Slow Emergence (1.5 seconds)
      Animated.timing(qrIconAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 2. Floating up and down (for 2 seconds)
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(floatAnim, {
              toValue: -15, // Move up
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(floatAnim, {
              toValue: 0, // Back to center
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          { iterations: 1 } // Do it once (2 seconds total)
        )
      ]),
      // 3. Hide
      Animated.timing(qrIconAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 1. Fetch Correct QR ONE TIME only
  const fetchCorrectQR = async () => {
    try {
      const docRef = doc(db, "admin_settings", "current");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setTargetQr(snap.data().qrValue);
      }
    } catch (e) {
      console.log("Error fetching QR config", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned || loading || !targetQr) return;

    setScanned(true); // Stop scanning immediately
    Vibration.vibrate(); // Feedback

    // 2. Compare instantly (No internet lag)
    if (data.trim() === targetQr.trim()) {
      router.replace("/user-home");
    } else {
      setError(true);
      Vibration.vibrate([0, 100, 50, 100]); // Error vibration pattern
    }
  };

  const resetScan = () => {
    setScanned(false);
    setError(false);
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="camera-reverse-outline" size={80} color={Colors.accent} />
        <Text style={styles.permissionText}>نحتاج إذن الكاميرا للمسح</Text>
        <Pressable onPress={requestPermission} style={styles.grantBtn}>
          <Text style={styles.grantText}>منح الإذن</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Modern Overlay */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            {/* Scan Corners */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated QR Guide - White Rectangular Card */}
            <Animated.View
              style={[
                styles.qrGuideCard,
                {
                  opacity: qrIconAnim,
                  transform: [
                    {
                      scale: qrIconAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      })
                    },
                    {
                      translateY: Animated.add(
                        qrIconAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [60, 0],
                        }),
                        floatAnim
                      )
                    }
                  ]
                }
              ]}
            >
              <View style={styles.qrCardInner}>
                <Ionicons name="qr-code" size={100} color="#1A1A1A" />
                <Text style={styles.qrCardText}>ضع الرمز داخل الإطار للمسح</Text>
              </View>
            </Animated.View>

            {/* Scanning Beam Animation */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, SCAN_SIZE],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}>
          {!error && <Text style={styles.scanHint}>ضع الكود داخل الإطار للمسح</Text>}
        </View>
      </View>


      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={28} color={Colors.textLight} />
        </Pressable>
        <Text style={styles.titleText}>ماسح الرمز</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Error / Status UI */}
      {error && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={50} color={Colors.error} />
            <Text style={styles.errorText}>الرمز غير مطابق</Text>
            <Text style={styles.errorSubText}>تأكد من مسح الرمز الخاص بالمركز</Text>
            <Pressable style={styles.retryBtn} onPress={resetScan}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const SCAN_SIZE = 260;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  permissionText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
  },
  grantBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 25,
  },
  grantText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleContainer: {
    flexDirection: "row",
    height: SCAN_SIZE,
  },
  focusedContainer: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: "relative",
  },
  // Corners Styling
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: Colors.accent,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    width: "100%",
    height: 3,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    position: "absolute",
    zIndex: 2,
  },
  qrGuideCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  qrCardInner: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 24,
    alignItems: "center",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    width: SCAN_SIZE - 20, // Rectangular feel
  },
  qrCardText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  scanHint: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    overflow: "hidden",
  },
  topBar: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  errorCard: {
    width: "85%",
    backgroundColor: Colors.surface,
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    elevation: 10,
  },
  errorText: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 15,
  },
  errorSubText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  retryBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
