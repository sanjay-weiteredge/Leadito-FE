import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { showSweetAlert } from '../components/SweetAlert';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import userService from '../services/userService';
import ScreenWrapper from '../components/ScreenWrapper';
import { makeCall, openWhatsApp, getContactNumberSync } from '../utils/contact';

const PaymentInfoScreen = ({ navigation }) => {
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const activeSub = user?.subscriptions?.[0];
    const planPrice = activeSub?.plan?.price ? `₹${Number(activeSub.plan.price).toLocaleString()}` : (user?.isActive ? 'Custom' : '₹0');
    const paymentStatus = (activeSub?.status === 'active' || user?.isActive) ? 'Paid' : 'Pending';
    const renewalDate = activeSub?.expiryDate ? new Date(activeSub.expiryDate).toLocaleDateString('en-GB') : (user?.isActive ? 'On Request' : 'N/A');

    const handleContactRenewal = () => {
        const contactNumber = getContactNumberSync(user);
        showSweetAlert(
            'Renewal Support',
            'Contact us to renew your plan or for any payment queries.',
            {
                showCancelButton: true,
                cancelText: 'WhatsApp',
                confirmText: 'Call Now',
                onCancel: () => openWhatsApp(contactNumber, "Hi, I want to discuss the renewal of my Leadito plan."),
                onConfirm: () => makeCall(contactNumber)
            }
        );
    };

    return (
        <ScreenWrapper statusBarColor="#7B61FF">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Information</Text>
                    <View style={{ width: 24 }} />
                </View>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#7B61FF" />
                    </View>
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.paymentCard}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="credit-card-check-outline" size={32} color="#7B61FF" />
                                <Text style={styles.cardMainTitle}>Billing Summary</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Plan Price</Text>
                                <Text style={styles.infoValue}>{planPrice}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Payment Status</Text>
                                <View style={[styles.statusBadge, { backgroundColor: paymentStatus === 'Paid' ? '#DCFCE7' : '#FEE2E2' }]}>
                                    <Text style={[styles.statusText, { color: paymentStatus === 'Paid' ? '#10B981' : '#EF4444' }]}>
                                        {paymentStatus}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Next Renewal</Text>
                                <Text style={styles.infoValue}>{renewalDate}</Text>
                            </View>
                        </View>

                        <View style={styles.historyBox}>
                            <View style={styles.historyHeader}>
                                <Feather name="clock" size={18} color="#64748B" />
                                <Text style={styles.historyTitle}>Payment Method</Text>
                            </View>
                            <Text style={styles.historyDesc}>
                                Payments are managed securely. Your current plan details are synchronized with our system.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.contactBtn}
                            onPress={handleContactRenewal}
                        >
                            <MaterialCommunityIcons name="headset" size={20} color="#fff" />
                            <Text style={styles.contactBtnText}>Contact for Renewal</Text>
                        </TouchableOpacity>

                        <View style={styles.securityBox}>
                            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                            <Text style={styles.securityText}>Secure Payment Infrastructure</Text>
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
    content: {
        flex: 1,
        padding: 20,
    },
    paymentCard: {
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
    cardHeader: {
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    cardMainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    historyBox: {
        backgroundColor: '#F1F5F9',
        padding: 20,
        borderRadius: 20,
        marginTop: 24,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
    },
    historyDesc: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    contactBtn: {
        backgroundColor: '#7B61FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 32,
        gap: 10,
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    contactBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    securityBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
        marginBottom: 30,
    },
    securityText: {
        fontSize: 12,
        color: '#16A34A',
        fontWeight: '600',
    },
});

export default PaymentInfoScreen;
