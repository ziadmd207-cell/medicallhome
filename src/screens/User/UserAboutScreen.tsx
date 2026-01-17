import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

import { Colors } from "../../theme/colors";

const { width } = Dimensions.get("window");

const REVIEWS = [
    {
        id: "1",
        name: "محمد علي",
        role: "عميل",
        text: "شركة ميديكال هوم الطبي بجد سهل عليا الموضوع، لقيت خصومات حلوة على التحاليل، والتعامل كان سريع. تجربة ممتازة.",
        image: "https://i.pravatar.cc/150?u=1",
        rating: 5,
    },
    {
        id: "2",
        name: "سارة أحمد",
        role: "عميلة",
        text: "أفضل خدمة تأمين طبي تعاملت معها، سرعة في الرد واحترافية في التعامل، والخصومات فعلاً حقيقية ومفيدة جداً.",
        image: "https://i.pravatar.cc/150?u=2",
        rating: 5,
    },
    {
        id: "3",
        name: "أحمد محمود",
        role: "عميل",
        text: "بقت عيادات ومستشفيات كتير تحت شبكة ميديكال هوم، وده سهّل عليا جداً إني ألاقي أقرب مكان ليا وبأفضل سعر.",
        image: "https://i.pravatar.cc/150?u=3",
        rating: 5,
    },
    {
        id: "4",
        name: "ليلى حسن",
        role: "عميلة",
        text: "شكراً لفريق ميديكال هوم على المصداقية والسرعة في توفير بطاقات التأمين، وفرتوا علي مجهود كبير.",
        image: "https://i.pravatar.cc/150?u=4",
        rating: 5,
    },
    {
        id: "5",
        name: "خالد يوسف",
        role: "عميل",
        text: "الخصومات في الصيدليات ومعامل التحاليل ممتازة جداً وبتفرق فعلاً في المصاريف الشهرية.",
        image: "https://i.pravatar.cc/150?u=5",
        rating: 5,
    },
    {
        id: "6",
        name: "منى إبراهيم",
        role: "عميلة",
        text: "التعامل مع المستشفيات بقى أسهل بكتير مع كارت ميديكال هوم، كل حاجة بتخلص بسرعة ومن غير تعقيد.",
        image: "https://i.pravatar.cc/150?u=6",
        rating: 5,
    },
    {
        id: "7",
        name: "عمر فاروق",
        role: "عميل",
        text: "خدمة عملاء ممتازة وبيردوا على كل الاستفسارات في أي وقت، تجربة رائعة بجد.",
        image: "https://i.pravatar.cc/150?u=7",
        rating: 5,
    },
    {
        id: "8",
        name: "هناء نبيل",
        role: "عميلة",
        text: "أفضل استثمار عملته هو اشتراكي مع ميديكال هوم، بحس بالأمان على نفسي وعلى عيلتي دايماً.",
        image: "https://i.pravatar.cc/150?u=8",
        rating: 5,
    },
];

const INFINITE_REVIEWS = Array(50).fill(REVIEWS).flat();
const REVIEWS_START_INDEX = REVIEWS.length * 25;

