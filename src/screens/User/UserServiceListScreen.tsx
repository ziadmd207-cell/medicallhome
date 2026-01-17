import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { db } from "../../firebase/firebaseConfig";
import { Colors } from "../../theme/colors";

/* 🆕 المكون المتحرك للكارد */
const AnimatedCard = ({ item, index, onPress }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Pressable style={styles.card} onPress={onPress}>

                {/* 📸 الصورة على الشمال وكبيرة بنسبة 30% زيادة */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                </View>

                {/* 📝 المحتوى على اليمين */}
                <View style={styles.cardContent}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                    </View>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.serviceType}</Text>
                    </View>

                    <View style={styles.addressRow}>
                        <Text style={styles.cardAddress} numberOfLines={2}>
                            {item.address}
                        </Text>
                        <Ionicons name="location" size={14} color={Colors.primary} />
                    </View>

                    <View style={styles.footerRow}>
                        <Text style={styles.detailsLinkText}>التفاصيل</Text>
                        <Ionicons name="chevron-back" size={14} color={Colors.accent} />
                    </View>
                </View>

            </Pressable>
        </Animated.View>
    );
};

export default function UserServiceListScreen() {
    const router = useRouter();
    const { category, gov } = useLocalSearchParams();

    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, [category, gov]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "services"),
                where("serviceType", "==", category),
                where("governorate", "==", gov)
            );

            const snap = await getDocs(q);
            setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>
                    {category} - {gov}
                </Text>
                {/* لوجو صغير في الهيدر للبراند */}
                <Image source={require("../../assets/logo.png")} style={styles.headerLogo} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }} // 🆕 Increased padding for bottom nav
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="search-outline" size={64} color="#E2E8F0" />
                            <Text style={styles.emptyText}>لم نجد نتائج في هذه المنطقة</Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <AnimatedCard
                            item={item}
                            index={index}
                            onPress={() =>
                                router.push({
                                    pathname: "/service-details",
                                    params: { serviceData: JSON.stringify(item) },
                                })
                            }
                        />
                    )}
                />
            )}

            {/* 🔹 Bottom Nav Bar (شريط التنقل السفلي) */}
            <View style={styles.bottomNav}>
                <Pressable style={styles.navItem} onPress={() => router.push("/user-about" as any)}>
                    <Ionicons name="information-circle-outline" size={24} color="#94A3B8" />
                    <Text style={styles.navLabel}>من نحن</Text>
                </Pressable>

                <Pressable style={styles.navItem} onPress={() => router.push("/user-offers" as any)}>
                    <Ionicons name="pricetag-outline" size={24} color="#94A3B8" />
                    <Text style={styles.navLabel}>العروض</Text>
                </Pressable>

                <Pressable style={styles.navItem} onPress={() => router.push("/user-home" as any)}>
                    <Ionicons name="home-outline" size={24} color="#94A3B8" />
                    <Text style={styles.navLabel}>الرئيسية</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 80 },

    header: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.03,
    },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
    headerLogo: { width: 35, height: 35, borderRadius: 8 },
    backBtn: { padding: 4 },

    emptyText: { marginTop: 16, color: "#94A3B8", fontSize: 16, fontWeight: "600" },

    /* Card Styles - New Design (Image Left, Content Right) */
    card: {
        flexDirection: "row", // الصورة شمال والمحتوى يمين
        backgroundColor: "#fff",
        borderRadius: 20,
        marginBottom: 16,
        height: 120, // ارتفاع ثابت للكارد
        overflow: "hidden",
        elevation: 10,
        shadowColor: Colors.primary,
        shadowOpacity: 0.08,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    imageContainer: {
        width: "35%", // كبرنا الصورة 30% زيادة عن المعتاد
        height: "100%",
        backgroundColor: "#F1F5F9",
    },
    cardImage: {
        width: "100%",
        height: "100%",
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: "space-between",
        alignItems: "flex-end", // محاذاة يمين للعربي
    },
    rowBetween: {
        width: "100%",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        textAlign: "right",
    },
    badge: {
        backgroundColor: "#F0F9FF",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-end',
    },
    badgeText: { fontSize: 11, color: Colors.primary, fontWeight: "700" },

    addressRow: {
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
        width: "100%",
    },
    cardAddress: {
        fontSize: 12,
        color: "#64748B",
        flex: 1,
        textAlign: "right",
    },
    footerRow: {
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 4,
    },
    detailsLinkText: {
        fontSize: 12,
        color: Colors.accent,
        fontWeight: "700",
    },

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
    navLabel: {
        fontSize: 12,
        marginTop: 4,
        color: "#94A3B8",
    },
});
