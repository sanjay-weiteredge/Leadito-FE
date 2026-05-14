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
    RefreshControl,
    Modal,
    Linking,
} from 'react-native';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import GlobalHeader from '../components/GlobalHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeCall, openWhatsApp, getContactInfo, getCallNumberSync, getWhatsAppNumberSync } from '../utils/contact';
import api from '../services/api';
import { ActivityIndicator } from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';
import { showSweetAlert } from '../components/SweetAlert';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const WHY_CHOOSE_US = [
    { title: 'Real-Time Lead & ROI Tracking inside App', desc: 'Monitor leads & ROI inside the app', icon: 'stats-chart-outline', color: '#9333EA' },
    { title: 'Complete Transparency', desc: 'Full visibility on every ad rupee spent', icon: 'eye-outline', color: '#10B981' },
    { title: 'Proven Meta Ads Strategies', desc: 'Tested Meta Ads growth frameworks', icon: 'megaphone-outline', color: '#F59E0B' },
    { title: 'Focus on Quality Leads', desc: 'Verified leads that convert to sales', icon: 'ribbon-outline', color: '#8B5CF6' },
    { title: 'Dedicated Support', desc: 'Expert assistance when you need it', icon: 'headset-outline', color: '#EC4899' },
    { title: 'System-Based Approach', desc: 'Scalable, process-driven approach', icon: 'layers-outline', color: '#06B6D4' },
];

const PLANS_METADATA = [
    {
        keyword: 'starter',
        description: 'Starter Plan (3 Months)',
        isPopular: false,
        dot: '🟢',
    },
    {
        keyword: 'growth',
        description: 'Scale Your Business',
        isPopular: true,
        dot: '🟡',
    },
    {
        keyword: 'premium',
        keyword2: 'scale',
        description: 'Full Market Domination',
        isPopular: false,
        dot: '🔴',
    },
];