export default function UserAboutScreen() {
    const router = useRouter();
    const reviewSliderRef = useRef<FlatList>(null);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(REVIEWS_START_INDEX);

    // 🔄 أوتو سلايدر لآراء العملاء (من اليسار لليمين)
    useEffect(() => {
        const timer = setInterval(() => {
            const nextIndex = currentReviewIndex + 1;
            setCurrentReviewIndex(nextIndex);
            reviewSliderRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
                viewPosition: 0.5
            });
        }, 4000);

        return () => clearInterval(timer);
    }, [currentReviewIndex]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>من نحن</Text>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* 🆕 About Image at the top */}
                <View style={styles.topImageContainer}>
                    <Image
                        source={require("../../assets/about.jpeg")}
                        style={styles.aboutHeaderImage}
                        resizeMode="cover"
                    />
                </View>

                {/* 1. Hero Section (Image 2) */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>أمن على اللي يهمك،{"\n"}<Text style={{ color: Colors.primary }}>وإحنا معاك في كل خطوة</Text></Text>
                    <Text style={styles.heroSubtext}>
                        من اللحظة الأولى، نحن هنا لدعمك. مع ميديكال هوم، تأمينك الطبي أصبح أسهل وأسرع، ونضمن لك تغطية شاملة تواكب احتياجاتك اليومية..
                    </Text>
                    <Pressable style={styles.heroBtn}>
                        <Text style={styles.heroBtnText}>من نحن</Text>
                        <Ionicons name="arrow-back" size={18} color="#fff" style={{ marginRight: 8 }} />
                    </Pressable>

                    {/* Stats Icons Boxes */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>+500</Text>
                            <Text style={styles.statLabel}>شركة تم تأمين موظفيها عبر ميديكال هوم</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>+5</Text>
                            <Text style={styles.statLabel}>نوعاً من الخدمات الطبية</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>10k</Text>
                            <Text style={styles.statLabel}>مستفيد من خدماتنا الطبية</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Intro Section (Image 0) */}
                <View style={[styles.section, { backgroundColor: '#fff' }]}>
                    <View style={styles.decorIconBox}>
                        <MaterialCommunityIcons name="heart-pulse" size={32} color="#F59E0B" />
                    </View>
                    <Text style={styles.sectionTitle}>من نحن</Text>
                    <Text style={styles.aboutDesc}>
                        <Text style={{ fontWeight: '800', color: Colors.primary }}>ميديكال هوم</Text> هي شركة متخصصة في توفير حلول التأمين الطبي المتكاملة للأفراد والشركات، حيث نسعى لتقديم تغطية صحية شاملة تلبي احتياجات عملائنا بأعلى معايير الجودة. نحن نؤمن بأن الصحة هي أغلى ما يملكه الإنسان، ولذلك نعمل على توفير تغطية تأمينية موثوقة تضمن لك ولعائلتك راحة البال في كل وقت.
                    </Text>
                    <Text style={styles.aboutDesc}>
                        من خلال شراكاتنا مع أبرز شركات التأمين في السوق، نقدم لك أفضل العروض التي تشمل جميع جوانب الرعاية الصحية، من زيارة الأطباء إلى التحاليل والفحوصات الطارئة، مع اهتمام خاص بتلبية احتياجات الشركات من خلال تأمين موظفيها.
                    </Text>

                    <View style={styles.missionBox}>
                        <Text style={styles.missionTitle}>رؤيتنا:</Text>
                        <Text style={styles.missionText}>أن نكون الخيار الأول للتأمين الطبي في السوق، من خلال تقديم حلول مبتكرة وموثوقة تساعد في تحسين حياة عملائنا.</Text>
                    </View>

                    <View style={styles.missionBox}>
                        <Text style={styles.missionTitle}>مهمتنا:</Text>
                        <Text style={styles.missionText}>نحن ملتزمون بتقديم خدمات تأمينية متكاملة، تسهم في تحسين مستوى الرعاية الصحية لعملائنا وتوفر لهم الطمأنينة في أي وقت وفي أي مكان.</Text>
                    </View>
                </View>

                {/* 3. Why Us (Image 3) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#059669', fontSize: 18 }]}>لماذا نحن؟</Text>
                    <Text style={[styles.heroTitle, { fontSize: 24, marginBottom: 30 }]}>ليه تختار <Text style={{ color: '#059669' }}>ميديكال هوم؟</Text></Text>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <MaterialCommunityIcons name="timer-outline" size={30} color={Colors.primary} />
                        </View>
                        <Text style={styles.featureTitle}>سهولة وسرعة الإجراءات</Text>
                        <Text style={styles.featureText}>بنقدملك تجربة تأمين بسيطة من غير تعقيد، وخدمة عملاء ترد عليك فورا</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <MaterialCommunityIcons name="shield-cross-outline" size={30} color="#F43F5E" />
                        </View>
                        <Text style={styles.featureTitle}>تغطية شاملة ومتكاملة</Text>
                        <Text style={styles.featureText}>من الكشف والتحاليل لحد الطوارئ والأدوية، إحنا بنغطى كل احتياجاتك الصحية</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <MaterialCommunityIcons name="format-list-checks" size={30} color="#059669" />
                        </View>
                        <Text style={styles.featureTitle}>خطط مرنة تناسب ميزانيتك</Text>
                        <Text style={styles.featureText}>بنقدملك باقات تأمين متنوعة للأفراد والشركات، تبدأ من عدد قليل من الموظفين</Text>
                    </View>
                </View>

                {/* 4. Reviews (Image 4) */}
                <View style={styles.reviewsSection}>
                    <Text style={styles.reviewsHeader}><Text style={{ color: '#059669' }}>ماذا</Text> قال مرضانا؟</Text>

                    <FlatList
                        ref={reviewSliderRef}
                        data={INFINITE_REVIEWS}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        initialScrollIndex={REVIEWS_START_INDEX}
                        getItemLayout={(_, index) => ({
                            length: width * 0.8,
                            offset: (width * 0.8) * index,
                            index,
                        })}
                        renderItem={({ item }) => (
                            <View style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
                                        <Text style={styles.reviewerName}>{item.name}</Text>
                                        <Text style={styles.reviewerRole}>{item.role}</Text>
                                    </View>
                                    <Image source={{ uri: item.image }} style={styles.reviewerImage} />
                                </View>
                                <Text style={styles.reviewText}>{item.text}</Text>
                                <View style={styles.starsRow}>
                                    {[...Array(item.rating)].map((_, i) => (
                                        <Ionicons key={i} name="star" size={18} color="#059669" />
                                    ))}
                                </View>
                            </View>
                        )}
                        onMomentumScrollEnd={(ev) => {
                            const index = Math.round(ev.nativeEvent.contentOffset.x / (width * 0.8));
                            setCurrentReviewIndex(index);
                        }}
                    />
                </View>

                {/* 5. Contact Info (Image 1) */}
                <View style={styles.contactFooterSection}>
                    <View style={styles.contactInfoCard}>
                        <Text style={styles.contactLabel}>Contact Info</Text>

                        <View style={styles.contactRow}>
                            <View style={styles.contactIconCircle}>
                                <Ionicons name="location-outline" size={24} color="#059669" />
                            </View>
                            <Text style={styles.contactText}>
                                مدينة نصر عباس العقاد عماره 82 امام بنك ال Cib وتوكيل بيجو بجوار محل كيكي ريكي الدور الأرضي
                            </Text>
                        </View>

                        <Pressable
                            style={styles.contactRow}
                            onPress={() => Linking.openURL(`tel:+201068791700`)}
                        >
                            <View style={[styles.contactIconCircle, { backgroundColor: '#F0F9FF' }]}>
                                <Ionicons name="call-outline" size={24} color={Colors.primary} />
                            </View>
                            <Text style={[styles.contactValue, { color: Colors.primary }]}>+20 106 879 1700</Text>
                        </Pressable>
                    </View>

                    {/* Footer Logo & Credits */}
                    <View style={styles.footerBrand}>
                        <Image source={require("../../assets/logo.png")} style={styles.footerLogo} />
                        <Text style={styles.footerBrandName}>Medical home</Text>
                        <Text style={styles.footerBrandSub}>HEALTH INSURANCE</Text>

                        <Text style={styles.copyright}>
                            حقوق الطبع والنشر 2026 - جميع الحقوق محفوظة. هوم ميديكال
                        </Text>
                        <Text style={styles.developer}>تصميم وتطوير شركة site snap</Text>
                    </View>
                </View>
            </ScrollView>

            {/* 🔹 Bottom Nav Bar (شريط التنقل السفلي) */}
            <View style={styles.bottomNav}>
                <Pressable style={styles.navItemActive}>
                    <Ionicons name="information-circle" size={24} color={Colors.primary} />
                    <Text style={[styles.navLabel, { color: Colors.primary }]}>من نحن</Text>
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
    topImageContainer: {
        width: '100%',
        height: 360,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    aboutHeaderImage: {
        width: '100%',
        height: '100%',
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    backBtn: { padding: 4 },

    /* Hero */
    heroSection: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        color: '#0F172A',
        lineHeight: 40,
        marginBottom: 16,
    },
    heroSubtext: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    heroBtn: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 40,
    },
    heroBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    statsContainer: { width: '100%', gap: 16 },
    statBox: {
        width: '100%',
        alignItems: 'center',
    },
    statNumber: { fontSize: 32, fontWeight: '900', color: '#84CC16' },
    statLabel: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4 },

    /* Sections */
    section: {
        padding: 24,
        alignItems: 'center',
    },
    decorIconBox: {
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#F59E0B',
        paddingBottom: 5,
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.primary,
        marginBottom: 20,
    },
    aboutDesc: {
        fontSize: 15,
        color: '#475569',
        textAlign: 'right', // 🆕 RTL
        lineHeight: 25,
        marginBottom: 15,
    },
    missionBox: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderRightWidth: 4,
        borderRightColor: Colors.primary,
    },
    missionTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 5, textAlign: 'right' },
    missionText: { fontSize: 14, color: '#475569', textAlign: 'right', lineHeight: 22 },

    /* Features */
    featureItem: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
    },
    featureIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    featureTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginBottom: 8 },
    featureText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 20 },

    /* Reviews Slider */
    reviewsSection: {
        paddingVertical: 40,
        backgroundColor: '#fff',
    },
    reviewsHeader: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 30,
        color: Colors.primary,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        marginBottom: 10,
    },
    reviewCard: {
        width: width * 0.8,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginHorizontal: width * 0.1,
        elevation: 10,
        shadowColor: Colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
    },
    reviewerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#F1F5F9',
    },
    reviewerName: { fontSize: 16, fontWeight: '800', color: Colors.primary },
    reviewerRole: { fontSize: 12, color: '#94A3B8' },
    reviewText: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 22,
        marginVertical: 15,
    },
    starsRow: { flexDirection: 'row', gap: 4 },

    /* Contact & Footer */
    contactFooterSection: {
        padding: 24,
        backgroundColor: '#EBF8FF', // Light blue bg from image 1
        alignItems: 'center',
    },
    contactInfoCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 40,
        elevation: 5,
    },
    contactLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 20 },
    contactRow: {
        alignItems: 'center',
        marginBottom: 24,
    },
    contactIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactText: {
        fontSize: 15,
        color: Colors.primary,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 24,
    },
    contactValue: { fontSize: 18, fontWeight: '900' },

    footerBrand: { alignItems: 'center' },
    footerLogo: { width: 80, height: 80, marginBottom: 10 },
    footerBrandName: { fontSize: 24, fontWeight: '900', color: Colors.primary },
    footerBrandSub: { fontSize: 12, color: '#475569', letterSpacing: 2, marginBottom: 20 },
    copyright: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 5 },
    developer: { fontSize: 12, color: '#94A3B8' },

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
});
