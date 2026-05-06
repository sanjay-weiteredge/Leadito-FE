import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import userService from '../services/userService';
import ScreenWrapper from '../components/ScreenWrapper';

const PlanDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile();
            setUser(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#7B61FF" />
            </View>
        );
    }

    const activeSub = user?.subscriptions?.[0];
    const isActive = user?.isActive;
    const plan = activeSub?.plan;

    const planName = plan?.name || (isActive ? 'Premium Plan' : 'Free Plan');
    const planPrice = plan?.price != null ? `₹${plan.price.toLocaleString('en-IN')}` : null;
    const planDuration = plan?.durationDays ? `${plan.durationDays} days` : null;
    const planDescription = plan?.description || null;
    const planFeatures = plan?.features || null;
    const adBudget = plan?.adBudget || null;
    const expectedLeads = plan?.expectedLeads || null;

    const startDate = activeSub?.startDate
        ? new Date(activeSub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'N/A';
    const expiryDate = activeSub?.expiryDate
        ? new Date(activeSub.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'N/A';

    // Days remaining
    const daysRemaining = activeSub?.expiryDate
        ? Math.max(0, Math.ceil((new Date(activeSub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)))
        : null;

    return (
        <ScreenWrapper statusBarColor="#7B61FF">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Plan Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7B61FF']} tintColor="#7B61FF" />}
                >

                    {/* Plan Card */}
                    <View style={[styles.card, isActive ? styles.growthCard : styles.freeCard]}>
                        <View style={styles.planHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.planLabel}>Current Plan</Text>
                                <Text style={styles.planNameText}>{planName}</Text>
                                {planPrice && (
                                    <Text style={styles.planPriceText}>{planPrice}{planDuration ? ` / ${planDuration}` : ''}</Text>
                                )}
                            </View>
                            <View style={[styles.badge, !isActive && styles.freeBadge]}>
                                <Text style={[styles.badgeText, !isActive && { color: '#64748B' }]}>
                                    {isActive ? 'Active' : 'Free'}
                                </Text>
                            </View>
                        </View>

                        {planDescription && (
                            <Text style={styles.planDescription}>{planDescription}</Text>
                        )}

                        <View style={styles.divider} />

                        {/* Status */}
                        <View style={styles.detailRow}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name="shield-check-outline" size={20} color="#7B61FF" />
                            </View>
                            <View style={styles.detailTextContainer}>
                                <Text style={styles.detailLabel}>Status</Text>
                                <Text style={[styles.detailValue, { color: isActive ? '#10B981' : '#F59E0B' }]}>
                                    {isActive ? 'Active & Running' : 'No Active Subscription'}
                                </Text>
                            </View>
                        </View>

                        {/* Start Date — only for active subs */}
                        {isActive && (
                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <Feather name="calendar" size={18} color="#7B61FF" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Start Date</Text>
                                    <Text style={styles.detailValue}>{startDate}</Text>
                                </View>
                            </View>
                        )}

                        {/* Expiry Date — only for active subs */}
                        {isActive && (
                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons name="calendar-clock" size={20} color="#7B61FF" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Expiry Date</Text>
                                    <Text style={styles.detailValue}>{expiryDate}</Text>
                                </View>
                            </View>
                        )}

                        {/* Days Remaining */}
                        {isActive && daysRemaining !== null && (
                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons name="timer-sand" size={20} color={daysRemaining <= 7 ? '#EF4444' : '#7B61FF'} />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Days Remaining</Text>
                                    <Text style={[styles.detailValue, { color: daysRemaining <= 7 ? '#EF4444' : '#10B981' }]}>
                                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Ad Budget */}
                        {isActive && adBudget && (
                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="wallet-outline" size={18} color="#7B61FF" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Monthly Ad Budget</Text>
                                    <Text style={styles.detailValue}>{adBudget}</Text>
                                </View>
                            </View>
                        )}

                        {/* Expected Leads */}
                        {isActive && expectedLeads && (
                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="people-outline" size={18} color="#7B61FF" />
                                </View>
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>Expected Leads</Text>
                                    <Text style={styles.detailValue}>{expectedLeads}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Plan Features */}
                    {isActive && planFeatures && Array.isArray(planFeatures) && planFeatures.length > 0 && (
                        <View style={styles.featuresCard}>
                            <Text style={styles.featuresTitle}>Plan Includes</Text>
                            {planFeatures.map((feature, index) => {
                                const featureText = typeof feature === 'string' ? feature : feature.text;
                                const isIncluded = typeof feature === 'string' ? true : (feature.included !== undefined ? feature.included : feature.isAvailable);

                                if (!isIncluded) return null;

                                return (
                                    <View key={index} style={styles.featureRow}>
                                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                        <Text style={styles.featureText}>{featureText}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Info box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#64748B" />
                        <Text style={styles.infoText}>
                            {isActive
                                ? 'Your plan is managed by the system administrator. For any changes or issues, please contact support.'
                                : 'You are currently on the Free Plan. Upgrade to unlock leads management, ad performance tracking, and more.'}
                        </Text>
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        style={styles.upgradeBtn}
                        onPress={() => navigation.navigate('Main', { screen: 'Plans' })}
                    >
                        <Text style={styles.upgradeBtnText}>{isActive ? 'Renew / Upgrade Plan' : 'Upgrade to Paid Plan'}</Text>
                        <Feather name="arrow-right" size={18} color="#fff" />
                    </TouchableOpacity>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#7B61FF',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    growthCard: {
        backgroundColor: '#F3E8FF',
        borderColor: '#7B61FF',
        borderWidth: 2,
    },
    freeCard: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    freeBadge: {
        backgroundColor: '#F1F5F9',
    },
    planPriceText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#7B61FF',
        marginTop: 4,
    },
    planDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 4,
    },
    featuresCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E9D5FF',
    },
    featuresTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D1E4E',
        marginBottom: 14,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    featureText: {
        fontSize: 14,
        color: '#334155',
        flex: 1,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    planNameText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    badge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
        alignItems: 'flex-start',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
    },
    upgradeBtn: {
        backgroundColor: '#7B61FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 40,
        marginBottom: 30,
        gap: 10,
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    upgradeBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PlanDetailsScreen;
