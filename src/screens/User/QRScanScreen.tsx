import { View, Text, StyleSheet, Pressable, Vibration } from "react-native";
import { useEffect, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { Colors } from "../../theme/colors";
import { Typography } from "../../theme/typography";
import { Spacing } from "../../theme/spacing";

export default function QRScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState(false);

  // Store the correct QR locally to avoid multiple database calls
  const [targetQr, setTargetQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestPermission();
    fetchCorrectQR();
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
    }
  };

  const resetScan = () => {
    setScanned(false);
    setError(false);
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 20 }}>نحتاج إذن الكاميرا للمسح</Text>
        <Pressable onPress={requestPermission} style={styles.retryBtn}>
          <Text style={styles.retryText}>منح الإذن</Text>
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

      {/* Overlay & Scan Frame */}
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        {!error && <Text style={styles.scanHint}>ضع الكود داخل الإطار</Text>}
      </View>

      {/* Top Bar */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>رجوع</Text>
      </Pressable>

      {/* Bottom Info */}
      {!error && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            وجّه الكاميرا إلى QR Code
          </Text>
        </View>
      )}

      {/* Error Box */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            QR Code غير صالح
          </Text>

          <Pressable style={styles.retryBtn} onPress={resetScan}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const SCAN_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  scanBox: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
  },

  backBtn: {
    position: "absolute",
    top: Spacing.xl,
    left: Spacing.lg,
    padding: Spacing.sm,
  },

  backText: {
    color: Colors.textLight,
    fontSize: 16,
  },

  infoBox: {
    position: "absolute",
    bottom: Spacing.xl,
    alignSelf: "center",
  },

  infoText: {
    color: Colors.textLight,
    ...Typography.body,
  },

  errorBox: {
    position: "absolute",
    bottom: Spacing.xl,
    alignSelf: "center",
    backgroundColor: Colors.error,
    padding: Spacing.lg,
    borderRadius: 14,
    alignItems: "center",
    width: "80%",
  },

  errorText: {
    color: Colors.textLight,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },

  retryBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },

  retryText: {
    color: Colors.error,
    fontWeight: "600",
  },

  scanHint: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
});