const PlansPricingScreen = ({ navigation }) => {
    const [billingCycle, setBillingCycle] = useState('Monthly');
    const [user, setUser] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const { checkSubscription } = useSubscription();

    // --- Manual Payment State ---
    const [manualModalVisible, setManualModalVisible] = useState(false);
    const [selectedPlanRef, setSelectedPlanRef] = useState(null);
    const [paymentProof, setPaymentProof] = useState(null);
    const [submittingProof, setSubmittingProof] = useState(false);

    const [paymentLink, setPaymentLink] = useState("https://rzp.io/rzp/2XhtHctI");

    React.useEffect(() => {
        loadUser();
        fetchPlans();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            if (response.data && response.data.RAZORPAY_PAYMENT_LINK) {
                setPaymentLink(response.data.RAZORPAY_PAYMENT_LINK);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('/plans');
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
            showSweetAlert('Error', 'Failed to load plans. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadUser(), fetchPlans()]);
        setRefreshing(false);
    }, []);

    const loadUser = async () => {
        try {
            // Fetch fresh profile from API to always have up-to-date subscription data
            const response = await api.get('/user/profile');
            setUser(response.data);
            await AsyncStorage.setItem('userProfile', JSON.stringify(response.data));
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Fallback to cached profile
            try {
                const profileStr = await AsyncStorage.getItem('userProfile');
                if (profileStr) setUser(JSON.parse(profileStr));
            } catch (e) { /* ignore */ }
        }
    };

    const handleCall = () => {
        const num = getCallNumberSync(user);
        makeCall(num);
    };

    const handleWhatsApp = () => {
        const num = getWhatsAppNumberSync(user);
        openWhatsApp(num, "Hi, I have questions about the subscription plans.");
    };

    const handlePlanSelection = async (plan) => {
        if (!user) {
            showSweetAlert('Authentication Required', 'Please login to purchase a plan.', {
                confirmText: 'Login',
                onConfirm: () => navigation.navigate('Login')
            });
            return;
        }

        const activeSub = user?.subscriptions?.[0];
        const isSamePlan = user.isActive && activeSub && activeSub.planId === Number(plan.id);
        const isUpgrade = user.isActive && activeSub && activeSub.planId !== Number(plan.id);

        // --- Renewal confirmation (same plan) ---
        if (isSamePlan) {
            const currentExpiry = activeSub.expiryDate
                ? new Date(activeSub.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A';
            const duration = plan.durationDays || 90;
            const newExpiry = activeSub.expiryDate
                ? (() => {
                    const d = new Date(activeSub.expiryDate);
                    d.setDate(d.getDate() + duration);
                    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                })()
                : 'N/A';

            const confirmed = await new Promise((resolve) => {
                showSweetAlert(
                    '🔄 Renew Plan',
                    `You are renewing your ${activeSub.plan?.name || plan.name} plan.\n\nCurrent expiry: ${currentExpiry}\nNew expiry after renewal: ${newExpiry}\n\nYour remaining days will be preserved and ${duration} more days will be added.`,
                    {
                        showCancelButton: true,
                        cancelText: 'Cancel',
                        confirmText: 'Renew Now',
                        onCancel: () => resolve(false),
                        onConfirm: () => resolve(true)
                    }
                );
            });
            if (!confirmed) return;
        }

        // --- Upgrade confirmation (different plan) ---
        if (isUpgrade) {
            const remainingDays = activeSub.expiryDate
                ? Math.max(0, Math.ceil((new Date(activeSub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)))
                : 0;
            const duration = plan.durationDays || 90;

            const confirmed = await new Promise((resolve) => {
                showSweetAlert(
                    '⬆️ Upgrade Plan',
                    `You are upgrading from ${activeSub.plan?.name || 'current'} → ${plan.name}.\n\n` +
                    `• Your current plan has ${remainingDays} day(s) remaining\n` +
                    `• These days will NOT carry over\n` +
                    `• A fresh ${duration}-day ${plan.name} plan starts TODAY\n` +
                    `• You will be charged ₹${Number(plan.price).toLocaleString('en-IN')} in full`,
                    {
                        showCancelButton: true,
                        cancelText: 'Cancel',
                        confirmText: 'Yes, Upgrade',
                        onCancel: () => resolve(false),
                        onConfirm: () => resolve(true)
                    }
                );
            });
            if (!confirmed) return;
        }

        setPaymentLoading(true);
        try {
            if (plan.paymentLink) {
                // 1. Open Browser
                Linking.openURL(plan.paymentLink);

                // 2. Notify Backend (creates pending request for admin to check)
                await api.post('/subscription/manual-payment', { planId: plan.id });

                // 3. Final Guidance Alert
                showSweetAlert(
                    'Payment Initiated',
                    'Once your payment is successful, it takes approximately 24 hours for our team to verify and activate your account. Thank you for your patience!',
                    {
                        onConfirm: () => navigation.navigate('Home')
                    }
                );
            } else {
                showSweetAlert('Manual Payment', 'No payment link found for this plan. Please contact support.');
            }
        } catch (err) {
            console.error('Plan selection error:', err);
            showSweetAlert('Error', 'Failed to initiate process.');
        } finally {
            setPaymentLoading(false);
        }
    };

    const pickProofImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setPaymentProof(result.assets[0]);
        }
    };

    const handleSubmitProof = async () => {
        if (!paymentProof) {
            showSweetAlert('Proof Required', 'Please upload a screenshot of your payment confirmation.');
            return;
        }

        setSubmittingProof(true);
        try {
            const formData = new FormData();
            formData.append('planId', selectedPlanRef.id);

            const uri = paymentProof.uri;
            const type = paymentProof.mimeType || 'image/jpeg';
            const name = uri.split('/').pop();
            formData.append('proof', { uri, type, name });

            await api.post('/subscription/manual-payment', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setManualModalVisible(false);
            setPaymentProof(null);

            showSweetAlert(
                '✅ Request Submitted',
                'Your payment proof has been uploaded. Admin will verify and activate your plan shortly.',
                {
                    onConfirm: () => navigation.navigate('Home')
                }
            );
        } catch (err) {
            console.error('Submit proof error:', err);
            const msg = err.response?.data?.message || 'Failed to submit proof. Please contact support.';
            showSweetAlert('Upload Failed', msg);
        } finally {
            setSubmittingProof(false);
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
            <GlobalHeader onNotificationPress={() => navigation.navigate('Notifications')} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#7B61FF']}
                        tintColor={'#7B61FF'}
                    />
                }
            >
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>Plans & Pricing</Text>
                    <Text style={styles.mainSubtitle}>Choose the Right Plan to Grow Your Business</Text>
                    <Text style={styles.subSubtitle}>Start generating high-quality leads with our proven Meta Ads system</Text>


                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#7B61FF" />
                        <Text style={styles.loadingText}>Loading Plans...</Text>
                    </View>
                ) : (
                    <View style={styles.plansContainer}>
                        {plans.map((plan, index) => {
                            const middleIndex = Math.floor(plans.length / 2);

                            // Find matching metadata from PLANS_METADATA array
                            const metadata = PLANS_METADATA.find(p =>
                                plan.name.toLowerCase().includes(p.keyword) ||
                                (p.keyword2 && plan.name.toLowerCase().includes(p.keyword2))
                            ) || { description: '', isPopular: false, dot: '🟢' };

                            const activeSub = user?.subscriptions?.[0];
                            const isActiveSub = user?.isActive && activeSub?.planId === Number(plan.id);
                            const isDifferentPlan = user?.isActive && activeSub?.planId !== Number(plan.id);

                            const hasHighlight = plan.highlightTag && plan.highlightTag !== "None";
                            // Force highlight for the middle plan, otherwise use the tag or metadata
                            const isPopular = index === middleIndex || (hasHighlight ? plan.highlightTag === "Most Popular" : metadata.isPopular);

                            return (
                                <View key={plan.id} style={[styles.planCard, isPopular && styles.popularPlanCard]}>
                                    {hasHighlight && (
                                        <View style={[
                                            styles.popularBadge,
                                            plan.highlightTag === "Festival Offer" ? { backgroundColor: '#FF3B30' } :
                                                plan.highlightTag === "Limited Offer" ? { backgroundColor: '#FF9500' } :
                                                    plan.highlightTag === "Recommended" ? { backgroundColor: '#34C759' } :
                                                        plan.highlightTag === "Trial Offer" ? { backgroundColor: '#007AFF' } :
                                                            {} // Default styles.popularBadge is purple
                                        ]}>
                                            <Text style={styles.popularBadgeText}>
                                                {plan.highlightTag === "Most Popular" ? "⭐ " :
                                                    plan.highlightTag === "Limited Offer" ? "🔥 " :
                                                        plan.highlightTag === "Festival Offer" ? "🎁 " :
                                                            plan.highlightTag === "Trial Offer" ? "⌛ " :
                                                                plan.highlightTag === "Recommended" ? "👍 " : ""}
                                                {plan.highlightTag}
                                            </Text>
                                        </View>
                                    )}
                                    {!hasHighlight && metadata.isPopular && (
                                        <View style={styles.popularBadge}>
                                            <Text style={styles.popularBadgeText}>Most Popular</Text>
                                        </View>
                                    )}
                                    <Text style={styles.planName}>{metadata.dot} {plan.name}</Text>

                                    <View style={styles.priceContainer}>
                                        <Text style={styles.price}>₹{Number(plan.price).toLocaleString('en-IN')}</Text>
                                        <Text style={styles.periodTextSmall}> ({plan.durationDays ? plan.durationDays / 30 : 3} Months)</Text>
                                    </View>
                                    <Text style={styles.monthlyBreakdown}>({plan.price && plan.durationDays ? `₹${(plan.price / (plan.durationDays / 30)).toLocaleString('en-IN')}` : '0'}/month)</Text>

                                    {/* Ad Budget */}
                                    {plan.adBudget && (
                                        <View style={styles.adBudgetBox}>
                                            <Text style={styles.adBudgetText}>Ad Budget: {plan.adBudget} (separate)</Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={[
                                            styles.planButton,
                                            metadata.isPopular ? styles.popularButton : styles.normalButton,
                                            isActiveSub && styles.activeButton
                                        ]}
                                        onPress={() => !isActiveSub && handlePlanSelection(plan)}
                                        disabled={paymentLoading || isActiveSub}
                                    >
                                        {paymentLoading ? (
                                            <ActivityIndicator size="small" color={metadata.isPopular ? "#fff" : "#7B61FF"} />
                                        ) : (
                                            <View style={styles.buttonContent}>
                                                <Ionicons
                                                    name={isActiveSub ? "checkmark-circle" : "card-outline"}
                                                    size={14}
                                                    color={isActiveSub ? "#10B981" : (metadata.isPopular ? "#fff" : "#7B61FF")}
                                                    style={{ marginRight: 4 }}
                                                />
                                                <Text style={[styles.planButtonText, metadata.isPopular ? styles.popularButtonText : styles.normalButtonText]}>
                                                    {isActiveSub ? 'Active' : (isDifferentPlan ? 'Pay Now' : 'Pay Now')}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.includesLabelContainer}>
                                        <Text style={styles.includesLabel}>Includes:</Text>
                                    </View>

                                    <View style={styles.featuresList}>
                                        {plan.features && Array.isArray(plan.features) && plan.features.map((feature, fIndex) => {
                                            const featureText = typeof feature === 'string' ? feature : feature.text;
                                            const isIncluded = typeof feature === 'string' ? true : (feature.included !== undefined ? feature.included : feature.isAvailable);

                                            if (!isIncluded) return null;

                                            return (
                                                <View key={fIndex} style={styles.featureRow}>
                                                    <Text style={styles.featureCheck}>✔</Text>
                                                    <Text style={styles.featureText}>{featureText}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    {/* Expected Leads */}
                                    {plan.expectedLeads && (
                                        <View style={styles.expectedLeadsContainer}>
                                            <Text style={styles.expectedLeadsLabel}>📊 Expected Leads:</Text>
                                            <Text style={styles.expectedLeadsValue}>👉 {plan.expectedLeads}</Text>
                                        </View>
                                    )}

                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Ad Budget Impact Section */}
                <View style={styles.budgetImpactSection}>
                    <View style={styles.budgetHeaderCard}>
                        <LinearGradient
                            colors={['#7C3AED', '#5B21B6']}
                            style={styles.budgetHeaderGradient}
                        >
                            <MaterialCommunityIcons name="finance" size={32} color="#fff" />
                            <Text style={styles.budgetMainTitle}>HOW AD BUDGET AFFECTS RESULTS</Text>
                        </LinearGradient>
                        <View style={styles.budgetHeaderContent}>
                            <View style={styles.bulletRow}>
                                <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
                                <Text style={styles.bulletText}>Advertising budget is separate from our service fee</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Ionicons name="people-outline" size={18} color="#7C3AED" />
                                <Text style={styles.bulletText}>Your ad budget is used to show ads to potential customers</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.exampleSection}>
                        <Text style={styles.subSectionTitle}>📈 Example:</Text>
                        <View style={styles.exampleCard}>
                            <View style={styles.exampleRow}>
                                <View style={[styles.exampleDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.exampleText}><Text style={styles.boldText}>₹5,000 budget</Text> → Limited audience → Basic lead flow</Text>
                            </View>
                            <View style={styles.exampleRow}>
                                <View style={[styles.exampleDot, { backgroundColor: '#FCD34D' }]} />
                                <Text style={styles.exampleText}><Text style={styles.boldText}>₹15,000 budget</Text> → More audience → Better lead volume</Text>
                            </View>
                            <View style={styles.exampleRow}>
                                <View style={[styles.exampleDot, { backgroundColor: '#EF4444' }]} />
                                <Text style={styles.exampleText}><Text style={styles.boldText}>₹25,000+ budget</Text> → Strong reach → Higher & faster results</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.importantNotesSectionInside}>
                        <Text style={styles.importantNotesTitleSmall}>Important Notes</Text>
                        <View style={styles.notesList}>
                            <View style={styles.newNoteItem}>
                                <View style={styles.noteTitleRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                    <Text style={styles.newNoteTitle}>Ad Budget is Separate</Text>
                                </View>
                                <Text style={styles.newNoteDesc}>Advertising spend is charged separately from the service/management fee.</Text>
                            </View>

                            <View style={styles.newNoteItem}>
                                <View style={styles.noteTitleRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                    <Text style={styles.newNoteTitle}>Consistent Lead Generation System</Text>
                                </View>
                                <Text style={styles.newNoteDesc}>Our campaigns are optimized to generate high-intent business leads.</Text>
                            </View>

                            <View style={styles.resultsDependContainer}>
                                <View style={styles.noteTitleRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                    <Text style={styles.newNoteTitle}>Results Depend On:</Text>
                                </View>
                                <View style={styles.subNoteList}>
                                    {['Business niche', 'Offer quality', 'Ad budget consistency', 'Follow-up speed', 'Sales conversion process'].map((item, index) => (
                                        <View key={index} style={styles.subNoteItem}>
                                            <View style={styles.subNoteDot} />
                                            <Text style={styles.impNoteSubText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.newNoteItem}>
                                <View style={styles.noteTitleRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                    <Text style={styles.newNoteTitle}>Better Follow-Up = Better Results</Text>
                                </View>
                                <Text style={styles.newNoteDesc}>Fast response and proper follow-up improve lead quality and conversions</Text>
                            </View>
                        </View>
                    </View>



                    {/* <View style={styles.noteSection}>
                        <View style={styles.noteHeader}>
                            <Ionicons name="warning" size={20} color="#F59E0B" />
                            <Text style={styles.noteTitle}>Important Note:</Text>
                        </View>
                        <View style={styles.noteContent}>
                            <Text style={styles.noteItemText}>• Results improve with consistent budget and optimization over time</Text>
                            <Text style={styles.noteItemText}>• Stopping or reducing budget frequently may affect performance</Text>
                            <Text style={styles.noteItemText}>• Lead quality also depends on:</Text>
                            <View style={styles.subNotes}>
                                <Text style={styles.subNoteText}>- Business offer</Text>
                                <Text style={styles.subNoteText}>- Pricing</Text>
                                <Text style={styles.subNoteText}>- Target audience</Text>
                                <Text style={styles.subNoteText}>- Market demand</Text>
                            </View>
                        </View>
                    </View> */}
                </View>

                <View style={styles.commitmentSection}>
                    <Text style={styles.commitmentMainTitle}>WHY WE WORK ON A 3-MONTH SYSTEM</Text>

                    <View style={styles.strategyCardsRow}>
                        <View style={[styles.strategyStepCard, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}>
                            <View style={[styles.strategyStepIcon, { backgroundColor: '#7B61FF' }]}>
                                <MaterialCommunityIcons name="bullseye" size={20} color="#fff" />
                            </View>
                            <Text style={[styles.stepTitle, { color: '#5B21B6' }]}>Month 1</Text>
                            <Text style={styles.stepTitle}>Testing & Data Collection</Text>
                            <Text style={[styles.stepText, { color: '#5B21B6' }]}>In the first month, we gather data and identify winning ad sets.</Text>
                        </View>

                        <View style={[styles.strategyStepCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                            <View style={[styles.strategyStepIcon, { backgroundColor: '#10B981' }]}>
                                <Ionicons name="bar-chart" size={20} color="#fff" />
                            </View>
                            <Text style={[styles.stepTitle, { color: '#065F46' }]}>Month 2</Text>
                            <Text style={styles.stepTitle}>Optimization & Cost Reduction</Text>
                            <Text style={[styles.stepText, { color: '#065F46' }]}>We refine our approach to lower your costs significantly.</Text>
                        </View>

                        <View style={[styles.strategyStepCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}>
                            <View style={[styles.strategyStepIcon, { backgroundColor: '#8B5CF6' }]}>
                                <Ionicons name="rocket" size={20} color="#fff" />
                            </View>
                            <Text style={[styles.stepTitle, { color: '#5B21B6' }]}>Month 3</Text>
                            <Text style={styles.stepTitle}>Scaling & Better Results</Text>
                            <Text style={[styles.stepText, { color: '#5B21B6' }]}>With a proven formula, we scale budgets for maximum ROI.</Text>
                        </View>
                    </View>

                    <View style={styles.commitmentFooter}>
                        <Ionicons name="information-circle" size={20} color="#7B61FF" />
                        <Text style={styles.commitmentFooterText}>
                            Running ads for a short time does not provide stable results. We focus on long-term and consistent growth.
                        </Text>
                    </View>
                </View>

                <View style={styles.whyChooseUsSection}>
                    <Text style={styles.whyChooseUsTitle}>WHY CHOOSE LEADITO AI</Text>
                    <View style={styles.whyChooseUsGrid}>
                        {WHY_CHOOSE_US.map((item, index) => (
                            <View key={index} style={styles.whyChooseCard}>
                                <View style={[styles.whyChooseIconContainer, { backgroundColor: item.color + '15' }]}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                                <View style={styles.whyChooseContent}>
                                    <Text style={styles.whyChooseItemTitle}>{item.title}</Text>
                                    <Text style={styles.whyChooseItemDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>


                {/* Final CTA Image Banner */}
                <TouchableOpacity style={styles.imageBannerContainer} onPress={handleWhatsApp} activeOpacity={0.9}>
                    <Image
                        source={require('../assessts/Plans.png')}
                        style={styles.fullImageBanner}
                        resizeMode="cover"
                    />
                    <View style={styles.imageTextOverlay}>
                        <Text style={styles.overlayTitle}>Ready to Grow Your Business?</Text>
                        <Text style={styles.overlaySubtitle}>Book a free call with our experts and find the perfect plan for you.</Text>
                    </View>
                </TouchableOpacity>

                <View style={{ height: 140 }} />
            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <View style={{ padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.footerNoteText}>Start Generating Leads for Your Business Today</Text>
                </View>
                <View style={styles.footerButtons}>
                    <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#7B61FF' }]} onPress={handleCall}>
                        <Ionicons name="call" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.footerBtnText}>Call Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.footerBtn, styles.whiteBtn]} onPress={handleWhatsApp}>
                        <FontAwesome5 name="whatsapp" size={18} color="#25D366" style={{ marginRight: 8 }} />
                        <Text style={[styles.footerBtnText, { color: '#1E293B' }]}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#7B61FF' }]} onPress={handleWhatsApp}>
                        <Ionicons name="calendar" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.footerBtnText}>Book Free Call</Text>
                    </TouchableOpacity>
                </View>
                {/* <View style={styles.footerNoteRow}>
                    <Ionicons name="lock-closed" size={12} color="#64748B" />
                    <Text style={styles.footerNoteText}>Secure. Cancel anytime. No hidden charges.</Text>
                </View> */}
            </View>
            {/* {renderManualPaymentModal()} */}
        </ScreenWrapper >
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
        fontSize: fontSize(14),
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
        backgroundColor: '#7B61FF',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: fontSize(20),
        fontWeight: 'bold',
        color: '#7B61FF',
    },
    logoSubtitle: {
        fontSize: fontSize(10),
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
        fontSize: fontSize(28),
        fontWeight: '900',
        color: '#2D1E4E',
        marginBottom: 8,
    },
    mainSubtitle: {
        fontSize: fontSize(16),
        color: '#334155',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 4,
    },
    subSubtitle: {
        fontSize: fontSize(13.5),
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
        fontSize: fontSize(14),
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
        width: (width - 24) / 3,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        justifyContent: 'flex-start',
    },
    popularPlanCard: {
        borderColor: '#7B61FF',
        borderWidth: 2,
        backgroundColor: '#F3E8FF',
        zIndex: 50,
        elevation: 10,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        left: 2,
        right: 2,
        backgroundColor: '#7B61FF',
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
        fontSize: fontSize(13),
        fontWeight: '900',
        color: '#2D1E4E',
        marginBottom: 4,
        marginTop: 6,
        textAlign: 'center',
    },
    planDesc: {
        fontSize: fontSize(9),
        color: '#64748B',
        lineHeight: 12,
        marginBottom: 10,
        textAlign: 'center',
        paddingHorizontal: 2,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 2,
    },
    currency: {
        fontSize: fontSize(9),
        fontWeight: 'bold',
        color: '#7B61FF',
    },
    price: {
        fontSize: fontSize(16),
        fontWeight: '900',
        color: '#1E1B4B',
    },
    period: {
        fontSize: fontSize(10),
        color: '#94A3B8',
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    planButton: {
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    normalButton: {
        backgroundColor: '#F3E8FF',
        borderWidth: 1,
        borderColor: '#E9D5FF',
    },
    popularButton: {
        backgroundColor: '#7B61FF',
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    planButtonText: {
        fontSize: fontSize(12),
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    normalButtonText: {
        color: '#7B61FF',
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
    metaDataContainer: {
        backgroundColor: '#F8FAFC',
        padding: 5,
        borderRadius: 8,
        marginBottom: 10,
        gap: 3,
        borderWidth: 0.5,
        borderColor: '#E2E8F0',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 7.5,
        color: '#475569',
        fontWeight: '700',
        lineHeight: 10,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 8.5,
        color: '#334155',
        fontWeight: '600',
        flex: 1,
        lineHeight: 12,
    },
    periodTextSmall: {
        fontSize: fontSize(10),
        color: '#64748B',
        fontWeight: 'bold',
    },
    monthlyBreakdown: {
        fontSize: fontSize(9),
        color: '#7B61FF',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    adBudgetBox: {
        backgroundColor: '#F1F5F9',
        padding: 4,
        borderRadius: 4,
        marginBottom: 8,
    },
    adBudgetText: {
        fontSize: 8,
        color: '#0F172A',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    includesLabelContainer: {
        marginBottom: 4,
    },
    includesLabel: {
        fontSize: fontSize(9),
        fontWeight: 'bold',
        color: '#1E293B',
        textDecorationLine: 'underline',
    },
    featureCheck: {
        fontSize: fontSize(10),
        color: '#10B981',
        marginRight: 4,
    },
    expectedLeadsContainer: {
        marginTop: 8,
        backgroundColor: '#F8FAFC',
        padding: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    expectedLeadsLabel: {
        fontSize: fontSize(9),
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    expectedLeadsValue: {
        fontSize: 8.5,
        color: '#7B61FF',
        fontWeight: '900',
    },
    featureTextDisabled: {
        color: '#94A3B8',
        textDecorationLine: 'line-through',
    },
    commitmentSection: {
        paddingHorizontal: 16,
        marginTop: 30,
    },
    commitmentMainTitle: {
        fontSize: fontSize(22),
        fontWeight: 'bold',
        color: '#2D1E4E',
        textAlign: 'center',
        marginBottom: 24,
    },
    strategyCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    strategyStepCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        paddingTop: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    monthNumber: {
        fontSize: fontSize(16),
        fontWeight: '900',
        color: '#1E293B',
    },
    strategyStepIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        position: 'absolute',
        top: -24,
        borderWidth: 4,
        borderColor: '#fff',
    },
    stepTitle: {
        fontSize: fontSize(14),
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 8,
    },
    stepText: {
        fontSize: fontSize(11),
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 16,
    },
    commitmentFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        gap: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    commitmentFooterText: {
        flex: 1,
        fontSize: fontSize(13),
        color: '#475569',
        fontWeight: '600',
        lineHeight: 18,
    },
    whyChooseUsSection: {
        marginTop: 40,
        paddingHorizontal: 16,
    },
    whyChooseUsTitle: {
        fontSize: fontSize(22),
        fontWeight: 'bold',
        color: '#2D1E4E',
        textAlign: 'center',
        marginBottom: 24,
    },
    whyChooseUsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    whyChooseCard: {
        width: (width - 44) / 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    whyChooseIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    whyChooseContent: {
        flex: 1,
    },
    whyChooseItemTitle: {
        fontSize: fontSize(14),
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    whyChooseItemDesc: {
        fontSize: fontSize(12),
        color: '#64748B',
        lineHeight: 16,
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
        fontSize: fontSize(18),
        fontWeight: '900',
        marginVertical: 4,
    },
    statLabel: {
        fontSize: fontSize(10),
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
        fontSize: fontSize(16),
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
        fontSize: fontSize(10),
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
    // Budget Impact Styles
    budgetImpactSection: {
        paddingHorizontal: 16,
        marginTop: 30,
        gap: 20,
    },
    budgetHeaderCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 3,
    },
    budgetHeaderGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    budgetMainTitle: {
        fontSize: fontSize(18),
        fontWeight: '900',
        color: '#fff',
        flex: 1,
        letterSpacing: 0.5,
    },
    budgetHeaderContent: {
        padding: 20,
        backgroundColor: '#F8FAFC',
        gap: 12,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    bulletText: {
        fontSize: fontSize(14),
        color: '#475569',
        fontWeight: '600',
        flex: 1,
    },
    understandingCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    subSectionTitle: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 15,
    },
    formulaRow: {
        gap: 15,
    },
    formulaItem: {
        backgroundColor: '#F1F5F9',
        padding: 15,
        borderRadius: 12,
    },
    formulaLabel: {
        fontSize: fontSize(13),
        fontWeight: 'bold',
        color: '#7C3AED',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    formulaResult: {
        fontSize: fontSize(14),
        color: '#334155',
        fontWeight: '700',
    },
    exampleSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    exampleCard: {
        gap: 12,
    },
    exampleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    exampleDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    exampleText: {
        fontSize: fontSize(14),
        color: '#475569',
        lineHeight: 20,
    },
    boldText: {
        fontWeight: '800',
        color: '#1E293B',
    },
    noteSection: {
        backgroundColor: '#FFFBEB',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    noteTitle: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#92400E',
    },
    noteContent: {
        gap: 8,
    },
    noteItemText: {
        fontSize: fontSize(14),
        color: '#92400E',
        fontWeight: '600',
        lineHeight: 20,
    },
    subNotes: {
        paddingLeft: 20,
        gap: 4,
    },
    subNoteText: {
        fontSize: fontSize(14),
        color: '#B45309',
        fontWeight: '500',
    },
    imageBannerContainer: {
        marginHorizontal: 16,
        marginTop: 10,
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
        fontSize: fontSize(18),
        fontWeight: '900',
        color: '#0D1B3E',
        width: '60%', // Constraint width to match the design where text is on the left
        marginBottom: 4,
    },
    overlaySubtitle: {
        fontSize: fontSize(11.5),
        color: '#334155',
        width: '55%',
        lineHeight: 18,
    },
    faqQuestion: {
        fontSize: fontSize(13),
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
        fontSize: fontSize(11),
        fontWeight: 'bold',
    },
    footerNoteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 6,
    },
    importantNotesSection: {
        marginTop: 30,
        paddingHorizontal: 20,
        backgroundColor: '#F8FAFC',
        paddingVertical: 24,
        marginHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    importantNotesTitle: {
        fontSize: fontSize(20),
        fontWeight: 'bold',
        color: '#0D1B3E',
        marginBottom: 20,
        textAlign: 'center',
    },
    notesList: {
        gap: 16,
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    noteText: {
        fontSize: fontSize(14),
        color: '#475569',
        fontWeight: '500',
        flex: 1,
    },
    importantNotesSectionInside: {
        marginTop: 20,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    importantNotesTitleSmall: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 15,
    },
    newNoteItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 12,
    },
    noteTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    newNoteTitle: {
        fontSize: fontSize(15),
        fontWeight: 'bold',
        color: '#1E293B',
    },
    newNoteDesc: {
        fontSize: fontSize(13),
        color: '#64748B',
        lineHeight: 20,
        paddingLeft: 30,
    },
    resultsDependContainer: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    noteItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    subNoteList: {
        paddingLeft: 32,
        gap: 8,
    },
    subNoteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    subNoteDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#7B61FF',
    },
    impNoteSubText: {
        fontSize: fontSize(12.5),
        color: '#64748B',
        fontWeight: '500',
    },
});

export default PlansPricingScreen;
