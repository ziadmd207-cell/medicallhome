import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { db } from "../../firebase/firebaseConfig";
import { Colors } from "../../theme/colors";

/* ===== Constants ===== */
const { width } = Dimensions.get("window");

// نفس أنواع الخدمات اللي في الآدمن
// 🎨 أيقونات معبرة أكثر (MaterialCommunityIcons)
const SERVICE_CATEGORIES = [
    { label: "مستشفيات", icon: "hospital-building", library: MaterialCommunityIcons, color: "#E0F2FE", iconColor: "#0284C7" },
    { label: "معامل تحاليل", icon: "flask", library: Ionicons, color: "#F3E8FF", iconColor: "#9333EA" },
    { label: "مراكز أشعة", icon: "radiology-box", library: MaterialCommunityIcons, color: "#FEF3C7", iconColor: "#D97706" },
    { label: "عيادات", icon: "doctor", library: MaterialCommunityIcons, color: "#FEE2E2", iconColor: "#DC2626" },
    { label: "صيدليات", icon: "pill", library: MaterialCommunityIcons, color: "#DCFCE7", iconColor: "#16A34A" },
    { label: "مراكز أسنان", icon: "tooth-outline", library: MaterialCommunityIcons, color: "#E0E7FF", iconColor: "#4F46E5" },
    { label: "علاج طبيعي", icon: "human-handsup", library: MaterialCommunityIcons, color: "#FFEDD5", iconColor: "#EA580C" },
    { label: "عيون وبصريات", icon: "glasses", library: Ionicons, color: "#F1F5F9", iconColor: "#475569" },
];

// صور إعلانية للسلايدر (محلياً من assets)
const BANNER_IMAGES = [
    require("../../assets/image copy.png"),
    require("../../assets/image copy 2.png"),
    require("../../assets/image copy 3.png"),
    require("../../assets/image copy 4.png"),
    require("../../assets/image copy 5.png"),
    require("../../assets/image copy 6.png"),
];

// 🔄 إنشاء قائمة "لا نهائية" بتكرار الصور 100 مرة
const INFINITE_BANNER_DATA = Array(100).fill(BANNER_IMAGES).flat();
const START_INDEX = BANNER_IMAGES.length * 50; // نبدأ من منتصف القائمة لضمان التمرير في الاتجاهين بقوة

const GOVERNORATES = [
    "الإسكندرية", "الإسماعيلية", "أسوان", "أسيوط", "الأقصر", "البحر الأحمر", "البحيرة",
    "بني سويف", "بورسعيد", "جنوب سيناء", "الجيزة", "الدقهلية", "دمياط", "سوهاج", "السويس",
    "الشرقية", "شمال سيناء", "الغربية", "الفيوم", "القاهرة", "القليوبية", "قنا",
    "كفر الشيخ", "مطروح", "المنوفية", "المنيا", "الوادي الجديد",
];

// 🆕 Animated Menu Button Component for a "light" feel
const MenuButton = ({ icon, label, onPress, color, bgColor }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }], width: '100%', alignItems: 'center' }}>
            <Pressable
                style={[
                    styles.menuItemCentered,
                    bgColor ? { backgroundColor: bgColor, borderRadius: 15, borderBottomWidth: 0, marginVertical: 6, paddingHorizontal: 16 } : {}
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <View style={[styles.menuIconContainer, bgColor ? { backgroundColor: 'transparent' } : {}]}>
                    <Ionicons name={icon as any} size={24} color={color} />
                </View>
                <Text style={[styles.menuText, { color: (color === Colors.primary || color === Colors.accent) ? '#1E293B' : color }]}>
                    {label}
                </Text>
            </Pressable>
        </Animated.View>
    );
};

