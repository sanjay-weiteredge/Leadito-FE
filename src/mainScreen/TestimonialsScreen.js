import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import publicService from '../services/publicService';

const { width } = Dimensions.get('window');

const TestimonialsScreen = ({ navigation }) => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const data = await publicService.getTestimonials();
            setTestimonials(data || []);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0D1B3E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Client Testimonials</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0047AB" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {testimonials.map((t) => (
                        <View key={t.id} style={styles.testimonialCard}>
                            <View style={styles.cardHeader}>
                                <Image
                                    source={{ uri: t.avatarUrl || `https://ui-avatars.com/api/?name=${t.name}&background=random` }}
                                    style={styles.avatar}
                                />
                                <View style={styles.nameContainer}>
                                    <View style={styles.nameRow}>
                                        {t.socialIcon && (
                                            <View style={styles.socialIcon}>
                                                <FontAwesome5 name={t.socialIcon} size={10} color="#fff" />
                                            </View>
                                        )}
                                        <Text style={styles.userName}>{t.name}</Text>
                                    </View>
                                    <Text style={styles.userRole}>{t.role || 'Business Owner'}</Text>
                                </View>
                                <View style={styles.ratingBox}>
                                    <View style={styles.stars}>
                                        {[...Array(5)].map((_, i) => (
                                            <Ionicons
                                                key={i}
                                                name="star"
                                                size={12}
                                                color={i < Math.floor(t.rating) ? "#FFB800" : "#E2E8F0"}
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.ratingText}>{Number(t.rating).toFixed(1)}</Text>
                                </View>
                            </View>
                            <Text style={styles.feedbackText}>{t.feedback}</Text>
                            <View style={styles.cardFooter}>
                                <Text style={styles.dateText}>{new Date(t.createdAt).toLocaleDateString()}</Text>
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                    <Text style={styles.verifiedText}>Verified Result</Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {testimonials.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbox-ellipses-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No testimonials found yet.</Text>
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
    testimonialCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EBF2FF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    nameContainer: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    socialIcon: {
        width: 18,
        height: 18,
        backgroundColor: '#1DA1F2',
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    userRole: {
        fontSize: 12,
        color: '#64748B',
    },
    ratingBox: {
        alignItems: 'flex-end',
    },
    stars: {
        flexDirection: 'row',
        gap: 1,
    },
    ratingText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 2,
    },
    feedbackText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 15,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    dateText: {
        fontSize: 12,
        color: '#94A3B8',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
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

export default TestimonialsScreen;
