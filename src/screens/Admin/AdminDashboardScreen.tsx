import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getCountFromServer } from "firebase/firestore";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { db } from "../../firebase/firebaseConfig";
import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [offersCount, setOffersCount] = useState(0);

  // تحديث العدد كل ما نرجع للصفحة دي (Focus)
  useFocusEffect(
    useCallback(() => {
      fetchOffersCount();
    }, [])
  );

  /** ✅ عدّ العروض من Firestore (MOVED TO getCountFromServer FOR COST SAVING) */
  const fetchOffersCount = async () => {
    try {
      const coll = collection(db, "offers");
      const snapshot = await getCountFromServer(coll);
      setOffersCount(snapshot.data().count);
    } catch (e) {
      console.log("Error fetching offers count", e);
      setOffersCount(0);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة تحكم الأدمن</Text>

        {/* أيقونة خروج */}
        <Pressable
          onPress={() => router.replace("/select-role")}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.accent} />
        </Pressable>
      </View>

      {/* ===== Overview Title Box ===== */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBox}>
          <Ionicons name="analytics-outline" size={18} color={Colors.accent} />
          <Text style={styles.sectionBoxText}>نظرة عامة</Text>
        </View>

        <Pressable onPress={fetchOffersCount} style={styles.refreshBtn}>
          <Ionicons name="refresh-circle" size={28} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Overview Card */}
      <View style={styles.overviewCard}>
        <Ionicons name="pricetag" size={28} color={Colors.accent} />
        <Text style={styles.cardNumber}>{offersCount}</Text>
        <Text style={styles.cardLabel}>عدد العروض</Text>
      </View>

      {/* ===== Quick Actions Title Box ===== */}
      <View style={styles.sectionBox}>
        <Ionicons name="flash-outline" size={18} color={Colors.accent} />
        <Text style={styles.sectionBoxText}>إجراءات سريعة</Text>
      </View>

      {/* Actions */}
      <ActionCard
        icon={<Ionicons name="medical" size={22} color="#3B82F6" />}
        title="إدارة الخدمات"
        subtitle="إضافة أو تعديل الخدمات الطبية"
        onPress={() => router.push("/admin-services")}
      />



      <ActionCard
        icon={<Ionicons name="pricetags" size={22} color="#F59E0B" />}
        title="إدارة العروض"
        subtitle="عرض أو تعديل العروض"
        onPress={() => router.push("/admin-offers")}
      />



      <ActionCard
        icon={<MaterialIcons name="security" size={22} color="#6366F1" />}
        title="إعدادات الأمان"
        subtitle="بيانات الأدمن و QR Code"
        onPress={() => router.push("/admin-settings")}
      />
    </ScrollView>
  );
}

/* ===== Action Card ===== */
function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionLeft}>
        <View style={styles.iconBox}>{icon}</View>
        <View>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
    </Pressable>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },

  header: {
    flexDirection: "row-reverse", // 🆕 RTL support
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

  logoutButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
  },

  /* Section Header Container */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },

  refreshBtn: {
    padding: 4,
  },

  /* Section Title Box */
  sectionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF7ED",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  sectionBoxText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accent,
  },

  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  cardNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.accent,
    marginTop: Spacing.sm,
  },

  cardLabel: {
    marginTop: 4,
    color: Colors.textSecondary,
  },

  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  actionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});