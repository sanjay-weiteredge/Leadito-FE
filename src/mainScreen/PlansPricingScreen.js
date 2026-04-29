import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import GlobalHeader from '../components/GlobalHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeCall, openWhatsApp, getContactNumberSync } from '../utils/contact';
import RazorpayCheckout from 'react-native-razorpay';
import api from '../services/api';
import { ActivityIndicator, Alert } from 'react-native';

const { width } = Dimensions.get('window');

const PLANS = [
    {
        id: '1',
        name: 'Basic',
        description: 'Perfect for getting started with lead generation.',
        price: '1,499',
        period: '/month',
        buttonText: 'Get Started',
        features: [
            { text: 'Up to 1,000 Leads / mo', included: true },
            { text: '1 Ad Account', included: true },
            { text: 'Basic Lead Management', included: true },
            { text: 'Email Support', included: true },
            { text: 'Advanced Analytics', included: false },
            { text: 'Priority Support', included: false },
        ],
        isPopular: false,
    },
    {
        id: '2',
        name: 'Growth',
        description: 'Everything you need to scale your business faster.',
        price: '3,499',
        period: '/month',
        buttonText: 'Choose Growth',
        features: [
            { text: 'Up to 10,000 Leads / mo', included: true },
            { text: '5 Ad Accounts', included: true },
            { text: 'Advanced Lead Management', included: true },
            { text: 'Advanced Analytics', included: true },
            { text: 'WhatsApp & Email Support', included: true },
            { text: 'Priority Support', included: true },
        ],
        isPopular: true,
    },
    {
        id: '3',
        name: 'Premium',
        description: 'For businesses that want maximum growth and support.',
        price: '6,999',
        period: '/month',
        buttonText: 'Get Started',
        features: [
            { text: 'Unlimited Leads', included: true },
            { text: 'Unlimited Ad Accounts', included: true },
            { text: 'Advanced Lead Management', included: true },
            { text: 'Advanced Analytics', included: true },
            { text: 'Dedicated Account Manager', included: true },
            { text: 'Priority Support', included: true },
        ],
        isPopular: false,
    },
];

const COMPARISON_DATA = [
    { id: 'c1', feature: 'Leads / Month', basic: '1,000', growth: '10,000', premium: 'Unlimited', icon: 'account-group-outline', iconType: 'MaterialCommunityIcons', color: '#2563EB' },
    { id: 'c2', feature: 'Ad Accounts', basic: '1', growth: '5', premium: 'Unlimited', icon: 'megaphone-outline', iconType: 'Ionicons', color: '#10B981' },
    { id: 'c3', feature: 'Lead Management', basic: true, growth: true, premium: true, icon: 'chart-box-outline', iconType: 'MaterialCommunityIcons', color: '#8B5CF6' },
    { id: 'c4', feature: 'Advanced Analytics', basic: false, growth: true, premium: true, icon: 'chart-pie', iconType: 'MaterialCommunityIcons', color: '#F59E0B' },
    { id: 'c5', feature: 'Priority Support', basic: false, growth: true, premium: true, icon: 'headset-outline', iconType: 'Ionicons', color: '#EC4899' },
    { id: 'c6', feature: 'Dedicated Account Manager', basic: false, growth: false, premium: true, icon: 'account-tie-outline', iconType: 'MaterialCommunityIcons', color: '#14B8A6' },
];

