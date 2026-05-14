import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import adsService from '../services/adsService';
import GlobalHeader from '../components/GlobalHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeCall, openWhatsApp, getContactInfo, getCallNumberSync, getWhatsAppNumberSync } from '../utils/contact';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionGuard from '../components/SubscriptionGuard';

const { width } = Dimensions.get('window');

const AdsResultsScreen = () => {
    const { isActive } = useSubscription();
    const navigation = useNavigation();
    const [period, setPeriod] = useState('Monthly');
    const [platform, setPlatform] = useState('Meta'); // Set 'Meta' as default if preferred, or keep Facebook. User said "Monthly View (default)" but didn't specify platform default. I'll stick to 'Meta' as it's the combined view.
    const [loading, setLoading] = useState(true);
    const [allReports, setAllReports] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Selection state
    const [isDemo, setIsDemo] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(''); // e.g. "2024-04"
    const [selectedWeek, setSelectedWeek] = useState(null); // e.g. 1
    const [monthPickerVisible, setMonthPickerVisible] = useState(false);

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

    const handleSupportCall = () => {
        const num = getCallNumberSync(user);
        makeCall(num);
    };

    const handleSupportWhatsApp = () => {
        const num = getWhatsAppNumberSync(user);
        openWhatsApp(num, "Hi, I'm looking at my Ads Results and need some assistance.");
    };

    const fetchResults = async () => {
        setLoading(true);
        try {
            // Map 'Meta' UI selection to 'meta' platform in DB
            const apiPlatform = platform === 'Meta' ? 'meta' : platform.toLowerCase();

            const res = await adsService.getAdsResults({
                platform: apiPlatform
            });

            setIsDemo(res.demo);
            const data = res.data || [];
            setAllReports(data);

            // Auto-select latest month and its report
            if (data.length > 0) {
                const latestReport = data[0];
                setSelectedMonth(latestReport.month);
                if (latestReport.reportType === 'weekly') {
                    setPeriod('Weekly');
                    setSelectedWeek(latestReport.weekNumber || 1);
                } else {
                    setPeriod('Monthly');
                    setSelectedWeek(null);
                }
            } else {
                // Clear filters if no data
                setSelectedMonth(null);
                setSelectedWeek(null);
                setPeriod('Monthly');
            }
        } catch (error) {
            console.error('Fetch ads results error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
        loadUser();
    }, [platform, isActive]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadUser(), fetchResults()]);
        setRefreshing(false);
    };

    // Derived Data Logic
    const SAMPLE_REPORT = {
        month: '2024-05',
        reportType: 'monthly',
        campaignStatus: 'active',
        adBudget: 15000,
        leads: 128,
        costPerLead: 117,
        closedDeals: 14,
        closedRatio: 10.9,
        revenue: 85000,
        roi: 466,
        notes: [
            "Campaign is performing 24% above industry average.",
            "Maximum engagement detected from Meta Instagram Feed.",
            "Higher conversion rate noted in 25-34 age demographic."
        ]
    };

    const monthsWithData = Array.from(new Set(allReports.map(r => r.month))).sort().reverse();

    const availableWeeks = allReports
        .filter(r => r.month === selectedMonth && r.reportType === 'weekly')
        .map(r => r.weekNumber)
        .sort((a, b) => a - b);

    const reportData = isDemo ? SAMPLE_REPORT : allReports.find(r => {
        if (r.month !== selectedMonth) return false;
        if (period === 'Monthly') return r.reportType === 'monthly';
        return r.reportType === 'weekly' && r.weekNumber === selectedWeek;
    });

    const formatMonth = (m) => {
        if (!m) return 'Select Month';
        const [year, month] = m.split('-');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    const handleWeeklyToggle = () => {
        const weeksForMonth = allReports
            .filter(r => r.month === selectedMonth && r.reportType === 'weekly')
            .map(r => r.weekNumber);

        if (weeksForMonth.length > 0) {
            setPeriod('Weekly');
            if (!selectedWeek || !weeksForMonth.includes(selectedWeek)) {
                setSelectedWeek(Math.max(...weeksForMonth));
            }
        } else {
            Alert.alert('Notice', 'Weekly reports are not available for this month.');
        }
    };

    const handleMonthSelect = (m) => {
        setSelectedMonth(m);
        setMonthPickerVisible(false);

        // Check availability for weeks in new month
        const weeksForMonth = allReports
            .filter(r => r.month === m && r.reportType === 'weekly')
            .map(r => r.weekNumber);

        if (period === 'Weekly') {
            if (weeksForMonth.length > 0) {
                // Keep weekly mode and update to nearest valid week
                setSelectedWeek(Math.max(...weeksForMonth));
            } else {
                // No weekly data for new month, fallback to monthly
                setPeriod('Monthly');
                setSelectedWeek(null);
            }
        } else {
            // Monthly mode, just reset week
            setSelectedWeek(null);
        }
    };

    const gridData = [
        { title: 'Ad Budget', value: reportData?.adBudget ? `₹${Number(reportData.adBudget).toLocaleString()}` : '₹0', icon: 'wallet-outline', color: '#F3E8FF', iconColor: '#7B61FF' },
        { title: 'Leads', value: reportData?.leads ? Number(reportData.leads).toLocaleString() : '0', icon: 'account-group-outline', color: '#ECFDF5', iconColor: '#10B981' },
        { title: 'Cost per Lead', value: reportData?.costPerLead ? `₹${Number(reportData.costPerLead).toLocaleString()}` : '₹0', icon: 'trending-up', color: '#F3E8FF', iconColor: '#9F7AEA', isIonicons: true },
        { title: 'Closed Deals', value: reportData?.closedDeals ? Number(reportData.closedDeals).toLocaleString() : '0', icon: 'handshake-outline', color: '#FFF7ED', iconColor: '#F97316' },
        { title: 'Closing Percentage', value: reportData?.closedRatio ? `${reportData.closedRatio}%` : (reportData?.leads && reportData?.closedDeals ? `${((reportData.closedDeals / reportData.leads) * 100).toFixed(1)}%` : '0%'), icon: 'percent', color: '#EEF2FF', iconColor: '#6366F1', isFeather: true, subtext: 'From the Leads' },
        { title: 'Revenue', value: reportData?.revenue ? `₹${Number(reportData.revenue).toLocaleString()}` : '₹0', icon: 'cash-multiple', color: '#F0FDF4', iconColor: '#16A34A' },
        { title: 'ROI', value: reportData?.roi ? `${Number(reportData.roi)}%` : '0%', icon: 'target', color: '#FDF2F8', iconColor: '#DB2777' },
    ];

    return (
        <ScreenWrapper statusBarColor="#fff" barStyle="dark-content" bottomSafe={false}>
            <GlobalHeader
                showSupport={false}
                onNotificationPress={() => navigation.navigate('Notifications')}
            />


            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7B61FF']} tintColor="#7B61FF" />}
            >
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.screenTitle}>Ads Results</Text>
                        {/* Monthly / Weekly toggle — header level */}
                        <View style={styles.headerToggle}>
                            <TouchableOpacity
                                style={[styles.headerToggleBtn, period === 'Monthly' && styles.headerToggleBtnActive]}
                                onPress={() => setPeriod('Monthly')}
                            >
                                <Text style={[styles.headerToggleText, period === 'Monthly' && styles.headerToggleTextActive]}>Monthly</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.headerToggleBtn, period === 'Weekly' && styles.headerToggleBtnActive]}
                                onPress={() => handleWeeklyToggle()}
                            >
                                <Text style={[styles.headerToggleText, period === 'Weekly' && styles.headerToggleTextActive]}>Weekly</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Platform Selector - Simplified to One line */}
                    <View style={styles.singlePlatformContainer}>
                        <View style={styles.singlePlatformIconBox}>
                            <MaterialCommunityIcons name="infinity" size={24} color="#0668E1" />
                        </View>
                        <View>
                            <Text style={styles.singlePlatformTitle}>Facebook & Instagram Ads ( Meta Ads )</Text>
                            {/* <Text style={styles.singlePlatformSub}>Facebook & Instagram (Combined View)</Text> */}
                        </View>
                    </View>

                    {/* Hierarchical Filter System */}
                    {!isDemo && allReports.length > 0 && (
                        <View style={styles.filterCard}>
                            <View style={styles.filterRow}>
                                <View style={styles.filterGroup}>
                                    <Text style={styles.filterLabel}>Month</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownTrigger}
                                        onPress={() => setMonthPickerVisible(true)}
                                    >
                                        <Text style={styles.dropdownValue}>{formatMonth(selectedMonth)}</Text>
                                        <Ionicons name="chevron-down" size={16} color="#7405CB" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {period === 'Weekly' && availableWeeks.length > 0 && (
                                <View style={styles.weekSelectorBox}>
                                    <Text style={styles.weekLabel}>Select Week:</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {availableWeeks.map((weekNum) => (
                                            <TouchableOpacity
                                                key={weekNum}
                                                style={[styles.weekChip, selectedWeek === weekNum && styles.weekChipActive]}
                                                onPress={() => setSelectedWeek(weekNum)}
                                            >
                                                <Text style={[styles.weekChipText, selectedWeek === weekNum && styles.weekChipTextActive]}>Week {weekNum}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Ad Status Bar - High Highlight */}
                    {!loading && reportData && reportData.campaignStatus && (
                        <View style={[
                            styles.statusBarContainer,
                            {
                                backgroundColor:
                                    (reportData.campaignStatus === 'issue' || reportData.campaignStatus === 'Issue ⚠️') ? '#FEF2F2' :
                                        (reportData.campaignStatus === 'active' || reportData.campaignStatus === 'Active ✅') ? '#ECFDF5' :
                                            (reportData.campaignStatus === 'published' || reportData.campaignStatus === 'Published 🚀') ? '#EFF6FF' :
                                                (reportData.campaignStatus === 'budget_low' || reportData.campaignStatus === 'Budget Low ⚠️') ? '#FFF7ED' : '#F8FAFC',
                                borderColor:
                                    (reportData.campaignStatus === 'issue' || reportData.campaignStatus === 'Issue ⚠️') ? '#FEE2E2' :
                                        (reportData.campaignStatus === 'active' || reportData.campaignStatus === 'Active ✅') ? '#D1FAE5' :
                                            (reportData.campaignStatus === 'published' || reportData.campaignStatus === 'Published 🚀') ? '#DBEAFE' :
                                                (reportData.campaignStatus === 'budget_low' || reportData.campaignStatus === 'Budget Low ⚠️') ? '#FFEDD5' : '#F1F5F9',
                            }
                        ]}>
                            <View style={styles.statusMain}>
                                <Ionicons
                                    name={
                                        (reportData.campaignStatus === 'issue' || reportData.campaignStatus === 'Issue ⚠️') ? 'warning' :
                                            (reportData.campaignStatus === 'active' || reportData.campaignStatus === 'Active ✅') ? 'checkmark-circle' :
                                                (reportData.campaignStatus === 'budget_low' || reportData.campaignStatus === 'Budget Low ⚠️') ? 'alert-circle' :
                                                    (reportData.campaignStatus === 'paused' || reportData.campaignStatus === 'Campaign Paused ⏸️') ? 'pause-circle' : 'rocket'
                                    }
                                    size={20}
                                    color={
                                        (reportData.campaignStatus === 'issue' || reportData.campaignStatus === 'Issue ⚠️') ? '#EF4444' :
                                            (reportData.campaignStatus === 'active' || reportData.campaignStatus === 'Active ✅') ? '#10B981' :
                                                (reportData.campaignStatus === 'budget_low' || reportData.campaignStatus === 'Budget Low ⚠️') ? '#F97316' :
                                                    (reportData.campaignStatus === 'paused' || reportData.campaignStatus === 'Campaign Paused ⏸️') ? '#64748B' : '#3B82F6'
                                    }
                                />
                                <Text style={[
                                    styles.statusMainTitle,
                                    {
                                        color:
                                            (reportData.campaignStatus === 'issue' || reportData.campaignStatus === 'Issue ⚠️') ? '#991B1B' :
                                                (reportData.campaignStatus === 'active' || reportData.campaignStatus === 'Active ✅') ? '#065F46' :
                                                    (reportData.campaignStatus === 'published' || reportData.campaignStatus === 'Published 🚀') ? '#1E40AF' :
                                                        (reportData.campaignStatus === 'budget_low' || reportData.campaignStatus === 'Budget Low ⚠️') ? '#9A3412' : '#334155'
                                    }
                                ]}>
                                    {
                                        (reportData.campaignStatus === 'issue' || reportData.campaignStatus === 'Issue') ? 'Issue' :
                                            (reportData.campaignStatus === 'active' || reportData.campaignStatus === 'Active') ? 'Active' :
                                                (reportData.campaignStatus === 'budget_low' || reportData.campaignStatus === 'Budget Low') ? 'Budget Low' :
                                                    (reportData.campaignStatus === 'paused' || reportData.campaignStatus === 'Campaign Paused') ? 'Campaign Paused' : 'Published'
                                    }
                                </Text>
                            </View>
                            {/* {reportData.paymentStatus && (
                                <View style={styles.paymentRow}>
                                    <View style={[
                                        styles.paymentBadge,
                                        { backgroundColor: reportData.paymentStatus === 'paid' ? '#D1FAE5' : '#FFEDD5' }
                                    ]}>
                                        <MaterialCommunityIcons
                                            name={reportData.paymentStatus === 'paid' ? 'cash-check' : 'cash-clock'}
                                            size={12}
                                            color={reportData.paymentStatus === 'paid' ? '#065F46' : '#92400E'}
                                        />
                                        <Text style={[
                                            styles.paymentBadgeText,
                                            { color: reportData.paymentStatus === 'paid' ? '#065F46' : '#92400E' }
                                        ]}>
                                            Payment: {reportData.paymentStatus.charAt(0).toUpperCase() + reportData.paymentStatus.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                            )} */}
                        </View>
                    )}

                    {/* Data Grid */}
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#7405CB" />
                        </View>
                    ) : (!reportData) ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="chart-line-variant" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No reports published for this filter yet.</Text>
                        </View>
                    ) : (
                        <View>
                            <SubscriptionGuard
                                message="Results Locked"
                                subMessage="Upgrade to view your detailed ad performance, ROIs, and expert strategy notes."
                                disabled={isDemo}
                            >
                                <View style={styles.grid}>
                                    {gridData.map((item, index) => (
                                        <View key={index} style={styles.card}>
                                            <View style={[styles.cardIconContainer, { backgroundColor: item.color }]}>
                                                {item.isIonicons ? (
                                                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                                                ) : item.isFeather ? (
                                                    <Feather name={item.icon} size={22} color={item.iconColor} />
                                                ) : (
                                                    <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
                                                )}
                                            </View>
                                            <View style={styles.cardContent}>
                                                <Text style={styles.cardTitle}>{item.title}</Text>
                                                <View style={styles.valueRow}>
                                                    <Text style={styles.cardValue}>{item.value}</Text>
                                                    {isDemo && <Ionicons name="lock-closed-outline" size={16} color="#CBD5E1" style={{ marginLeft: 6 }} />}
                                                </View>
                                                <Text style={styles.demoSubtext}>{item.subtext || (isDemo ? "Sample Data" : "Real Performance")}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Notes Section */}
                                {reportData.notes && Array.isArray(reportData.notes) && reportData.notes.length > 0 && (
                                    <View style={styles.notesContainer}>
                                        <View style={styles.notesHeader}>
                                            <MaterialCommunityIcons name="note-text-outline" size={20} color="#7405CB" />
                                            <Text style={styles.notesTitle}>Strategy & Observations</Text>
                                        </View>
                                        {reportData.notes.map((note, idx) => (
                                            <View key={idx} style={styles.noteItem}>
                                                <View style={styles.noteDot} />
                                                <Text style={styles.noteText}>{note}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </SubscriptionGuard>

                            {/* Support CTA Section */}
                            <View style={styles.supportCard}>
                                <View style={styles.supportHeaderMain}>
                                    <View style={styles.supportIconContainer}>
                                        <MaterialCommunityIcons name="headset-mic" size={26} color="#7405CB" />
                                    </View>
                                    <View style={styles.supportTextContainer}>
                                        <Text style={styles.supportHeadline}>Expert Ads Assistance</Text>
                                        <Text style={styles.supportSubheadline}>Talk to our {getContactInfo(user).TEAM}</Text>
                                    </View>
                                </View>
                                <View style={styles.supportActionRow}>
                                    <TouchableOpacity style={[styles.supportActionBtn, { backgroundColor: '#7405CB' }]} onPress={handleSupportCall}>
                                        <Ionicons name="call" size={18} color="#fff" />
                                        <Text style={styles.supportActionText}>Call {getContactInfo(user).TEAM.split(' ')[0]}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.supportActionBtn, { backgroundColor: '#10B981' }]} onPress={handleSupportWhatsApp}>
                                        <FontAwesome5 name="whatsapp" size={18} color="#fff" />
                                        <Text style={styles.supportActionText}>WhatsApp</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Upgrade Card */}
                            {isDemo && (
                                <TouchableOpacity style={styles.upgradeCard} onPress={() => navigation.navigate('Plans')}>
                                    <View style={styles.upgradeContent}>
                                        <View style={styles.upgradeIcon}>
                                            <Ionicons name="rocket-outline" size={24} color="#fff" />
                                        </View>
                                        <View style={styles.upgradeText}>
                                            <Text style={styles.upgradeTitle}>Unlock Professional Reports</Text>
                                            <Text style={styles.upgradeSubtitle}>Get full access to all insights and ad performance history.</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#7405CB" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
                <View style={{ height: 20 }} />
            </ScrollView>

            <Modal visible={monthPickerVisible} transparent={true} animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMonthPickerVisible(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Month</Text>
                            <TouchableOpacity onPress={() => setMonthPickerVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.monthList}>
                            {monthsWithData.map((m) => (
                                <TouchableOpacity key={m} style={[styles.monthItem, selectedMonth === m && styles.monthItemActive]} onPress={() => handleMonthSelect(m)}>
                                    <Text style={[styles.monthItemText, selectedMonth === m && styles.monthItemTextActive]}>{formatMonth(m)}</Text>
                                    {selectedMonth === m && <Ionicons name="checkmark-sharp" size={20} color="#7405CB" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    headerToggle: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        padding: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    headerToggleBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 17,
    },
    headerToggleBtnActive: {
        backgroundColor: '#7405CB',
        shadowColor: '#7405CB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    headerToggleText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    headerToggleTextActive: {
        color: '#fff',
    },
    singlePlatformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 15,
    },
    singlePlatformIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    singlePlatformTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    singlePlatformSub: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 2,
    },
    filterCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
    },
    filterGroup: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dropdownValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    verticalDivider: {
        width: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 15,
    },
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 6,
    },
    typeBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    typeBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    typeBtnTextActive: {
        color: '#7B61FF',
        fontWeight: 'bold',
    },
    weekSelectorBox: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    weekLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 10,
    },
    weekChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    weekChipActive: {
        backgroundColor: '#7B61FF',
        borderColor: '#7B61FF',
    },
    weekChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    weekChipTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusBarContainer: {
        marginBottom: 20,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statusMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusMainTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    paymentRow: {
        marginTop: 10,
        flexDirection: 'row',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    paymentBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    loaderContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginTop: 20,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    card: {
        width: (width - 55) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardContent: {
        gap: 2,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardValue: {
        fontSize: fontSize(20),
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    demoSubtext: {
        fontSize: fontSize(10),
        color: '#94A3B8',
        fontWeight: '700',
        marginTop: 2,
    },
    notesContainer: {
        marginTop: verticalScale(25),
        backgroundColor: '#F8FAFC',
        padding: moderateScale(20),
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: verticalScale(15),
    },
    notesTitle: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: verticalScale(10),
    },
    noteDot: {
        width: scale(6),
        height: scale(6),
        borderRadius: 3,
        backgroundColor: '#7B61FF',
        marginTop: 6,
    },
    noteText: {
        flex: 1,
        fontSize: fontSize(13),
        color: '#475569',
        lineHeight: fontSize(20),
    },
    supportCard: {
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: moderateScale(20),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    supportHeaderMain: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
        gap: 15,
    },
    supportIconContainer: {
        width: scale(52),
        height: scale(52),
        backgroundColor: '#F3E8FF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    supportTextContainer: {
        flex: 1,
    },
    supportHeadline: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 2,
    },
    supportSubheadline: {
        fontSize: fontSize(13),
        color: '#64748B',
        fontWeight: '600',
    },
    supportActionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    supportActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(14),
        borderRadius: 14,
        gap: 8,
    },
    supportActionText: {
        color: '#fff',
        fontSize: fontSize(14),
        fontWeight: 'bold',
    },
    upgradeCard: {
        marginTop: 30,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        shadowColor: '#7405CB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    upgradeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
    },
    upgradeIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#7405CB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    upgradeText: {
        flex: 1,
    },
    upgradeTitle: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 2,
    },
    upgradeSubtitle: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0D1B3E',
    },
    monthList: {
        paddingHorizontal: 20,
    },
    monthItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    monthItemActive: {
        backgroundColor: '#F4E8FC',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginHorizontal: -15,
    },
    monthItemText: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    monthItemTextActive: {
        color: '#7405CB',
        fontWeight: 'bold',
    },
});

export default AdsResultsScreen;
