import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import publicService from '../services/publicService';

const { width } = Dimensions.get('window');

const AllServicesScreen = ({ navigation }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await publicService.getServices();
            setServices(data || []);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (index) => {
        const icons = [
            { name: "megaphone-outline", color: "#3B82F6", bg: "#EFF6FF" },
            { name: "people-outline", color: "#10B981", bg: "#ECFDF5" },
            { name: "stats-chart-outline", color: "#8B5CF6", bg: "#F5F3FF" }
        ];
        return icons[index % icons.length];
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0D1B3E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Our Services</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0047AB" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.introText}>
                        Comprehensive solutions powered by AI to grow your business from lead to sale.
                    </Text>

                    {services.map((service, index) => {
                        const iconData = getIcon(index);
                        return (
                            <View key={service.id} style={styles.serviceCard}>
                                <View style={[styles.iconBox, { backgroundColor: iconData.bg }]}>
                                    <Ionicons name={iconData.name} size={28} color={iconData.color} />
                                </View>
                                <View style={styles.contentBox}>
                                    <Text style={styles.serviceTitle}>{service.title}</Text>
                                    <Text style={styles.serviceDesc}>{service.description}</Text>

                                    <View style={styles.featureList}>
                                        <View style={styles.featureItem}>
                                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                            <Text style={styles.featureText}>Fully Automatic</Text>
                                        </View>
                                        <View style={styles.featureItem}>
                                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                            <Text style={styles.featureText}>24/7 Monitoring</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {services.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="briefcase-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No services available at the moment.</Text>
                        </View>
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0D1B3E',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    introText: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 22,
        marginBottom: 25,
        textAlign: 'center',
    },
    serviceCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentBox: {
        flex: 1,
    },
    serviceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 6,
    },
    serviceDesc: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 12,
    },
    featureList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#94A3B8',
    },
});

export default AllServicesScreen;
