import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";

export default function UserServiceDetailsScreen() {
    const router = useRouter();
    const { serviceData } = useLocalSearchParams();
    const service = serviceData ? JSON.parse(serviceData as string) : null;

    // 🆕 الـ Animations للأزرار
    const phoneScale = useRef(new Animated.Value(1)).current;
    const locationScale = useRef(new Animated.Value(1)).current;

    const animateIn = (val: Animated.Value) => {
        Animated.spring(val, { toValue: 0.95, useNativeDriver: true }).start();
    };
    const animateOut = (val: Animated.Value) => {
        Animated.spring(val, { toValue: 1, useNativeDriver: true }).start();
    };

    if (!service) return null;

    /* 🔹 دوال الاتصال */
    const handleCall = async () => {
        if (!service.phone) return;
        const url = `tel:${service.phone}`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) await Linking.openURL(url);
            else alert("عذراً، هذا الجهاز لا يدعم الاتصال الهاتفي.");
        } catch (error) { console.log("Error", error); }
    };

    const handleLocation = async () => {
        if (!service.locationUrl) return;
        let url = service.locationUrl.trim();
        if (!url.startsWith('http')) url = 'https://' + url;
        url = url.replace(/https?:\/([^\/])/i, 'https://$1');
        try { await Linking.openURL(url); }
        catch (error) { alert("عذراً، لا يمكن فتح الخريطة حالياً."); }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
                </Pressable>
                <Text style={styles.headerTitle}>تفاصيل الخدمة</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>

                <View style={styles.topCard}>
                    {/* Logo & Name */}
                    <View style={styles.brandRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.brandName}>{service.name}</Text>
                            <Text style={styles.brandType}>{service.serviceType || "Medical Center"}</Text>
                        </View>
                        <Image source={{ uri: service.imageUrl }} style={styles.logo} />
                    </View>

                    <View style={styles.divider} />

                    {/* Discount & Desc */}
                    <View style={styles.discountRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.descText}>{service.description || "استفد من خصومات حصرية عند استخدام تطبيق ميديكال هوم."}</Text>
                        </View>
                        <View style={styles.percentBox}>
                            <MaterialCommunityIcons name="ticket-percent" size={26} color="#fff" />
                        </View>
                        <Text style={styles.percentText}>
                            {(service.description?.match(/\d+%/) || ["%"])[0]}
                        </Text>
                    </View>

                    {/* Contact Buttons Animated */}
                    <View style={styles.contactContainer}>

                        <Animated.View style={{ transform: [{ scale: phoneScale }] }}>
                            <Pressable
                                style={styles.infoBoxCard}
                                onPress={handleCall}
                                onPressIn={() => animateIn(phoneScale)}
                                onPressOut={() => animateOut(phoneScale)}
                            >
                                <View style={styles.infoIconBox}>
                                    <Ionicons name="call" size={24} color="#fff" />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>رقم الهاتف</Text>
                                    <Text style={styles.infoValue}>{service.phone}</Text>
                                </View>
                            </Pressable>
                        </Animated.View>

                        <Animated.View style={{ transform: [{ scale: locationScale }] }}>
                            <Pressable
                                style={[styles.infoBoxCard, { borderColor: '#10B981', borderStyle: 'dashed' }]}
                                onPress={handleLocation}
                                onPressIn={() => animateIn(locationScale)}
                                onPressOut={() => animateOut(locationScale)}
                            >
                                <View style={[styles.infoIconBox, { backgroundColor: '#10B981' }]}>
                                    <Ionicons name="navigate-circle" size={28} color="#fff" />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={[styles.infoLabel, { color: '#059669' }]}>فتح الموقع في الخريطة</Text>
                                    <Text style={styles.infoValue}>{service.address}</Text>
                                </View>
                            </Pressable>
                        </Animated.View>

                    </View>

                    <View style={styles.divider} />

                    <View style={styles.noteBox}>
                        <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
                        <Text style={styles.noteText}>طالما أنت مع ميديكال هوم، تأكد أنك بأمان واستمتع بخصومات أكتر ✨</Text>
                    </View>
                </View>

            </ScrollView>

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

    /* ✨ The "Professional Card" Logic */
    topCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#64748B",
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0"
    },

    brandRow: {
        flexDirection: "row-reverse",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 16,
        marginBottom: 20
    },
    brandName: { fontSize: 18, fontWeight: "800", textAlign: "right", color: "#0F172A" },
    brandType: { fontSize: 12, color: "#64748B", textAlign: "right", marginTop: 2 },
    logo: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0"
    },

    divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 20 },

    /* Discount Part */
    discountRow: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 24,
        backgroundColor: "#F0F9FF",
        padding: 12,
        borderRadius: 12,
    },
    percentBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#0284C7",
        justifyContent: "center",
        alignItems: "center",
    },
    percentText: {
        fontSize: 22,
        fontWeight: "900",
        marginRight: 10,
        color: "#0369A1"
    },
    descText: {
        textAlign: "right",
        fontSize: 14,
        color: "#334155",
        lineHeight: 22,
        flex: 1,
        marginRight: 12,
    },

    /* Contact Part New Boxes */
    contactContainer: {
        gap: 16,
    },
    infoBoxCard: {
        flexDirection: "row-reverse",
        alignItems: "flex-start", // 🆕 Changed from 'center' to support multi-line text
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: "#F1F5F9",
        shadowColor: "#000",
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
    },
    infoIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#0284C7",
        justifyContent: "center",
        alignItems: "center",
    },
    infoTextContainer: {
        flex: 1,
        marginRight: 15,
        alignItems: "flex-end",
    },
    infoLabel: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "600",
        marginBottom: 4
    },
    infoValue: {
        fontSize: 15,
        color: "#1E293B",
        fontWeight: "800",
        textAlign: 'right', // 🆕 Ensure RTL alignment
    },
    noteBox: {
        flexDirection: "row-reverse",
        alignItems: "center",
        backgroundColor: "#F0FDF4",
        padding: 14,
        borderRadius: 12,
        gap: 10,
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        color: "#166534",
        textAlign: "right",
        fontWeight: "600",
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
