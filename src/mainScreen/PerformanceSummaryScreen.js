import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import leadService from '../services/leadService';
import ScreenWrapper from '../components/ScreenWrapper';

const { width } = Dimensions.get('window');

const PerformanceSummaryScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLeads: 0,
        closedDeals: 0,
        conversionRate: 0,
    });
    const [refreshing, setRefreshing] = useState(false);

    const fetchPerformanceData = async () => {
        try {
            // We fetch all leads to get the global stats
            const data = await leadService.listLeads({ filter: 'All' });

            if (data.stats && Array.isArray(data.stats)) {
                let total = 0;
                let closed = 0;

                data.stats.forEach(s => {
                    const count = parseInt(s.count) || 0;
                    total += count;
                    if (s.status === 'closed') {
                        closed = count;
                    }
                });

                const rate = total > 0 ? ((closed / total) * 100).toFixed(1) : 0;

                setStats({
                    totalLeads: total,
                    closedDeals: closed,
                    conversionRate: rate,
                });
            }
        } catch (error) {
            console.error('Error fetching performance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformanceData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPerformanceData();
        setRefreshing(false);
    };

    const MetricCard = ({ title, value, icon, iconType, color, subtext }) => (
        <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                {iconType === 'Feather' ? (
                    <Feather name={icon} size={24} color={color} />
                ) : (
                    <MaterialCommunityIcons name={icon} size={28} color={color} />
                )}
            </View>
            <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>{title}</Text>
                <Text style={styles.metricValue}>{value}</Text>
                {subtext && <Text style={styles.metricSubtext}>{subtext}</Text>}
            </View>
        </View>
    );

    return (
        <ScreenWrapper statusBarColor="#7B61FF">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Performance Summary</Text>
                    <View style={{ width: 24 }} />
                </View>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#7B61FF" />
                        <Text style={styles.loaderText}>Analyzing your performance...</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7B61FF']} tintColor="#7B61FF" />}
                    >
                        <View style={styles.summarySection}>
                            <Text style={styles.sectionTitle}>Overview</Text>
                            <Text style={styles.sectionDesc}>Track your business growth and lead conversion metrics.</Text>
                        </View>

                        <View style={styles.grid}>
                            <MetricCard
                                title="Total Leads"
                                value={stats.totalLeads}
                                icon="users"
                                iconType="Feather"
                                color="#7B61FF"
                                subtext="Overall leads generated"
                            />
                            <MetricCard
                                title="Closed Deals"
                                value={stats.closedDeals}
                                icon="handshake-outline"
                                iconType="MaterialCommunityIcons"
                                color="#10B981"
                                subtext="Successfully converted"
                            />
                            <MetricCard
                                title="Conversion Rate"
                                value={`${stats.conversionRate}%`}
                                icon="trending-up"
                                iconType="Feather"
                                color="#7B61FF"
                                subtext="Leads to Deals ratio"
                            />
                        </View>
                        {/* 
                        <View style={styles.chartPlaceholder}>
                            <View style={styles.placeholderIcon}>
                                <MaterialCommunityIcons name="chart-areaspline" size={48} color="#CBD5E1" />
                            </View>
                            <Text style={styles.placeholderTitle}>Detailed Insights</Text>
                            <Text style={styles.placeholderDesc}>
                                Detailed graphical analysis and trend forecasting will be available as you accumulate more data.
                            </Text>
                        </View> */}

                        <View style={styles.tipBox}>
                            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
                            <Text style={styles.tipText}>
                                <Text style={{ fontWeight: 'bold' }}>Pro Tip:</Text> Follow up with "Interested" leads within 24 hours to improve your conversion rate by up to 30%.
                            </Text>
                        </View>
                    </ScrollView>
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 12,
        color: '#64748B',
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    summarySection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 4,
    },
    sectionDesc: {
        fontSize: 14,
        color: '#64748B',
    },
    grid: {
        gap: 16,
    },
    metricCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    metricInfo: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    metricSubtext: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 2,
    },
    chartPlaceholder: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        marginTop: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    placeholderIcon: {
        marginBottom: 16,
    },
    placeholderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 8,
    },
    placeholderDesc: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: '#FFFBEB',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
        marginBottom: 40,
        alignItems: 'flex-start',
        gap: 12,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        lineHeight: 20,
    },
});

export default PerformanceSummaryScreen;
