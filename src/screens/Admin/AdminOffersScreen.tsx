import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppInput from "../../components/AppInput";
import { db } from "../../firebase/firebaseConfig";
import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";
import { Typography } from "../../theme/typography";

type Offer = {
  id: string;
  title: string;
  description: string;
  expiryDate: string;
};

export default function AdminOffersScreen() {
  const router = useRouter();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  /* 🔹 جلب العروض */
  const fetchOffers = async () => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const data: Offer[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Offer, "id">),
    }));

    setOffers(data);
  };

  /* 🔹 فتح إضافة */
  const openAdd = () => {
    setEditingOffer(null);
    setTitle("");
    setDescription("");
    setExpiryDate("");
    setModalVisible(true);
  };

  /* 🔹 فتح تعديل */
  const openEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setExpiryDate(offer.expiryDate);
    setModalVisible(true);
  };

  /* 🔹 حفظ */
  const saveOffer = async () => {
    if (!title || !description || !expiryDate) {
      Alert.alert("تنبيه", "من فضلك أكمل البيانات");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (editingOffer) {
        await updateDoc(doc(db, "offers", editingOffer.id), {
          title,
          description,
          expiryDate,
        });
      } else {
        await addDoc(collection(db, "offers"), {
          title,
          description,
          expiryDate,
          createdAt: serverTimestamp(),
        });
      }

      setModalVisible(false);
      setTitle("");
      setDescription("");
      setExpiryDate("");
      await fetchOffers(); // ✨ Refresh Immediately (Re-added)
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 حذف */
  const deleteOffer = (id: string) => {
    Alert.alert("تأكيد", "هل تريد حذف العرض؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "offers", id));
          await fetchOffers(); // ✨ Refresh Immediately (Re-added)
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>إدارة العروض</Text>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد عروض حاليًا</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.date}>ينتهي في: {item.expiryDate}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={22} color="#F59E0B" />
              </Pressable>

              <Pressable onPress={() => deleteOffer(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* ➕ زر إضافة */}
      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingOffer ? "تعديل عرض" : "إضافة عرض"}
            </Text>

            <AppInput
              label="العنوان"
              placeholder="أدخل عنوان العرض"
              value={title}
              onChangeText={setTitle}
            />

            <AppInput
              label="الوصف"
              placeholder="أدخل وصف العرض"
              value={description}
              onChangeText={setDescription}
            />

            <AppInput
              label="تاريخ الانتهاء"
              placeholder="مثال: 2025-12-31"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />

            <Pressable
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={saveOffer}
              disabled={loading}
            >
              <Text style={styles.saveText}>
                {editingOffer ? "تحديث" : "حفظ"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  title: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  desc: {
    color: Colors.textSecondary,
    marginTop: 4,
  },

  date: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
  },

  actions: {
    justifyContent: "space-between",
    alignItems: "center",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 80,
    color: Colors.textSecondary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.md,
  },

  saveBtn: {
    backgroundColor: "#F59E0B",
    padding: Spacing.md,
    borderRadius: 14,
    alignItems: "center",
    marginTop: Spacing.md,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancel: {
    textAlign: "center",
    marginTop: Spacing.md,
    color: Colors.textSecondary,
  },
});