export default function UserHomeScreen() {
    const router = useRouter();

    // State
    const [allServices, setAllServices] = useState<any[]>([]);
    const [currentImgIndex, setCurrentImgIndex] = useState(START_INDEX);
    const [menuVisible, setMenuVisible] = useState(false);
    const [govModalVisible, setGovModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedGov, setSelectedGov] = useState("");
    const [searchGovText, setSearchGovText] = useState(""); // 🆕 بحث المحافظات

    const sliderRef = useRef<FlatList>(null);

    /* 🔹 جلب البيانات */
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            // نجيب آخر 10 خدمات مضافة عشان نعرضهم تحت
            const q = query(collection(db, "services"), orderBy("createdAt", "desc"), limit(10));
            const snap = await getDocs(q);
            setAllServices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.log(e);
        }
    };

    /* 🔹 أوتو سلايدر (تعديل: حركة لا نهائية حقيقية Seamless) */
    useEffect(() => {
        const timer = setInterval(() => {
            const nextIndex = currentImgIndex + 1;

            setCurrentImgIndex(nextIndex);
            sliderRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
                viewPosition: 0.5
            });
        }, 3000);

        return () => clearInterval(timer);
    }, [currentImgIndex]);

    /* 🔹 التعامل مع اختيار الخدمة */
    const handleCategoryPress = (categoryLabel: string) => {
        setSelectedCategory(categoryLabel);
        setGovModalVisible(true); // نفتح مودال المحافظة
    };

    const handleGovSelect = (gov: string) => {
        setSelectedGov(gov);
        setGovModalVisible(false);

        // 🚀 الانتقال لصفحة القائمة المتفلترة
        router.push({
            pathname: "/services-list" as any,
            params: { category: selectedCategory, gov: gov }
        });
    };

    return (
        <View style={styles.container}>
            {/* 🔹 Header */}
            <View style={styles.header}>
                {/* زرار القائمة الجانبية (3 خطوط) */}
                <Pressable onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                    <Ionicons name="menu" size={28} color={Colors.textPrimary} />
                </Pressable>

                <Text style={styles.welcomeText}>مرحباً، <Text style={{ color: Colors.primary }}>Guest</Text></Text>

                {/* اللوجو الجديد من الملفات */}
                <Image
                    source={require("../../assets/logo.png")}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                <View style={styles.carouselContainer}>
                    <FlatList
                        ref={sliderRef}
                        data={INFINITE_BANNER_DATA}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={width * 0.85 + 16}
                        decelerationRate="fast"
                        snapToAlignment="center"
                        contentContainerStyle={{ paddingHorizontal: width * 0.075 }}
                        initialScrollIndex={START_INDEX}
                        getItemLayout={(_, index) => ({
                            length: width * 0.85 + 16,
                            offset: (width * 0.85 + 16) * index,
                            index,
                        })}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Image
                                source={item}
                                style={styles.bannerImage}
                                resizeMode="stretch"
                            />
                        )}
                        onMomentumScrollEnd={(ev) => {
                            const index = Math.round(ev.nativeEvent.contentOffset.x / (width * 0.85 + 16));
                            setCurrentImgIndex(index);
                        }}
                    />
                </View>

                {/* 🔹 Categories Grid (الخدمات) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>الفئات</Text>
                </View>

                <View style={styles.gridContainer}>
                    {SERVICE_CATEGORIES.map((item, index) => (
                        <Pressable
                            key={index}
                            style={styles.gridItem}
                            onPress={() => handleCategoryPress(item.label)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                                {/* نستخدم المكتبة المناسبة لكل أيقونة */}
                                <item.library name={item.icon as any} size={32} color={item.iconColor} />
                            </View>
                            <Text style={styles.gridLabel}>{item.label}</Text>
                        </Pressable>
                    ))}

                    {/* أيقونة للعروض خاصة زي ما طلبت */}
                    <Pressable style={styles.gridItem} onPress={() => router.push("/user-offers" as any)}>
                        <View style={[styles.iconBox, { backgroundColor: "#FFF7ED" }]}>
                            <Ionicons name="pricetags" size={28} color="#F59E0B" />
                        </View>
                        <Text style={styles.gridLabel}>العروض</Text>
                    </Pressable>
                </View>

                {/* 🔹 All Services Horizontal Scroll (تم التعديل: إزالة عرض الكل + إصلاح اللينك) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>مقدمي الخدمة</Text>
                    {/* تم إزالة زر "عرض الكل" */}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
                    {allServices.map((service, index) => (
                        <Pressable
                            key={index}
                            style={styles.serviceCardHorizontal}
                            // 🚀 إصلاح: الانتقال للتفاصيل فعلياً
                            onPress={() => router.push({
                                pathname: "/service-details" as any,
                                params: { serviceData: JSON.stringify(service) }
                            })}
                        >
                            <Image
                                source={{ uri: service.imageUrl }}
                                style={styles.serviceImage}
                            />
                            <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
                            <Text style={styles.serviceType}>{service.serviceType}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

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

                <Pressable style={styles.navItemActive}>
                    <Ionicons name="home" size={24} color={Colors.primary} />
                    <Text style={[styles.navLabel, { color: Colors.primary }]}>الرئيسية</Text>
                </Pressable>
            </View>

            {/* 🔹 Side Menu Modal (تصميم جانبي مع محتوى متمركز) */}
            <Modal visible={menuVisible} transparent animationType="fade">
                <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.sideMenu}>
                        <Pressable style={styles.closeMenuBtn} onPress={() => setMenuVisible(false)}>
                            <Ionicons name="close-circle" size={32} color={Colors.primary} />
                        </Pressable>

                        <View style={styles.menuContentCentered}>
                            <View style={styles.logoCircleSmall}>
                                <Image
                                    source={require("../../assets/logo.png")}
                                    style={{ width: 200, height: 200, borderRadius: 15 }}
                                />
                            </View>
                            <Text style={styles.menuTitle}>Medical Home</Text>
                            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 10 }}>رعايتكم هي مهمتنا</Text>
                            <View style={styles.dividerMenu} />

                            <MenuButton
                                icon="information-circle"
                                label="من نحن"
                                color={Colors.primary}
                                onPress={() => { setMenuVisible(false); router.push("/user-about" as any); }}
                            />

                            <MenuButton
                                icon="pricetags"
                                label="العروض والخصومات"
                                color={Colors.accent}
                                onPress={() => { setMenuVisible(false); router.push("/user-offers" as any); }}
                            />

                            <MenuButton
                                icon="call"
                                label="اتصال هاتفي"
                                color={Colors.primary}
                                onPress={() => Linking.openURL(`tel:+201068791700`)}
                            />

                            <MenuButton
                                icon="logo-whatsapp"
                                label="تواصل واتساب"
                                color="#16A34A"
                                bgColor="#F0FDF4"
                                onPress={async () => {
                                    const url = `https://wa.me/201068791700`;
                                    try { await Linking.openURL(url); } catch (e) { alert("عذراً، لا يمكن فتح واتساب حالياً."); }
                                }}
                            />

                            <View style={styles.dividerMenu} />

                            <MenuButton
                                icon="log-out-outline"
                                label="تسجيل خروج"
                                color="#EF4444"
                                bgColor="#FEF2F2"
                                onPress={() => { setMenuVisible(false); router.replace("/select-role" as any); }}
                            />
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* 🔹 Governorate Selection Modal (بحث + تصميم كارد) */}
            <Modal visible={govModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.govModalNew}>
                        <View style={styles.modalHeaderDecor} />

                        <Text style={styles.govTitle}>اختر المحافظة</Text>

                        {/* مربع البحث */}
                        <View style={styles.searchBox}>
                            <Ionicons name="search" size={20} color="#94A3B8" />
                            <TextInput
                                placeholder="ابحث عن محافظتك..."
                                style={styles.searchInput}
                                value={searchGovText}
                                onChangeText={setSearchGovText}
                            />
                        </View>

                        <ScrollView style={{ maxHeight: 400 }}>
                            {GOVERNORATES.filter(g => g.includes(searchGovText)).map((gov) => (
                                <Pressable key={gov} style={styles.govItemNew} onPress={() => handleGovSelect(gov)}>
                                    <Text style={styles.govTextNew}>{gov}</Text>
                                    <Ionicons name="radio-button-off" size={20} color={Colors.primary} />
                                </Pressable>
                            ))}
                        </ScrollView>

                        <Pressable style={styles.closeBtnNew} onPress={() => setGovModalVisible(false)}>
                            <Text style={styles.closeTextNew}>إغلاق</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
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
        shadowColor: Colors.primary,
        shadowOpacity: 0.03,
        shadowRadius: 8,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: "900",
        color: "#1E293B",
        textAlign: 'right',
    },
    menuBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    /* Carousel */
    carouselContainer: {
        marginTop: 10,
        height: 323, // 🆕 Reduced by another 5%
    },
    bannerImage: {
        width: width * 0.85,
        height: 306, // 🆕 Reduced by another 5%
        borderRadius: 20,
        backgroundColor: "#fff",
        marginHorizontal: 8,
        elevation: 8,
        shadowColor: Colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },

    /* Sections */
    sectionHeader: {
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 30,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: Colors.textPrimary,
        borderRightWidth: 4,
        borderRightColor: Colors.primary,
        paddingRight: 10,
    },
    seeAll: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: "600",
    },

    /* Grid */
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    gridItem: {
        width: "30%", // 3 items per row
        alignItems: "center",
        marginBottom: 20,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    gridLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.textPrimary,
        textAlign: "center",
    },

    /* Horizontal Cards */
    serviceCardHorizontal: {
        width: 140,
        marginRight: 12,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 10,
    },
    serviceImage: {
        width: "100%",
        height: 90,
        borderRadius: 8,
        marginBottom: 8,
    },
    serviceName: {
        fontSize: 13,
        fontWeight: "700",
        textAlign: "right",
    },
    serviceType: {
        fontSize: 11,
        color: Colors.textSecondary,
        textAlign: "right",
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
    navItemActive: {
        alignItems: "center",
        borderTopWidth: 2,
        borderTopColor: Colors.primary,
        marginTop: -14, // Lift up effect
        paddingTop: 12,
    },
    navLabel: {
        fontSize: 12,
        marginTop: 4,
        color: "#94A3B8",
    },

    /* Side Menu */
    menuOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-start",
    },
    /* Side Menu Adjusted */
    sideMenu: {
        width: "82%",
        height: "100%",
        backgroundColor: "#fff",
        padding: 24,
        elevation: 30,
        shadowColor: Colors.primary,
        shadowOpacity: 0.25,
        shadowRadius: 25,
    },
    menuContentCentered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: -30,
    },
    logoCircleSmall: {
        width: 110,
        height: 110,
        borderRadius: 30,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "#F1F5F9",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    menuTitle: { fontSize: 24, fontWeight: "900", color: Colors.primary, marginBottom: 5 },
    menuText: { fontSize: 17, fontWeight: "800", color: "#334155" },
    dividerMenu: { height: 1.5, backgroundColor: "#F1F5F9", width: "100%", marginVertical: 25 },
    closeMenuBtn: {
        alignSelf: "flex-end",
        marginTop: 20,
    },
    menuItemCentered: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 15,
        width: "100%",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },

    /* Gov Modal New Style */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    govModalNew: {
        backgroundColor: "#fff",
        width: "90%",
        borderRadius: 24,
        padding: 24,
        maxHeight: "75%",
        elevation: 10,
    },
    govTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15, textAlign: "center", color: Colors.textPrimary },
    modalHeaderDecor: {
        width: 40,
        height: 5,
        backgroundColor: "#E2E8F0",
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 20
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 16
    },
    searchInput: {
        flex: 1,
        textAlign: 'right',
        marginLeft: 10,
        fontSize: 14,
        fontFamily: "System"
    },
    govItemNew: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F8FAFC",
    },
    govTextNew: { fontSize: 16, fontWeight: "600", color: "#334155" },
    closeBtnNew: {
        marginTop: 16,
        backgroundColor: "#F1F5F9",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center"
    },
    closeTextNew: { color: Colors.textSecondary, fontWeight: "700" }
});
