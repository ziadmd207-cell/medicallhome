import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppInput from "../../components/AppInput";
import { db } from "../../firebase/firebaseConfig";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";

/* ===== Constants (From Original Design) ===== */
const GOVERNORATES = [
  "الإسكندرية", "الإسماعيلية", "أسوان", "أسيوط", "الأقصر", "البحر الأحمر", "البحيرة",
  "بني سويف", "بورسعيد", "جنوب سيناء", "الجيزة", "الدقهلية", "دمياط", "سوهاج", "السويس",
  "الشرقية", "شمال سيناء", "الغربية", "الفيوم", "القاهرة", "القليوبية", "قنا",
  "كفر الشيخ", "مطروح", "المنوفية", "المنيا", "الوادي الجديد",
];

const SERVICE_TYPES = [
  { label: "مستشفيات", icon: "business" },
  { label: "معامل تحاليل", icon: "flask" },
  { label: "مراكز أشعة", icon: "radio" },
  { label: "عيادات ومراكز طبية", icon: "heart" },
  { label: "صيدليات", icon: "medkit" },
  { label: "مراكز أسنان", icon: "happy" },
  { label: "مراكز علاج طبيعي", icon: "fitness" },
  { label: "عيون وبصريات", icon: "eye" },
];

type Service = {
  id: string;
  name: string;
  address: string;
  description: string;
  governorate: string;
  serviceType: string;
  imageUrl: string;
};

