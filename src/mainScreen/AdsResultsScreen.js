import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import adsService from '../services/adsService';
import GlobalHeader from '../components/GlobalHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeCall, openWhatsApp, getContactNumberSync } from '../utils/contact';

const { width } = Dimensions.get('window');

const AdsResultsScreen = () => {
    const navigation = useNavigation();
    const [period, setPeriod] = useState('Monthly');
    const [platform, setPlatform] = useState('Facebook');
    const [loading, setLoading] = useState(true);
    const [allReports, setAllReports] = useState([]);
    const [reportIndex, setReportIndex] = useState(0);
    const [isDemo, setIsDemo] = useState(true);
    const [user, setUser] = useState(null);

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

    const handleSupportCall = () => makeCall(contactNumber);
    const handleSupportWhatsApp = () => openWhatsApp(contactNumber, "Hi, I'm looking at my Ads Results and need some assistance.");

    const reportData = allReports.length > 0 ? allReports[reportIndex] : null;

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await adsService.getAdsResults({
                platform: platform.toLowerCase(),
                type: period.toLowerCase()
            });

            setIsDemo(res.demo);
            if (res.demo) {
                setAllReports([]);
            } else {
                setAllReports(res.data || []);
                setReportIndex(0);
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
    }, [period, platform]);

    const stats = [
        { label: 'Active', count: reportData?.activeCount || 0, color: '#4CAF50', icon: 'circle' },
        { label: 'Published', count: reportData?.publishedCount || 0, color: '#2196F3', icon: 'circle' },
        { label: 'Issue', count: reportData?.issueCount || 0, color: '#FF9800', icon: 'circle' },
    ];

    const gridData = [
        { title: 'Ad Budget', value: reportData?.adBudget ? `₹${Number(reportData.adBudget).toLocaleString()}` : '₹0', icon: 'wallet-outline', color: '#EFF6FF', iconColor: '#2563EB' },
        { title: 'Leads', value: reportData?.leads || '0', icon: 'account-group-outline', color: '#ECFDF5', iconColor: '#10B981' },
        { title: 'Cost per Lead', value: reportData?.costPerLead ? `₹${reportData.costPerLead}` : '₹0', icon: 'trending-up', color: '#F5F3FF', iconColor: '#8B5CF6', isIonicons: true },
        { title: 'Closed Deals', value: reportData?.closedDeals || '0', icon: 'handshake-outline', color: '#FFF7ED', iconColor: '#F97316' },
        { title: 'Revenue', value: reportData?.revenue ? `₹${Number(reportData.revenue).toLocaleString()}` : '₹0', icon: 'cash-multiple', color: '#F0FDF4', iconColor: '#16A34A' },
        { title: 'ROI', value: reportData?.roi ? `${reportData.roi}%` : '0%', icon: 'target', iconType: 'MaterialCommunityIcons', color: '#FDF2F8', iconColor: '#DB2777' },
    ];

    return (
        <ScreenWrapper>
            <GlobalHeader onNotificationPress={() => console.log('Notification Pressed')} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.screenTitle}>Ads Results</Text>
                        <View style={styles.periodToggle}>
                            <TouchableOpacity
                                onPress={() => setPeriod('Monthly')}
                                style={[styles.periodBtn, period === 'Monthly' && styles.periodBtnActive]}
                            >
                                <Text style={[styles.periodBtnText, period === 'Monthly' && styles.periodBtnTextActive]}>Monthly</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPeriod('Weekly')}
                                style={[styles.periodBtn, period === 'Weekly' && styles.periodBtnActive]}
                            >
                                <Text style={[styles.periodBtnText, period === 'Weekly' && styles.periodBtnTextActive]}>Weekly</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Meta Info */}
                    <View style={styles.metaRow}>
                        <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" />
                        <Text style={styles.demoHeaderText}>You are viewing ads performance data</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{isDemo ? "Free User" : "Paid User"}</Text>
                        </View>
                    </View>

                    {/* Platform Toggle */}
                    <View style={styles.platformTabs}>
                        <TouchableOpacity
                            onPress={() => setPlatform('Facebook')}
                            style={[styles.platformBtn, platform === 'Facebook' && styles.platformBtnActive]}
                        >
                            <FontAwesome5 name="facebook" size={20} color={platform === 'Facebook' ? '#1877F2' : '#94A3B8'} />
                            <Text style={[styles.platformText, platform === 'Facebook' && styles.platformTextActive]}>Facebook Ads</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setPlatform('Instagram')}
                            style={[styles.platformBtn, platform === 'Instagram' && styles.platformBtnActive]}
                        >
                            <FontAwesome5 name="instagram" size={20} color={platform === 'Instagram' ? '#E4405F' : '#94A3B8'} />
                            <Text style={[styles.platformText, platform === 'Instagram' && styles.platformTextActive]}>Instagram Ads</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Report Selector (if multiple exist) */}
                    {!isDemo && allReports.length > 1 && (
                        <View style={styles.selectorRow}>
                            <Text style={styles.selectorLabel}>Select {period === 'Monthly' ? 'Month' : 'Week'}:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                                {allReports.map((report, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.selectorBtn, reportIndex === idx && styles.selectorBtnActive]}
                                        onPress={() => setReportIndex(idx)}
                                    >
                                        <Text style={[styles.selectorBtnText, reportIndex === idx && styles.selectorBtnTextActive]}>
                                            {period === 'Monthly' ? report.month : `Week ${report.weekNumber} (${report.month})`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Stats Summary Row */}
                    <View style={styles.statsRow}>
                        {stats.map((item, index) => (
                            <View key={index} style={styles.statChip}>
                                <View style={styles.statChipLeft}>
                                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                                    <Text style={styles.statLabel}>{item.label}</Text>
                                </View>
                                <View style={styles.countPill}>
                                    <Text style={styles.statCount}>{item.count}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Data Grid */}
                    {loading ? (
                        <View style={{ height: 300, justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color="#2563EB" />
                        </View>
                    ) : (isDemo || !reportData) ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="chart-line-variant" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>{isDemo ? "Upgrade to view your Ads Performance" : "No reports published for this period yet."}</Text>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.grid}>
                                {(isDemo ? [
                                    { title: 'Ad Budget', value: '₹50,000', icon: 'wallet-outline', color: '#EFF6FF', iconColor: '#2563EB' },
                                    { title: 'Leads', value: '2,350', icon: 'account-group-outline', color: '#ECFDF5', iconColor: '#10B981' },
                                    { title: 'Cost per Lead', value: '₹21.28', icon: 'trending-up', color: '#F5F3FF', iconColor: '#8B5CF6', isIonicons: true },
                                    { title: 'Closed Deals', value: '156', icon: 'handshake-outline', color: '#FFF7ED', iconColor: '#F97316' },
                                    { title: 'Revenue', value: '₹3,12,000', icon: 'cash-multiple', color: '#F0FDF4', iconColor: '#16A34A' },
                                    { title: 'ROI', value: '524%', icon: 'target', iconType: 'MaterialCommunityIcons', color: '#FDF2F8', iconColor: '#DB2777' },
                                ] : gridData).map((item, index) => (
                                    <View key={index} style={styles.card}>
                                        <View style={[styles.cardIconContainer, { backgroundColor: item.color }]}>
                                            {item.isIonicons ? (
                                                <Ionicons name={item.icon} size={22} color={item.iconColor} />
                                            ) : (
                                                <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
                                            )}
                                        </View>
                                        <View style={styles.cardContent}>
                                            <View style={styles.titleRow}>
                                                <Text style={styles.cardTitle}>{item.title}</Text>
                                                {!isDemo && item.title === 'Leads' && reportData?.weekNumber && (
                                                    <View style={styles.weekBadge}>
                                                        <Text style={styles.weekBadgeText}>W{reportData.weekNumber}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.valueRow}>
                                                <Text style={styles.cardValue}>{item.value}</Text>
                                                {isDemo && <Ionicons name="lock-closed-outline" size={18} color="#CBD5E1" style={{ marginLeft: 8 }} />}
                                            </View>
                                            <Text style={styles.demoSubtext}>{isDemo ? "Demo Data" : "Real Performance"}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Admin Notes Section */}
                            {!isDemo && reportData?.notes && Array.isArray(reportData.notes) && reportData.notes.length > 0 && (
                                <View style={styles.notesContainer}>
                                    <View style={styles.notesHeader}>
                                        <MaterialCommunityIcons name="note-text-outline" size={20} color="#2563EB" />
                                        <Text style={styles.notesTitle}>Admin Notes & Insights</Text>
                                    </View>
                                    {reportData.notes.map((note, idx) => (
                                        <View key={idx} style={styles.noteItem}>
                                            <View style={styles.noteDot} />
                                            <Text style={styles.noteText}>{note}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Upgrade Card */}
                    <TouchableOpacity style={styles.upgradeCard}>
                        <View style={styles.upgradeCardLeft}>
                            <View style={styles.upgradeIconContainer}>
                                <Ionicons name="lock-closed" size={24} color="#2563EB" />
                            </View>
                            <View style={styles.upgradeTextContainer}>
                                <Text style={styles.upgradeTitle}>Unlock Full Access</Text>
                                <Text style={styles.upgradeSubtitle}>Upgrade your plan to view real data, advanced reports, and more insights.</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.viewPlansBtn}
                            onPress={() => navigation.navigate('Plans & Pricing')}
                        >
                            <Text style={styles.viewPlansText}>View Plans</Text>
                            <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    {/* Support Card */}
                    <View style={styles.supportCard}>
                        <View style={styles.supportCardLeft}>
                            <View style={styles.supportIconContainer}>
                                <MaterialCommunityIcons name="headset" size={24} color="#10B981" />
                            </View>
                            <View style={styles.supportTextContainer}>
                                <Text style={styles.supportTitle}>Need Help?</Text>
                                <Text style={styles.supportSubtitle}>Our support team is here to help you.</Text>
                            </View>
                        </View>
                        <View style={styles.supportButtons}>
                            <TouchableOpacity style={styles.supportBtn} onPress={handleSupportWhatsApp}>
                                <FontAwesome5 name="whatsapp" size={18} color="#10B981" />
                                <Text style={[styles.supportBtnText, { color: '#0F172A' }]}>WhatsApp</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.supportBtn} onPress={handleSupportCall}>
                                <Ionicons name="call" size={16} color="#2563EB" />
                                <Text style={[styles.supportBtnText, { color: '#0F172A' }]}>Call Us</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{ height: 20 }} />
            </ScrollView>
        </ScreenWrapper >
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
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0047AB',
    },
    logoSubtitle: {
        fontSize: 10,
        color: '#64748B',
        marginTop: -4,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    screenTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#0D1B3E',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 6,
    },
    demoHeaderText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    badge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        color: '#2563EB',
        fontWeight: '700',
    },
    periodToggle: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 3,
    },
    periodBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
    },
    periodBtnActive: {
        backgroundColor: '#2563EB',
    },
    periodBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    periodBtnTextActive: {
        color: '#fff',
    },
    platformTabs: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    platformBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
        gap: 8,
    },
    platformBtnActive: {
        borderColor: '#2563EB',
        borderWidth: 1,
        backgroundColor: '#fff',
    },
    platformText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    platformTextActive: {
        color: '#0F172A',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    statChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statChipLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    countPill: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    statCount: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '700',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        width: (width - 52) / 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    cardIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748B',
        marginBottom: 2,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0D1B3E',
    },
    demoSubtext: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    upgradeCard: {
        marginTop: 20,
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    upgradeCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    upgradeIconContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#DBEAFE',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    upgradeTextContainer: {
        flex: 1,
    },
    upgradeTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0D1B3E',
        marginBottom: 1,
    },
    upgradeSubtitle: {
        fontSize: 11,
        color: '#64748B',
        lineHeight: 14,
        fontWeight: '500',
    },
    viewPlansBtn: {
        backgroundColor: '#2563EB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    viewPlansText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    supportCard: {
        marginTop: 10,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 10,
    },
    supportCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    supportIconContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#ECFDF5',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    supportTextContainer: {
        flex: 1,
    },
    supportTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0D1B3E',
        marginBottom: 1,
    },
    supportSubtitle: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    supportButtons: {
        flexDirection: 'row',
        gap: 6,
    },
    supportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 4,
    },
    supportBtnText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    emptyState: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
    },
    selectorRow: {
        marginBottom: 20,
    },
    selectorLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0D1B3E',
        marginBottom: 10,
    },
    selectorScroll: {
        flexDirection: 'row',
    },
    selectorBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectorBtnActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    selectorBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    selectorBtnTextActive: {
        color: '#fff',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    weekBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    weekBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#475569',
    },
    notesContainer: {
        marginTop: 25,
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 15,
    },
    notesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0D1B3E',
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    noteDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2563EB',
        marginTop: 6,
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        color: '#475569',
        lineHeight: 20,
    },
});

export default AdsResultsScreen;
