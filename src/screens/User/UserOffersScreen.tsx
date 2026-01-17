import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { db } from "../../firebase/firebaseConfig";
import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";

export default function UserOffersScreen() {
    const router = useRouter();
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState<any>(null); // عشان نعرض التفاصيل في مودال

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setOffers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>العروض والخصومات</Text>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={offers}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="pricetags-outline" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>لا توجد عروض حالياً</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.offerCard}
                            onPress={() => setSelectedOffer(item)}
                        >
                            <View style={styles.iconBox}>
                                <Ionicons name="gift" size={24} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.offerTitle}>{item.title}</Text>
                                <Text style={styles.offerDate}>ينتهي في: {item.expiryDate}</Text>
                            </View>
                            <Ionicons name="chevron-back" size={20} color="#CBD5E1" />
                        </Pressable>
                    )}
                />
            )}

            {/* 🔹 Bottom Nav Bar (شريط التنقل السفلي) */}
            <View style={styles.bottomNav}>
                <Pressable style={styles.navItem} onPress={() => router.push("/user-about" as any)}>
                    <Ionicons name="information-circle-outline" size={24} color="#94A3B8" />
                    <Text style={styles.navLabel}>من نحن</Text>
                </Pressable>

                <Pressable style={styles.navItemActive}>
                    <Ionicons name="pricetags" size={24} color={Colors.primary} />
                    <Text style={[styles.navLabel, { color: Colors.primary }]}>العروض</Text>
                </Pressable>

                <Pressable style={styles.navItem} onPress={() => router.push("/user-home" as any)}>
                    <Ionicons name="home-outline" size={24} color="#94A3B8" />
                    <Text style={styles.navLabel}>الرئيسية</Text>
                </Pressable>
            </View>

            {/* 🔹 Offer Details Modal (صفحة احترافية للعرض) */}
            <Modal visible={!!selectedOffer} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Pressable onPress={() => setSelectedOffer(null)} style={styles.closeModal}>
                            <Ionicons name="close-circle" size={32} color="#CBD5E1" />
                        </Pressable>

                        <View style={styles.modalIconBox}>
                            <Ionicons name="pricetag" size={40} color="#fff" />
                        </View>

                        <Text style={styles.modalTitle}>{selectedOffer?.title}</Text>

                        <View style={styles.expiryTag}>
                            <Ionicons name="time-outline" size={16} color={Colors.primary} />
                            <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                                ساري حتى {selectedOffer?.expiryDate}
                            </Text>
                        </View>

                        <View style={styles.descBox}>
                            <Text style={styles.modalDesc}>{selectedOffer?.description}</Text>
                        </View>

                        {/* زرار "احصل على العرض" وهمي */}
                        <Pressable style={styles.claimBtn} onPress={() => {
                            alert("تم حفظ العرض في محفظتك!");
                            setSelectedOffer(null);
                        }}>
                        </Pressable>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },

    header: {
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.03,
    },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
    backBtn: { padding: 4 },
    emptyText: { marginTop: 12, color: Colors.textSecondary },

    /* Bottom Nav */
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: "center",
    },
    navItemActive: {
        alignItems: "center",
        borderTopWidth: 2,
        borderTopColor: Colors.primary,
        marginTop: -14,
        paddingTop: 12,
    },
    navLabel: {
        fontSize: 12,
        marginTop: 4,
        color: "#94A3B8",
    },

    /* List Card */
    offerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        gap: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#F59E0B", // Gold for offers
        justifyContent: "center",
        alignItems: "center",
    },
    offerTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary, marginBottom: 4 },
    offerDate: { fontSize: 12, color: Colors.textSecondary },

    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
    },
    closeModal: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10
    },
    modalIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 4,
        borderColor: "#E0F2FE"
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 12,
        paddingHorizontal: 10
    },
    expiryTag: {
        flexDirection: 'row',
        gap: 6,
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20
    },
    descBox: {
        width: "100%",
        backgroundColor: "#F8FAFC",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24
    },
    modalDesc: {
        textAlign: "center",
        fontSize: 16,
        color: "#475569",
        lineHeight: 24,
    },
    claimBtn: {
        width: "100%",
        backgroundColor: "#F59E0B",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        shadowColor: "#F59E0B",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
    },
    claimText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16
    }
});