export default function AdminServicesScreen() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* State */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationUrl, setLocationUrl] = useState(""); // 🆕
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false); // Loading state

  const [showGov, setShowGov] = useState(false);
  const [showType, setShowType] = useState(false);
  const [govSearch, setGovSearch] = useState("");

  useEffect(() => {
    fetchServices();
    ImagePicker.requestMediaLibraryPermissionsAsync();
  }, []);

  /* ===== Fetch Logic ===== */
  const fetchServices = async () => {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setServices(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  };

  /* ===== Image Picker & Upload Logic ===== */
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!res.canceled) {
      const asset = res.assets[0];

      // 1. Validation: File Size (Max 1MB)
      // Note: asset.fileSize is in bytes. 1MB = 1024 * 1024 bytes.
      if (asset.fileSize && asset.fileSize > 1024 * 1024) {
        Alert.alert("حجم كبير", "عفواً، أقصى حجم مسموح للصورة هو 1 ميجابايت.");
        return;
      }

      // 2. Validation: File Type (jpeg, png, webp)
      // We check mimeType if available, or fallback to file extension
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (asset.mimeType && !allowedTypes.includes(asset.mimeType)) {
        Alert.alert("صيغة غير مدعومة", "الصور المسموحة فقط: JPG, JPEG, PNG, WEBP.");
        return;
      }

      setImage(asset.uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    const ext = uri.split(".").pop() || "jpg";
    const fileName = `service_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("services-images")
      .upload(fileName, buffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) throw error;

    return supabase.storage
      .from("services-images")
      .getPublicUrl(data.path).data.publicUrl;
  };

  const deleteImage = async (url: string) => {
    const path = url.split("/services-images/")[1];
    if (path) {
      await supabase.storage.from("services-images").remove([path]);
    }
  };

  /* ===== Save Logic ===== */
  const saveService = async () => {
    if (loading) return; // Prevent double click

    if (!name || !phone || !address || !governorate || !serviceType || !image) {
      Alert.alert("تنبيه", "أكمل كل البيانات (الاسم، الهاتف، العنوان، الصورة)");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = image;
      if (!image.startsWith("http")) {
        imageUrl = await uploadImage(image);
      }

      if (editing) {
        if (editing.imageUrl !== imageUrl) {
          await deleteImage(editing.imageUrl);
        }
        await updateDoc(doc(db, "services", editing.id), {
          name,
          phone,
          locationUrl, // 🆕
          address,
          description,
          governorate,
          serviceType,
          imageUrl,
        });
      } else {
        await addDoc(collection(db, "services"), {
          name,
          phone,
          locationUrl, // 🆕
          address,
          description,
          governorate,
          serviceType,
          imageUrl,
          createdAt: serverTimestamp(),
        });
      }

      setModalOpen(false);
      fetchServices();

    } catch (error) {
      console.log(error);
      Alert.alert("خطأ", "حدث خطأ أثناء الحفظ، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  /* ===== Delete Logic ===== */
  const deleteService = (service: Service) => {
    Alert.alert("تأكيد", "حذف الخدمة؟", [
      { text: "إلغاء" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteImage(service.imageUrl);
          await deleteDoc(doc(db, "services", service.id));
          fetchServices();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ===== Header (Original Design) ===== */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </Pressable>

        <View style={styles.headerBox}>
          <Ionicons name="medical" size={18} color={Colors.accent} />
          <Text style={styles.headerTitle}>إدارة الخدمات</Text>
        </View>
      </View>

      {/* ===== List ===== */}
      <FlatList
        data={services}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.desc}>{item.address}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={() => {
                setEditing(item);
                setName(item.name);
                setPhone((item as any).phone || "");
                setLocationUrl((item as any).locationUrl || ""); // 🆕
                setAddress(item.address);
                setDescription(item.description);
                setGovernorate(item.governorate);
                setServiceType(item.serviceType);
                setImage(item.imageUrl);
                setModalOpen(true);
              }}>
                <Ionicons name="create-outline" size={22} color="#F59E0B" />
              </Pressable>

              <Pressable onPress={() => deleteService(item)}>
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* ===== FAB (Original Design) ===== */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          setEditing(null);
          setName("");
          setPhone("");
          setLocationUrl(""); // 🆕
          setAddress("");
          setDescription("");
          setGovernorate("");
          setServiceType("");
          setImage(null);
          setModalOpen(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* ===== Add / Edit Sheet (Original Design + Logic) ===== */}
      {modalOpen && (
        <View style={styles.overlay}>
          <ScrollView style={styles.sheet} showsVerticalScrollIndicator={false}>
            {/* Header Box inside Modal */}
            <View style={styles.formHeader}>
              <Ionicons
                name={editing ? "create-outline" : "add-circle-outline"}
                size={22}
                color={Colors.accent}
              />
              <Text style={styles.modalTitle}>
                {editing ? "تعديل خدمة" : "إضافة خدمة"}
              </Text>
            </View>

            <AppInput label="اسم الخدمة" value={name} onChangeText={setName} placeholder="اسم الخدمة" />

            {/* 🆕 حقل رقم التواصل */}
            <AppInput
              label="رقم التواصل"
              value={phone}
              onChangeText={setPhone}
              placeholder="01xxxxxxxxx"
            />

            <AppInput label="العنوان" value={address} onChangeText={setAddress} placeholder="العنوان نصياً" />

            {/* 🆕 حقل رابط الموقع */}
            <AppInput
              label="رابط الخريطة (GPS)"
              value={locationUrl}
              onChangeText={setLocationUrl}
              placeholder="https://maps.google.com/..."
            />

            <AppInput label="الوصف" value={description} onChangeText={setDescription} placeholder="الوصف" />

            <Pressable style={styles.selectBtn} onPress={() => setShowGov(true)}>
              <Text>{governorate || "اختر المحافظة"}</Text>
              <Ionicons name="chevron-down" size={18} />
            </Pressable>

            <Pressable style={styles.selectBtn} onPress={() => setShowType(true)}>
              <Text>{serviceType || "اختر نوع الخدمة"}</Text>
              <Ionicons name="chevron-down" size={18} />
            </Pressable>

            <Pressable style={styles.imageBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={22} color="#2563EB" />
              <Text style={{ fontWeight: "600" }}>
                {image ? "تغيير الصورة" : "اختيار صورة"}
              </Text>
            </Pressable>

            {image && <Image source={{ uri: image }} style={styles.preview} />}

            {/* Buttons Row (Original Layout) */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: Spacing.md }}>
              <Pressable
                style={[
                  styles.saveBtn,
                  (!name || !image || loading) && { opacity: 0.5 },
                ]}
                disabled={!name || !image || loading}
                onPress={saveService}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.saveText}>حفظ</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={() => !loading && setModalOpen(false)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 14,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: Spacing.md,
                }}
              >
                <Text style={styles.cancel}>إلغاء</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      )}

      {/* ===== Governorates Sheet (Original Design with Search) ===== */}
      {showGov && (
        <View style={styles.overlay}>
          <View style={styles.bottomSheet}>
            <AppInput
              placeholder="ابحث عن المحافظة"
              value={govSearch}
              onChangeText={setGovSearch}
            />

            <ScrollView>
              {GOVERNORATES.filter(g => g.includes(govSearch)).map(g => (
                <Pressable
                  key={g}
                  style={styles.sheetItem}
                  onPress={() => {
                    setGovernorate(g);
                    setGovSearch("");
                    setShowGov(false);
                  }}
                >
                  <Ionicons name="location-outline" size={18} color={Colors.accent} />
                  <Text>{g}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* ===== Service Types Sheet (Original Design with Icons) ===== */}
      {showType && (
        <View style={styles.overlay}>
          <View style={styles.bottomSheet}>
            {SERVICE_TYPES.map(s => (
              <Pressable
                key={s.label}
                style={styles.sheetItem}
                onPress={() => {
                  setServiceType(s.label);
                  setShowType(false);
                }}
              >
                <Ionicons name={s.icon as any} size={18} color="#F59E0B" />
                <Text>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/* ===== Styles (Original Design) ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg
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
  backBtn: { padding: 4 },

  headerBox: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.accent,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
  },

  title: { fontWeight: "700" },
  desc: { color: Colors.textSecondary, marginTop: 4 },
  actions: { justifyContent: "space-between", alignItems: "center" },

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
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: "90%",
  },

  formHeader: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    padding: 10,
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },

  modalTitle: { fontWeight: "700", fontSize: 16 },

  selectBtn: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  imageBtn: {
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  preview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginBottom: Spacing.md,
  },

  saveBtn: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#F59E0B",
    padding: Spacing.md,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flex: 2, // Bigger than cancel
  },

  saveText: { color: "#fff", fontWeight: "700" },
  cancel: { textAlign: "center", fontWeight: "600" },

  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: "70%",
  },

  sheetItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});