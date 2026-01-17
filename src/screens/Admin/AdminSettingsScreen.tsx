import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import AppInput from "../../components/AppInput";
import { db } from "../../firebase/firebaseConfig";
import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";

export default function AdminSettingsScreen() {
  const router = useRouter();

  const [currentAdmin, setCurrentAdmin] = useState("admin");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [qrValue, setQrValue] = useState("");
  const [manualQR, setManualQR] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  /* 🔹 تحميل بيانات الأدمن و QR */
  const loadSettings = async () => {
    try {
      const ref = doc(db, "admin_settings", "current");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setCurrentAdmin(data.username);
        setQrValue(data.qrValue);
      }
    } catch (e) {
      console.log(e);
    }
  };

  /* 🔹 تحديث بيانات الأدمن */
  const updateCredentials = async () => {
    if (!newUsername && !newPassword) {
      Alert.alert("تنبيه", "أدخل بيانات للتحديث");
      return;
    }

    try {
      const ref = doc(db, "admin_settings", "current");
      const payload: any = {};

      if (newUsername) payload.username = newUsername.trim();
      if (newPassword) payload.passwordHash = newPassword.trim();

      await updateDoc(ref, payload);

      Alert.alert("تم", "تم تحديث البيانات بنجاح");
      setNewUsername("");
      setNewPassword("");
      loadSettings();
    } catch (e) {
      Alert.alert("خطأ", "فشل تحديث البيانات");
    }
  };

  /* 🔹 تحديث QR يدوي */
  const updateQRManual = async () => {
    if (!manualQR) {
      Alert.alert("تنبيه", "أدخل قيمة QR");
      return;
    }

    try {
      const ref = doc(db, "admin_settings", "current");
      await updateDoc(ref, { qrValue: manualQR.trim() });
      setQrValue(manualQR.trim());
      setManualQR("");
      Alert.alert("تم", "تم تحديث QR Code");
    } catch (e) {
      Alert.alert("خطأ", "فشل تحديث QR");
    }
  };

  /* 🔹 إعادة توليد QR */
  const regenerateQR = async () => {
    const newQR = `QR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const ref = doc(db, "admin_settings", "current");
      await updateDoc(ref, { qrValue: newQR });
      setQrValue(newQR);
      Alert.alert("تم", "تم توليد QR جديد");
    } catch (e) {
      Alert.alert("خطأ", "فشل توليد QR");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle}>إعدادات الأمان</Text>
      </View>

      {/* Admin Info */}
      <View style={styles.infoCard}>
        <MaterialIcons name="security" size={26} color={Colors.primary} />
        <Text style={styles.infoText}>
          الأدمن الحالي: {currentAdmin}
        </Text>
      </View>

      {/* Update Credentials */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>تحديث بيانات الأدمن</Text>

        <AppInput
          label="اسم المستخدم الجديد"
          placeholder="اتركه فارغًا إذا لا تريد التغيير"
          value={newUsername}
          onChangeText={setNewUsername}
        />

        <AppInput
          label="كلمة المرور الجديدة"
          placeholder="اتركه فارغًا إذا لا تريد التغيير"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Pressable style={styles.primaryButton} onPress={updateCredentials}>
          <Text style={styles.primaryButtonText}>تحديث البيانات</Text>
        </Pressable>
      </View>

      {/* QR Code */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>QR Code المستخدمين</Text>

        <View style={styles.qrBox}>
          {qrValue ? <QRCode value={qrValue} size={180} /> : null}
          <Text style={styles.qrLabel}>QR الحالي</Text>
        </View>

        <AppInput
          label="قيمة QR Code"
          placeholder="أدخل قيمة جديدة"
          value={manualQR}
          onChangeText={setManualQR}
        />

        <Pressable style={styles.primaryButton} onPress={updateQRManual}>
          <Text style={styles.primaryButtonText}>تحديث QR Code</Text>
        </Pressable>

        <Pressable style={styles.dangerButton} onPress={regenerateQR}>
          <Text style={styles.dangerButtonText}>
            إعادة توليد QR Code
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },

  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E0F2FE",
    padding: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.lg,
  },

  infoText: {
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardTitle: {
    fontWeight: "700",
    marginBottom: Spacing.md,
    color: Colors.textPrimary,
  },

  qrBox: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  qrLabel: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
  },

  primaryButton: {
    backgroundColor: "#F59E0B",
    padding: Spacing.md,
    borderRadius: 14,
    alignItems: "center",
    marginTop: Spacing.md,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  dangerButton: {
    backgroundColor: "#EF4444",
    padding: Spacing.md,
    borderRadius: 14,
    alignItems: "center",
    marginTop: Spacing.md,
  },

  dangerButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});