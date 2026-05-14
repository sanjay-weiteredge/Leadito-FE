import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, Modal, StatusBar } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import publicService from '../services/publicService';
import GlobalHeader from '../components/GlobalHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeCall, openWhatsApp, getContactInfo, getCallNumberSync, getWhatsAppNumberSync } from '../utils/contact';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import { useSubscription } from '../context/SubscriptionContext';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const { isActive } = useSubscription();
    const navigation = useNavigation();
    const video = React.useRef(null);
    const [status, setStatus] = React.useState({});
    const [homeVideo, setHomeVideo] = React.useState(null);
    const [testimonials, setTestimonials] = React.useState([]);
    const [services, setServices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
    const [videoModalVisible, setVideoModalVisible] = React.useState(false);

    React.useEffect(() => {
        setupAudio();
        fetchHomeContent();
        loadUser();
    }, []);

    const setupAudio = async () => {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldRouteThroughEarpieceAndroid: false,
            });
        } catch (error) {
            console.log('Audio mode error:', error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchHomeContent(), loadUser()]);
        setRefreshing(false);
    }, []);

    const loadUser = async () => {
        try {
            const profileStr = await AsyncStorage.getItem('userProfile');
            if (profileStr) {
                setUser(JSON.parse(profileStr));
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    const handleCall = () => {
        const num = getCallNumberSync(user);
        makeCall(num);
    };

    const handleWhatsApp = () => {
        const num = getWhatsAppNumberSync(user);
        openWhatsApp(num, "Hi, I'm interested in Leadito AI services.");
    };

    const fetchHomeContent = async () => {
        try {
            const [videoData, testimonialData, servicesData] = await Promise.all([
                publicService.getVideos(),
                publicService.getTestimonials(),
                publicService.getServices()
            ]);

            if (videoData && videoData.length > 0) {
                setHomeVideo(videoData[0]);
            }
            setTestimonials(testimonialData || []);
            setServices(servicesData || []);
        } catch (error) {
            console.error('Error fetching home content:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bottomSafe={false}>
            <GlobalHeader onNotificationPress={() => navigation.navigate('Notifications')} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#7B61FF']} // Android
                        tintColor="#7B61FF" // iOS
                    />
                }
            >
                <View style={styles.heroSection}>
                    <Image
                        source={require('../assessts/banner.png')}
                        style={styles.heroBgImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.2)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.heroOverlay}
                    >
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle}>We Help You Generate{"\n"}High-Quality Leads{"\n"}Using Meta Ads</Text>
                            <Text style={styles.heroSubtitle}>
                                <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>Track </Text>Every Lead & ROI{"\n"}Inside Our App
                            </Text>

                            <View style={styles.heroButtons}>
                                <TouchableOpacity style={styles.bookCallButton} onPress={handleCall}>
                                    <Ionicons name="call" size={14} color="#fff" />
                                    <Text style={styles.buttonText}>Book Free Call</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
                                    <FontAwesome5 name="whatsapp" size={16} color="#25D366" />
                                    <Text style={styles.whatsappButtonText}>WhatsApp Chat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {homeVideo && (
                    <View style={styles.section}>
                        {/* Fullscreen Video Modal */}
                        <Modal
                            visible={videoModalVisible}
                            animationType="fade"
                            statusBarTranslucent
                            onRequestClose={() => {
                                setVideoModalVisible(false);
                                if (video.current) video.current.pauseAsync();
                            }}
                        >
                            <StatusBar hidden />
                            <View style={styles.videoModal}>
                                <Video
                                    ref={video}
                                    style={styles.fullscreenVideo}
                                    source={{ uri: homeVideo.videoUrl }}
                                    useNativeControls
                                    resizeMode="contain"
                                    isLooping
                                    shouldPlay={videoModalVisible}
                                    onPlaybackStatusUpdate={s => setStatus(() => s)}
                                    onError={(error) => console.log('Video Error:', error)}
                                />
                                <TouchableOpacity
                                    style={styles.videoCloseButton}
                                    onPress={() => {
                                        setVideoModalVisible(false);
                                        if (video.current) video.current.pauseAsync();
                                    }}
                                >
                                    <Ionicons name="close" size={26} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </Modal>

                        {/* Thumbnail Card */}
                        <View style={styles.videoCard}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => setVideoModalVisible(true)}
                                style={styles.videoThumbnail}
                            >
                                <Image
                                    source={{ uri: homeVideo.thumbnailUrl }}
                                    style={styles.thumbnailImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.thumbnailOverlay}>
                                    <View style={styles.playButtonContainer}>
                                        <Ionicons name="play" size={24} color="#fff" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.videoInfo}>
                                <Text style={styles.sectionTitle}>{homeVideo.title || "Watch Demo Video"}</Text>
                                <Text style={styles.sectionSubtitle}>{homeVideo.description || "See how we generate leads for businesses like yours!"}</Text>
                            </View>
                        </View>
                    </View>
                )}
                <View style={styles.section}>
                    <Text style={styles.mainSectionTitle}>What Our Clients Say</Text>
                    <View style={styles.testimonialContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.testimonialScroll}
                            snapToInterval={width * 0.85 + 15}
                            decelerationRate="fast"
                            snapToAlignment="start"
                            pagingEnabled={false}
                        >
                            {testimonials.slice(0, 3).map((t, index) => (
                                <View key={t.id || index} style={styles.testimonialCard}>
                                    <View style={styles.testimonialHeader}>
                                        <View style={styles.userInfo}>
                                            <View style={styles.nameRow}>
                                                <Text style={styles.userName}>{t.name}</Text>
                                            </View>
                                            <Text style={styles.userRole}>{t.role || t.businessName || 'Business Owner'}</Text>
                                        </View>
                                        <View style={styles.ratingBox}>
                                            <View style={styles.stars}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Ionicons
                                                        key={i}
                                                        name="star"
                                                        size={10}
                                                        color={i < Math.floor(t.rating) ? "#FFB800" : "#E2E8F0"}
                                                    />
                                                ))}
                                            </View>
                                            <Text style={styles.ratingText}>{Number(t.rating).toFixed(1)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.testimonialText} numberOfLines={3}>
                                        {t.feedback}
                                    </Text>
                                </View>
                            ))}

                            {testimonials.length === 0 && !loading && (
                                <View style={[styles.testimonialCard, { backgroundColor: '#F8FAFC', borderStyle: 'dashed' }]}>
                                    <View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#94A3B8' }}>No testimonials yet.</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    <TouchableOpacity
                        style={styles.seeAllLink}
                        onPress={() => navigation.navigate('Testimonials')}
                    >
                        <Text style={styles.seeAllText}>See All Testimonials </Text>
                        <Ionicons name="chevron-forward" size={14} color="#0047AB" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.mainSectionTitle}>About Company</Text>
                    <View style={styles.aboutCard}>
                        <LinearGradient
                            colors={['#7B61FF', '#4834D4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.aboutGradient}
                        >
                            <View style={styles.aboutHeader}>
                                <View style={styles.aboutIconContainer}>
                                    <View style={styles.aboutIconBg}>
                                        <Ionicons name="rocket" size={22} color="#7B61FF" />
                                    </View>
                                </View>
                                <Text style={styles.aboutTitle}>Our Mission & Expertise</Text>
                            </View>
                            <Text style={styles.aboutText}>
                                We specialize in Meta (Facebook & Instagram) lead generation, helping businesses get high-quality leads at low cost.{"\n\n"}
                                Our strategies are focused on delivering consistent and scalable results for our clients. With our system, you can track every lead, ad spend, and ROI in real time.{"\n\n"}
                                We believe in complete transparency, so you always know what results you’re getting. Our goal is not just to generate leads, but to help you convert them into paying customers.{"\n\n"}
                                Everything is managed and tracked inside our app for better control and faster growth.
                            </Text>

                            <View style={styles.aboutStatsRow}>
                                <View style={styles.aboutStat}>
                                    <Text style={styles.aboutStatLabel}>Complete</Text>
                                    <Text style={styles.aboutStatValue}>Transparency</Text>
                                </View>
                                <View style={styles.aboutStatDivider} />
                                <View style={styles.aboutStat}>
                                    <Text style={styles.aboutStatLabel}>Real-time</Text>
                                    <Text style={styles.aboutStatValue}>ROI Tracking</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.mainSectionTitle}>Why Choose Leadito AI?</Text>
                    <View style={styles.featuresRow}>
                        <View style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <MaterialCommunityIcons name="target" size={24} color="#9F7AEA" />
                            </View>
                            <Text style={styles.featureTitle}>Real-time Lead{"\n"}Tracking</Text>
                            <Text style={styles.featureDescription}>Monitor leads{"\n"}instantly.</Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <MaterialCommunityIcons name="view-dashboard" size={24} color="#9F7AEA" />
                            </View>
                            <Text style={styles.featureTitle}>Transparent ROI{"\n"}Dashboard</Text>
                            <Text style={styles.featureDescription}>Clear results{"\n"}visibility.</Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <MaterialCommunityIcons name="rocket-launch" size={24} color="#9F7AEA" />
                            </View>
                            <Text style={styles.featureTitle}>Proven Ad{"\n"}Strategies</Text>
                            <Text style={styles.featureDescription}>Data-backed{"\n"}campaigns.</Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <MaterialCommunityIcons name="headset" size={24} color="#9F7AEA" />
                            </View>
                            <Text style={styles.featureTitle}>Dedicated{"\n"}Support</Text>
                            <Text style={styles.featureDescription}>Expert help{"\n"}always on.</Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <MaterialCommunityIcons name="currency-usd" size={24} color="#9F7AEA" />
                            </View>
                            <Text style={styles.featureTitle}>Low-cost Lead{"\n"}Generation</Text>
                            <Text style={styles.featureDescription}>Maximize ROI{"\n"}per lead.</Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <MaterialCommunityIcons name="trending-up" size={24} color="#9F7AEA" />
                            </View>
                            <Text style={styles.featureTitle}>Scalable Grow{"\n"}results</Text>
                            <Text style={styles.featureDescription}>Grow your{"\n"}business fast.</Text>
                        </View>
                    </View>
                </View>



                {/* Services Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.mainSectionTitle}>Our Services</Text>
                    </View>

                    {services.slice(0, 3).map((service, index) => (
                        <TouchableOpacity
                            key={service.id || index}
                            style={styles.serviceItem}
                            onPress={() => navigation.navigate('Services')}
                        >
                            <View style={[styles.serviceIconContainer, {
                                backgroundColor: index % 3 === 0 ? '#F4E8FC' : index % 3 === 1 ? '#ECFDF5' : '#F5F3FF'
                            }]}>
                                {service.iconUrl ? (
                                    <Image
                                        source={{ uri: service.iconUrl }}
                                        style={{ width: 26, height: 26 }}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Ionicons
                                        name={index % 3 === 0 ? "megaphone-outline" : index % 3 === 1 ? "people-outline" : "stats-chart-outline"}
                                        size={24}
                                        color={index % 3 === 0 ? '#9333EA' : index % 3 === 1 ? '#10B981' : '#8B5CF6'}
                                    />
                                )}
                            </View>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceTitle}>{service.title}</Text>
                                <Text style={styles.serviceDescription}>{service.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.exploreAllServices}
                        onPress={() => navigation.navigate('Services')}
                    >
                        <Text style={styles.exploreAllText}>Explore All Services</Text>
                        <Ionicons name="arrow-forward" size={16} color="#9333EA" />
                    </TouchableOpacity>

                    {services.length === 0 && !loading && (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#94A3B8' }}>No services available.</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.section, styles.howItWorksSection]}>
                    <Text style={styles.mainSectionTitle}>How It Works</Text>
                    <View style={styles.stepsContainer}>
                        {[
                            { title: 'Book a Call', desc: 'Schedule your free strategy session with our expert team.', icon: 'call' },
                            { title: 'We Run Ads', desc: 'Our team launches high-converting campaigns on Meta.', icon: 'megaphone' },
                            { title: 'Leads are Generated', desc: 'Qualified leads begin appearing in your dashboard instantly.', icon: 'people' },
                            { title: 'Track Inside App', desc: 'Monitor lead quality, spend, and ROI in real-time.', icon: 'phone-portrait' },
                            { title: 'You Close Deals', desc: 'Convert high-quality leads into loyal paying customers.', icon: 'checkmark-done-circle' },
                        ].map((step, index, array) => (
                            <View key={index} style={styles.stepItem}>
                                <View style={styles.stepIndicator}>
                                    <View style={styles.stepCircle}>
                                        <Ionicons name={step.icon} size={18} color="#fff" />
                                    </View>
                                    {index !== array.length - 1 && <View style={styles.stepLine} />}
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                    <Text style={styles.stepDescription}>{step.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.ctaSection}>
                    <Text style={styles.ctaTitle}>Start Getting Leads for Your Business Today</Text>
                    {/* <Text style={styles.ctaSubtitle}>Let's take your leads and sales to the next level.</Text> */}

                    <TouchableOpacity style={styles.ctaPrimaryButton} onPress={handleCall}>
                        <Ionicons name="call" size={22} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.ctaPrimaryButtonText}>Book Free Call Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.ctaSecondaryButton} onPress={handleWhatsApp}>
                        <FontAwesome5 name="whatsapp" size={24} color="#25D366" style={{ marginRight: 10 }} />
                        <Text style={styles.ctaSecondaryButtonText}>Chat on WhatsApp</Text>
                    </TouchableOpacity>
                </View>



                <View style={styles.contactSection}>
                    <View style={styles.contactIllustrationContainer}>
                        <MaterialCommunityIcons name="rocket-launch" size={100} color="#9F7AEA" style={styles.rocketIcon} />
                        <View style={styles.chartBars}>
                            <View style={[styles.chartBar, { height: 20, backgroundColor: '#F3E8FF' }]} />
                            <View style={[styles.chartBar, { height: 35, backgroundColor: '#E9D5FF' }]} />
                            <View style={[styles.chartBar, { height: 50, backgroundColor: '#D8B4FE' }]} />
                            <View style={[styles.chartBar, { height: 70, backgroundColor: '#A855F7' }]} />
                        </View>
                    </View>

                    <Text style={styles.contactTitle}>Let’s Grow Your Business Together</Text>
                    <Text style={styles.contactSubtitle}>Talk to our {getContactInfo(user).TEAM} for expert assistance.</Text>

                    <View style={styles.contactItems}>
                        <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                            <View style={styles.contactIconBg}>
                                <Ionicons name="call" size={20} color="#1D6AF2" />
                            </View>
                            <Text style={styles.contactItemText}>Call {getContactInfo(user).TEAM.split(' ')[0]}</Text>
                        </TouchableOpacity>
                        {/* <View style={styles.contactItem}>
                            <View style={styles.contactIconBg}>
                                <Ionicons name="mail" size={20} color="#1D6AF2" />
                            </View>
                            <Text style={styles.contactItemText}>hello@leaditoai.com</Text>
                        </View> */}
                        {/* <View style={styles.contactItem}>
                            <View style={styles.contactIconBg}>
                                <Ionicons name="globe" size={20} color="#1D6AF2" />
                            </View>
                            <Text style={styles.contactItemText}>www.leaditoai.com</Text>
                        </View> */}
                        <View style={styles.contactItem}>
                            <View style={styles.contactIconBg}>
                                <Ionicons name="location" size={20} color="#1D6AF2" />
                            </View>
                            <Text style={styles.contactItemText}>Hyderabad, India</Text>
                        </View>
                    </View>

                    <View style={styles.socialRow}>
                        {/* <TouchableOpacity>
                            <Entypo name="facebook-with-circle" size={36} color="#1877F2" />
                        </TouchableOpacity> */}
                        <TouchableOpacity>
                            <LinearGradient
                                colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
                                style={styles.socialInstaGradient}
                            >
                                <Ionicons name="logo-instagram" size={20} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                        {/* <TouchableOpacity>
                            <Entypo name="linkedin-with-circle" size={36} color="#0A66C2" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Entypo name="youtube-with-circle" size={36} color="#FF0000" />
                        </TouchableOpacity> */}
                    </View>
                </View>

                {/* Extra Padding for Bottom Tab */}
                <View style={{ height: 10 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 28,
        height: 28,
        backgroundColor: '#0047AB',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#7B61FF',
    },
    exploreAllServices: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3E8FF',
        paddingVertical: 12,
        borderRadius: 14,
        marginTop: 10,
        gap: 8,
    },
    exploreAllText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9333EA',
    },
    iconButton: {
        padding: 5,
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#7B61FF',
    },
    headerRight: {
        flexDirection: 'row',
    },
    scrollContent: {
        flexGrow: 1,
    },
    heroSection: {
        width: '100%',
        height: 220,
        backgroundColor: '#F3E8FF',
        marginTop: 10,
        overflow: 'hidden',
    },
    heroBgImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        padding: 20,
        justifyContent: 'center',
    },
    heroContent: {
        width: '75%',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#2D1E4E',
        lineHeight: 30,
        marginBottom: 8,
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#34495e',
        lineHeight: 22,
        marginBottom: 15,
        fontWeight: '600',
    },
    heroButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    bookCallButton: {
        backgroundColor: '#388e3c',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: 8,
        elevation: 3,
    },
    whatsappButton: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: fontSize(13),
    },
    whatsappButtonText: {
        color: '#263238',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: fontSize(13),
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 25,
    },
    mainSectionTitle: {
        fontSize: fontSize(22),
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: verticalScale(15),
    },
    videoCard: {
        backgroundColor: '#F3E8FF',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E9D5FF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    videoThumbnail: {
        height: verticalScale(200),
        width: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    thumbnailOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    /* Fullscreen modal */
    videoModal: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
    },
    videoCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    playButtonContainer: {
        width: 36,
        height: 36,
        backgroundColor: 'rgba(123, 97, 255, 0.9)',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 3,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    videoInfo: {
        padding: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D1E4E',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#556987',
        marginTop: 6,
        lineHeight: 22,
    },
    aboutCard: {
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        backgroundColor: '#fff',
    },
    aboutGradient: {
        padding: 24,
    },
    aboutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    aboutIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    aboutIconBg: {
        width: 34,
        height: 34,
        backgroundColor: '#fff',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aboutTitle: {
        fontSize: fontSize(22),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    aboutText: {
        fontSize: fontSize(16),
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: fontSize(24),
        fontWeight: '500',
    },
    aboutStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(20),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: moderateScale(15),
        borderRadius: 16,
        justifyContent: 'space-around',
    },
    aboutStat: {
        alignItems: 'center',
    },
    aboutStatLabel: {
        fontSize: fontSize(10),
        color: 'rgba(255, 255, 255, 0.7)',
        textTransform: 'uppercase',
        fontWeight: 'Bold',
        marginBottom: 2,
    },
    aboutStatValue: {
        fontSize: fontSize(14),
        fontWeight: '900',
        color: '#fff',
    },
    aboutStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    testimonialContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    testimonialScroll: {
        paddingRight: 20,
    },
    testimonialCard: {
        backgroundColor: '#F4F8FF',
        padding: moderateScale(20),
        borderRadius: 20,
        width: width * 0.86,
        marginRight: scale(15),
        borderWidth: 1,
        borderColor: '#EBF2FF',
    },
    testimonialCardPeek: {
        width: 40,
        marginRight: 0,
    },
    scrollArrow: {
        position: 'absolute',
        right: -10,
        width: 36,
        height: 80,
        backgroundColor: '#F4F8FF',
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    testimonialHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    userInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    socialIcon: {
        width: 18,
        height: 18,
        backgroundColor: '#1DA1F2',
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    userName: {
        fontSize: fontSize(18),
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    userRole: {
        fontSize: fontSize(15),
        color: '#6E7A91',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
        marginRight: 4,
    },
    ratingText: {
        fontSize: fontSize(13),
        color: '#6E7A91',
        fontWeight: '600',
    },
    testimonialText: {
        fontSize: fontSize(11.5),
        color: '#4A5568',
        lineHeight: fontSize(17),
        fontWeight: '500',
    },
    seeAllLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    seeAllText: {
        color: '#7B61FF',
        fontSize: fontSize(17),
        fontWeight: 'bold',
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 18,
        paddingHorizontal: 15,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F3E8FF',
    },
    serviceIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceTitle: {
        fontSize: fontSize(18),
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 2,
    },
    serviceDescription: {
        fontSize: fontSize(14),
        color: '#6E7A91',
        lineHeight: fontSize(20),
    },
    featuresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    featureCard: {
        backgroundColor: '#fff',
        width: (width - 40 - 16) / 3, // 3 per row for better readability
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3E8FF',
        marginBottom: 8,
    },
    featureIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: '#F3E8FF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureTitle: {
        fontSize: fontSize(12),
        fontWeight: 'bold',
        color: '#2D1E4E',
        textAlign: 'center',
        lineHeight: fontSize(14),
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: fontSize(10),
        color: '#556987',
        textAlign: 'center',
        lineHeight: fontSize(12),
    },
    ctaSection: {
        backgroundColor: '#F3E8FF',
        marginHorizontal: 15,
        marginTop: 30,
        paddingVertical: 35,
        paddingHorizontal: 20,
        borderRadius: 24,
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: fontSize(20),
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: verticalScale(10),
    },
    ctaSubtitle: {
        fontSize: fontSize(14),
        color: '#64748B',
        textAlign: 'center',
        marginBottom: verticalScale(15),
    },
    ctaPrimaryButton: {
        backgroundColor: '#7B61FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        paddingVertical: 18,
        borderRadius: 15,
        marginBottom: 10,
    },
    ctaPrimaryButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    ctaSecondaryButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        paddingVertical: 18,
        borderRadius: 15,
    },
    ctaSecondaryButtonText: {
        color: '#1E293B',
        fontSize: 13,
        fontWeight: 'bold',
    },
    contactSection: {
        backgroundColor: '#F3E8FF',
        marginHorizontal: 15,
        marginTop: 30,
        padding: 25,
        borderRadius: 30,
    },
    contactIllustrationContainer: {
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    rocketIcon: {
        transform: [{ rotate: '-45deg' }],
        zIndex: 2,
    },
    chartBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        position: 'absolute',
        bottom: 10,
        right: '15%',
    },
    chartBar: {
        width: 12,
        borderRadius: 3,
    },
    contactTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0F172A',
        lineHeight: 36,
        marginBottom: 10,
    },
    contactSubtitle: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 25,
    },
    contactItems: {
        marginBottom: 30,
        gap: 15,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactIconBg: {
        width: 36,
        height: 36,
        backgroundColor: '#F3E8FF',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactItemText: {
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '600',
    },
    howItWorksSection: {
        marginTop: 35,
        paddingBottom: 20,
    },
    stepsContainer: {
        paddingTop: 10,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepIndicator: {
        alignItems: 'center',
        width: 40,
        marginRight: 15,
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#7B61FF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    stepLine: {
        width: 2,
        height: 40,
        backgroundColor: '#E0E7FF',
        marginVertical: -2,
    },
    stepContent: {
        flex: 1,
        paddingBottom: 25,
    },
    stepTitle: {
        fontSize: fontSize(18),
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: fontSize(15),
        color: '#64748B',
        lineHeight: fontSize(22),
    },
    socialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    socialInstaGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;