const PlansPricingScreen = ({ navigation }) => {
    const [billingCycle, setBillingCycle] = useState('Monthly');
    const [user, setUser] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const razorpayKeyId = 'rzp_test_SjDu4klAok3IJW'; // Replace with your actual Test Key ID

    React.useEffect(() => {
        loadUser();
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/plans');
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
            Alert.alert('Error', 'Failed to load plans. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

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

    const contactNumber = getContactNumberSync(user);

    const handleCall = () => makeCall(contactNumber);
    const handleWhatsApp = () => openWhatsApp(contactNumber, "Hi, I have questions about the subscription plans.");

    const handlePlanSelection = async (plan) => {
        if (!user) {
            Alert.alert('Authentication Required', 'Please login to purchase a plan.', [
                { text: 'Login', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        setPaymentLoading(true);
        try {
            // 1. Create order on backend
            const orderResponse = await api.post('/subscription/create-order', {
                planId: plan.id
            });

            const { orderId, amount, currency, planName } = orderResponse.data;

            // 2. Razorpay options
            const options = {
                description: `Payment for ${planName} Plan`,
                image: 'https://i.imgur.com/3g7nmJC.png', // Add your logo URL here
                currency: currency,
                key: razorpayKeyId,
                amount: amount,
                name: 'Leadito',
                order_id: orderId,
                prefill: {
                    email: user.email || '',
                    contact: user.phone || '',
                    name: user.name || ''
                },
                theme: { color: '#2563EB' }
            };

            // 3. Open Razorpay native checkout
            RazorpayCheckout.open(options).then(async (data) => {
                // 4. Verify payment on backend
                try {
                    const verifyResponse = await api.post('/subscription/verify-payment', {
                        razorpay_order_id: data.razorpay_order_id,
                        razorpay_payment_id: data.razorpay_payment_id,
                        razorpay_signature: data.razorpay_signature,
                        planId: plan.id
                    });

                    // Update local user status
                    const updatedUser = { ...user, isActive: true };
                    await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
                    setUser(updatedUser);

                    Alert.alert('Success', 'Payment successful! Your plan is now active.', [
                        { text: 'OK', onPress: () => navigation.navigate('Home') }
                    ]);
                } catch (verifyErr) {
                    console.error('Payment verification error:', verifyErr);
                    Alert.alert('Error', 'Payment verification failed. Please contact support.');
                }
            }).catch((error) => {
                console.error('Razorpay Error:', error);
                if (error.code !== 2) { // 2 = Payment cancelled by user
                    Alert.alert('Payment Error', `Error: ${error.description}`);
                }
            });
        } catch (err) {
            console.error('Order creation error:', err);
            Alert.alert('Error', 'Failed to initiate payment. Please try again.');
        } finally {
            setPaymentLoading(false);
        }
    };

    const renderPlanCard = ({ item: plan }) => (
        <View style={[styles.planCard, plan.isPopular && styles.popularPlanCard]}>
            {plan.isPopular && (
                <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>🔥 Most Popular</Text>
                </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDesc}>{plan.description}</Text>

            <View style={styles.priceContainer}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
            </View>

            <TouchableOpacity style={[styles.planButton, plan.isPopular ? styles.popularButton : styles.normalButton]}>
                <Text style={[styles.planButtonText, plan.isPopular ? styles.popularButtonText : styles.normalButtonText]}>
                    {plan.buttonText}
                </Text>
            </TouchableOpacity>

            <View style={styles.featuresList}>
                {plan.features.map((feature, fIndex) => (
                    <View key={fIndex} style={styles.featureRow}>
                        <Ionicons
                            name={feature.included ? "checkmark" : "close"}
                            size={16}
                            color={feature.included ? "#10B981" : "#94A3B8"}
                            style={styles.featureIcon}
                        />
                        <Text style={[styles.featureText, !feature.included && styles.featureTextDisabled]}>
                            {feature.text}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <ScreenWrapper style={styles.outerContainer}>
            <GlobalHeader onNotificationPress={() => console.log('Notification Pressed')} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>Plans & Pricing</Text>
                    <Text style={styles.mainSubtitle}>Choose the Right Plan to Grow Your Business</Text>
                    <Text style={styles.subSubtitle}>Start generating high-quality leads with our proven Meta Ads system</Text>


                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={styles.loadingText}>Loading Plans...</Text>
                    </View>
                ) : (
                    <View style={styles.plansContainer}>
                        {plans.map((plan) => {
                            // Find matching metadata from PLANS array based on name (case insensitive)
                            const metadata = PLANS.find(p => p.name.toLowerCase() === plan.name.toLowerCase()) || PLANS[0];
                            return (
                                <View key={plan.id} style={[styles.planCard, metadata.isPopular && styles.popularPlanCard]}>
                                    {metadata.isPopular && (
                                        <View style={styles.popularBadge}>
                                            <Text style={styles.popularBadgeText}>Most Popular</Text>
                                        </View>
                                    )}
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <Text style={styles.planDesc}>{metadata.description}</Text>

                                    <View style={styles.priceContainer}>
                                        <Text style={styles.currency}>₹</Text>
                                        <Text style={styles.price}>{plan.price}</Text>
                                    </View>
                                    <Text style={styles.period}>{metadata.period}</Text>

                                    <TouchableOpacity
                                        style={[styles.planButton, metadata.isPopular ? styles.popularButton : styles.normalButton]}
                                        onPress={() => handlePlanSelection(plan)}
                                        disabled={paymentLoading}
                                    >
                                        {paymentLoading ? (
                                            <ActivityIndicator size="small" color={metadata.isPopular ? "#fff" : "#2563EB"} />
                                        ) : (
                                            <Text style={[styles.planButtonText, metadata.isPopular ? styles.popularButtonText : styles.normalButtonText]}>
                                                {metadata.isPopular ? 'Choose' : 'Get'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.featuresList}>
                                        {metadata.features.map((feature, fIndex) => (
                                            <View key={fIndex} style={styles.featureRow}>
                                                <Ionicons
                                                    name={feature.included ? "checkmark-circle" : "close-circle"}
                                                    size={10}
                                                    color={feature.included ? "#10B981" : "#E2E8F0"}
                                                    style={styles.featureIcon}
                                                />
                                                <Text style={[styles.featureText, !feature.included && styles.featureTextDisabled]}>
                                                    {feature.text}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.comparisonSection}>
                    <Text style={styles.sectionTitle}>Compare Plans</Text>
                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <View style={styles.tableLabelCell} />
                            <Text style={styles.tableHeadText}>Basic</Text>
                            <View style={styles.highlightHeader}>
                                <Text style={[styles.tableHeadText, { color: '#2563EB' }]}>Growth</Text>
                            </View>
                            <Text style={styles.tableHeadText}>Premium</Text>
                        </View>

                        {COMPARISON_DATA.map((item) => (
                            <View key={item.id} style={styles.tableRow}>
                                <View style={styles.tableLabelCell}>
                                    {item.iconType === 'Ionicons' ? (
                                        <Ionicons name={item.icon} size={18} color={item.color} />
                                    ) : (
                                        <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
                                    )}
                                    <Text style={styles.rowLabelText} numberOfLines={1}>{item.feature}</Text>
                                </View>

                                <View style={styles.tableCell}>
                                    {typeof item.basic === 'boolean' ? (
                                        <Ionicons name={item.basic ? "checkmark" : "close"} size={20} color={item.basic ? "#10B981" : "#94A3B8"} />
                                    ) : (
                                        <Text style={styles.cellText}>{item.basic}</Text>
                                    )}
                                </View>

                                <View style={[styles.tableCell, styles.highlightCell]}>
                                    {typeof item.growth === 'boolean' ? (
                                        <Ionicons name={item.growth ? "checkmark" : "close"} size={20} color="#2563EB" />
                                    ) : (
                                        <Text style={[styles.cellText, { color: '#2563EB', fontWeight: 'bold' }]}>{item.growth}</Text>
                                    )}
                                </View>

                                <View style={styles.tableCell}>
                                    {typeof item.premium === 'boolean' ? (
                                        <Ionicons name={item.premium ? "checkmark" : "close"} size={20} color="#10B981" />
                                    ) : (
                                        <Text style={[styles.cellText, { color: '#10B981', fontWeight: 'bold' }]}>{item.premium}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.detailedStrategySection}>
                    <Text style={styles.sectionTitleCenter}>Our 3-Month Growth Strategy</Text>
                    <View style={styles.strategyCardsRow}>
                        <View style={styles.strategyStepCard}>
                            <View style={[styles.strategyStepIcon, { backgroundColor: '#EFF6FF' }]}>
                                <MaterialCommunityIcons name="bullseye" size={24} color="#2563EB" />
                            </View>
                            <View style={styles.monthBadgeBlue}><Text style={styles.monthBadgeTextBlue}>Month 1</Text></View>
                            <Text style={styles.stepTitle}>Set Up & Optimize</Text>
                            <Text style={styles.stepText}>We set up your campaigns and optimize for quality leads.</Text>
                        </View>

                        <View style={styles.strategyStepCard}>
                            <View style={[styles.strategyStepIcon, { backgroundColor: '#F0FDF4' }]}>
                                <Ionicons name="bar-chart-outline" size={24} color="#10B981" />
                            </View>
                            <View style={styles.monthBadgeGreen}><Text style={styles.monthBadgeTextGreen}>Month 2</Text></View>
                            <Text style={styles.stepTitle}>Scale & Improve</Text>
                            <Text style={styles.stepText}>We scale your campaigns and improve lead quality further.</Text>
                        </View>

                        <View style={styles.strategyStepCard}>
                            <View style={[styles.strategyStepIcon, { backgroundColor: '#FAF5FF' }]}>
                                <Ionicons name="rocket-outline" size={24} color="#8B5CF6" />
                            </View>
                            <View style={styles.monthBadgePurple}><Text style={styles.monthBadgeTextPurple}>Month 3</Text></View>
                            <Text style={styles.stepTitle}>Maximize Growth</Text>
                            <Text style={styles.stepText}>We maximize your ROI and help you grow consistently.</Text>
                        </View>
                    </View>
                </View>

                {/* Trusted By Section */}
                <View style={styles.trustedSection}>
                    <Text style={styles.sectionTitleSmall}>Trusted by Businesses Across India</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Ionicons name="people" size={20} color="#10B981" />
                            <Text style={[styles.statValue, { color: '#10B981' }]}>2,500+</Text>
                            <Text style={styles.statLabel}>Happy Businesses</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="trending-up" size={20} color="#F59E0B" />
                            <Text style={[styles.statValue, { color: '#F59E0B' }]}>5M+</Text>
                            <Text style={styles.statLabel}>Leads Generated</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={20} color="#2563EB" />
                            <Text style={[styles.statValue, { color: '#2563EB' }]}>4.9/5</Text>
                            <Text style={styles.statLabel}>Avg. Rating</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
                            <Text style={[styles.statValue, { color: '#8B5CF6' }]}>98%</Text>
                            <Text style={styles.statLabel}>Retention</Text>
                        </View>
                    </View>
                </View>

                {/* Why Choose Growth Section */}
                <View style={styles.whyGrowthSection}>
                    <View style={styles.whyGrowthCard}>
                        <View style={styles.whyGrowthLeft}>
                            <Text style={styles.whyGrowthTitle}>Why Choose the Growth Plan?</Text>
                            <View style={styles.growthBenefitsList}>
                                {[
                                    'Ideal for businesses ready to scale',
                                    'More leads, more customers, more revenue',
                                    'Advanced features to stay ahead',
                                    'Personalized support to grow faster'
                                ].map((benefit, i) => (
                                    <View key={i} style={styles.benefitRow}>
                                        <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
                                        <Text style={styles.benefitText}>{benefit}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.whyGrowthRight}>
                            <View style={styles.illustrationPlaceolder}>
                                <MaterialCommunityIcons name="chart-areaspline" size={60} color="#2563EB" />
                                <View style={styles.coinBadge}>
                                    <FontAwesome5 name="coins" size={20} color="#F59E0B" />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {[
                        "Can I change my plan later?",
                        "Is there a setup fee?",
                        "What payment methods do you accept?"
                    ].map((q, i) => (
                        <TouchableOpacity key={i} style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>{q}</Text>
                            <Ionicons name="chevron-down" size={18} color="#64748B" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Final CTA Image Banner */}
                <View style={styles.imageBannerContainer}>
                    <Image
                        source={require('../assessts/Plans.png')}
                        style={styles.fullImageBanner}
                        resizeMode="cover"
                    />
                    <View style={styles.imageTextOverlay}>
                        <Text style={styles.overlayTitle}>Ready to Grow Your Business?</Text>
                        <Text style={styles.overlaySubtitle}>Book a free call with our experts and find the perfect plan for you.</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <View style={styles.footerButtons}>
                    <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#1D6AF2' }]} onPress={handleCall}>
                        <Ionicons name="call" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.footerBtnText}>Call Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.footerBtn, styles.whiteBtn]} onPress={handleWhatsApp}>
                        <FontAwesome5 name="whatsapp" size={18} color="#25D366" style={{ marginRight: 8 }} />
                        <Text style={[styles.footerBtnText, { color: '#1E293B' }]}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#1D6AF2' }]}>
                        <Ionicons name="calendar" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.footerBtnText}>Book Free Call</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.footerNoteRow}>
                    <Ionicons name="lock-closed" size={12} color="#64748B" />
                    <Text style={styles.footerNoteText}>Secure. Cancel anytime. No hidden charges.</Text>
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: '#fff',
        flex: 1,
    },
    loadingContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748B',
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    logoRow: {
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
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0047AB',
    },
    logoSubtitle: {
        fontSize: 10,
        color: '#64748B',
        marginTop: -2,
    },
    scrollContent: {
        flexGrow: 1,
    },
    titleSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 20,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0D1B3E',
        marginBottom: 8,
    },
    mainSubtitle: {
        fontSize: 16,
        color: '#334155',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 4,
    },
    subSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        padding: 5,
        borderRadius: 12,
        width: '100%',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleYearlyActive: {
        backgroundColor: '#E8F5E9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#0D1B3E',
        fontWeight: 'bold',
    },
    toggleTextYearlyActive: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    plansContainer: {
        flexDirection: 'row',
        paddingHorizontal: 4,
        paddingVertical: 10,
        justifyContent: 'space-between',
        alignItems: 'stretch',
    },
    planCard: {
        width: (width - 16) / 3,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    popularPlanCard: {
        borderColor: '#2563EB',
        borderWidth: 1.5,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        left: 2,
        right: 2,
        backgroundColor: '#2563EB',
        paddingVertical: 2,
        borderRadius: 5,
        alignItems: 'center',
        zIndex: 10,
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 7,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    planName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0D1B3E',
        marginBottom: 2,
        marginTop: 4,
        flexShrink: 1,
    },
    planDesc: {
        fontSize: 8.5,
        color: '#64748B',
        lineHeight: 11,
        marginBottom: 8,
        flexShrink: 1,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0D1B3E',
    },
    price: {
        fontSize: 15,
        fontWeight: '900',
        color: '#0D1B3E',
    },
    period: {
        fontSize: 8.5,
        color: '#64748B',
        marginBottom: 8,
    },
    planButton: {
        height: 28,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    normalButton: {
        backgroundColor: '#EFF6FF',
    },
    popularButton: {
        backgroundColor: '#2563EB',
    },
    planButtonText: {
        fontSize: 9.5,
        fontWeight: 'bold',
    },
    normalButtonText: {
        color: '#2563EB',
    },
    popularButtonText: {
        color: '#fff',
    },
    featuresList: {
        gap: 4,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 1,
        width: '100%',
    },
    featureIcon: {
        marginRight: 3,
        marginTop: 1,
    },
    featureText: {
        fontSize: 8,
        color: '#334155',
        fontWeight: '500',
        flex: 1,
        flexWrap: 'wrap',
        lineHeight: 10,
    },
    featureTextDisabled: {
        color: '#94A3B8',
        textDecorationLine: 'line-through',
    },
    comparisonSection: {
        paddingHorizontal: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0D1B3E',
        marginBottom: 16,
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#FAFBFC',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tableLabelCell: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        gap: 8,
    },
    tableHeadText: {
        flex: 1,
        fontSize: 11,
        fontWeight: 'bold',
        color: '#475569',
        textAlign: 'center',
    },
    highlightHeader: {
        flex: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E2E8F0',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        alignItems: 'center',
    },
    rowLabelText: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '600',
        flex: 1,
    },
    tableCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    highlightCell: {
        backgroundColor: '#F0F7FF',
        marginVertical: -12,
        paddingVertical: 12,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E2E8F0',
    },
    cellText: {
        fontSize: 11,
        color: '#334155',
        fontWeight: '600',
    },
    sectionTitleCenter: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0D1B3E',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitleSmall: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0D1B3E',
        textAlign: 'center',
        marginBottom: 20,
    },
    detailedStrategySection: {
        paddingHorizontal: 12,
        marginTop: 30,
    },
    strategyCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    strategyStepCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    strategyStepIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    monthBadgeBlue: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 8,
    },
    monthBadgeTextBlue: {
        color: '#2563EB',
        fontSize: 9,
        fontWeight: 'bold',
    },
    monthBadgeGreen: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 8,
    },
    monthBadgeTextGreen: {
        color: '#10B981',
        fontSize: 9,
        fontWeight: 'bold',
    },
    monthBadgePurple: {
        backgroundColor: '#FAF5FF',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 8,
    },
    monthBadgeTextPurple: {
        color: '#8B5CF6',
        fontSize: 9,
        fontWeight: 'bold',
    },
    stepTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 6,
    },
    stepText: {
        fontSize: 8.5,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 12,
    },
    trustedSection: {
        marginTop: 40,
        paddingHorizontal: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        gap: 12,
    },
    statItem: {
        width: '46%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '600',
        textAlign: 'center',
    },
    whyGrowthSection: {
        marginTop: 30,
        paddingHorizontal: 16,
    },
    whyGrowthCard: {
        flexDirection: 'row',
        backgroundColor: '#F0F7FF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
    },
    whyGrowthLeft: {
        flex: 1.5,
    },
    whyGrowthRight: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    whyGrowthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0D1B3E',
        marginBottom: 12,
    },
    growthBenefitsList: {
        gap: 8,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    benefitText: {
        fontSize: 10,
        color: '#1E293B',
        fontWeight: '500',
    },
    illustrationPlaceolder: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFFBEB',
        padding: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    faqSection: {
        marginTop: 40,
        paddingHorizontal: 16,
    },
    faqItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    imageBannerContainer: {
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 20,
        overflow: 'hidden',
        height: 120, // Height to match the aspect ratio of the image
        position: 'relative',
    },
    fullImageBanner: {
        width: '100%',
        height: '100%',
    },
    imageTextOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 16,
        justifyContent: 'center',
    },
    overlayTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0D1B3E',
        width: '60%', // Constraint width to match the design where text is on the left
        marginBottom: 4,
    },
    overlaySubtitle: {
        fontSize: 11,
        color: '#334155',
        width: '55%',
        lineHeight: 15,
    },
    faqQuestion: {
        fontSize: 13,
        color: '#1E293B',
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingTop: 15,
        paddingBottom: 25,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    footerBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 48,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    whiteBtn: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    footerBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    footerNoteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 6,
    },
    footerNoteText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
    },
});

export default PlansPricingScreen;
