import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userService from '../services/userService';
import { makeCall, openWhatsApp, getContactNumberSync } from '../utils/contact';

const { width } = Dimensions.get('window');

const BusinessScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        businessName: '',
        businessAddress: '',
        city: '',
        state: '',
        logoUrl: '',
    });

    const fetchUserProfile = async () => {
        try {
            const data = await userService.getProfile();
            setUser(data);
            await AsyncStorage.setItem('userProfile', JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to local storage if API fails
            const profile = await AsyncStorage.getItem('userProfile');
            if (profile) setUser(JSON.parse(profile));
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const openEditModal = () => {
        if (user) {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                businessName: user.businessName || '',
                businessAddress: user.businessAddress || '',
                city: user.city || '',
                state: user.state || '',
                logoUrl: user.logoUrl || '',
            });
            setEditModalVisible(true);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const data = await userService.updateProfile(editForm);
            setUser(data.user);
            await AsyncStorage.setItem('userProfile', JSON.stringify(data.user));
            Alert.alert('Success', 'Profile updated successfully!');
            setEditModalVisible(false);
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const SETTINGS_OPTIONS = [
        {
            id: 'plan',
            title: 'Plan Details',
            subtitle: 'View your current plan, status and validity',
            icon: 'card-account-details-outline',
            iconType: 'MaterialCommunityIcons',
            color: '#3B82F6',
        },
        // ... (other options stay the same, but I'll add the onPress handler below)
        {
            id: 'logout',
            title: 'Logout',
            subtitle: 'Sign out from your account',
            icon: 'logout',
            iconType: 'MaterialCommunityIcons',
            color: '#EF4444',
            isNext: false,
        },
    ];

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.replace('Login');
                    }
                }
            ]
        );
    };

    const handleOptionPress = (id) => {
        if (id === 'logout') {
            handleLogout();
        } else if (id === 'support') {
            const contactNumber = getContactNumberSync(user);
            Alert.alert(
                'Support',
                'How would you like to contact us?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'WhatsApp', onPress: () => openWhatsApp(contactNumber, "Hi, I need support with Leadito.") },
                    { text: 'Call Support', onPress: () => makeCall(contactNumber) },
                ]
            );
        } else if (id === 'plan') {
            navigation.navigate('Plans & Pricing');
        } else {
            // Placeholder for other navigations
            console.log('Navigating to:', id);
        }
    };

    const renderOption = (option) => (
        <TouchableOpacity
            key={option.id}
            style={styles.optionItem}
            onPress={() => handleOptionPress(option.id)}
        >
            <View style={[styles.iconBg, { backgroundColor: option.color + '15' }]}>
                {option.iconType === 'MaterialCommunityIcons' && (
                    <MaterialCommunityIcons name={option.icon} size={22} color={option.color} />
                )}
                {option.iconType === 'Feather' && (
                    <Feather name={option.icon} size={20} color={option.color} />
                )}
                {option.iconType === 'Ionicons' && (
                    <Ionicons name={option.icon} size={22} color={option.color} />
                )}
            </View>
            <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            {option.isNext !== false && (
                <Feather name="chevron-right" size={20} color="#94A3B8" />
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper statusBarColor="#2563EB">
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Business</Text>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.profileHeader}>
                            <View style={styles.businessLogoContainer}>
                                <View style={[styles.logoCircle, { overflow: 'hidden' }]}>
                                    {user?.logoUrl ? (
                                        <Image source={{ uri: user.logoUrl }} style={styles.businessLogo} resizeMode="cover" />
                                    ) : (
                                        <MaterialCommunityIcons name="office-building" size={32} color="#2563EB" />
                                    )}
                                </View>
                            </View>
                            <View style={styles.businessInfoMain}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.businessName} numberOfLines={1}>
                                        {user?.businessName || 'Leadito User'}
                                    </Text>
                                    <TouchableOpacity onPress={openEditModal}>
                                        <Text style={styles.editText}>EDIT</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.infoRow}>
                                    <Ionicons name="location" size={14} color="#2563EB" style={styles.infoIcon} />
                                    <Text style={styles.infoText} numberOfLines={1}>
                                        {user?.city ? `${user.city}${user.state ? `, ${user.state}` : ''}` : 'Location not set'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.contactInfoRow}>
                            <View style={styles.contactItem}>
                                <MaterialCommunityIcons name="email-outline" size={14} color="#64748B" />
                                <Text style={styles.contactText}>{user?.email || 'No email'}</Text>
                            </View>
                            <View style={styles.contactItem}>
                                <Feather name="phone" size={13} color="#64748B" />
                                <Text style={styles.contactText}>{user?.phone || 'No phone'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Options List */}
                    <View style={styles.optionsList}>
                        {[
                            {
                                id: 'plan',
                                title: 'Plan Details',
                                subtitle: user?.isActive ? 'Active Plan' : 'Free Tier - Click to Upgrade',
                                icon: 'card-account-details-outline',
                                iconType: 'MaterialCommunityIcons',
                                color: '#3B82F6',
                            },
                            {
                                id: 'performance',
                                title: 'Performance Summary',
                                subtitle: 'Check your business performance overview',
                                icon: 'trending-up',
                                iconType: 'Feather',
                                color: '#10B981',
                            },
                            {
                                id: 'payment',
                                title: 'Payment Information',
                                subtitle: 'View payment history and methods',
                                icon: 'credit-card',
                                iconType: 'Feather',
                                color: '#6366F1',
                            },
                            {
                                id: 'support',
                                title: 'Support Options',
                                subtitle: 'Get help and contact support team',
                                icon: 'headphones',
                                iconType: 'Feather',
                                color: '#F59E0B',
                            },
                            {
                                id: 'notifications',
                                title: 'Notifications & Updates',
                                subtitle: 'Stay updated with the latest news',
                                icon: 'bell',
                                iconType: 'Feather',
                                color: '#EC4899',
                            },
                            {
                                id: 'share',
                                title: 'Share App',
                                subtitle: 'Share the app with your network',
                                icon: 'share-2',
                                iconType: 'Feather',
                                color: '#8B5CF6',
                            },
                            {
                                id: 'privacy',
                                title: 'Privacy Policy',
                                subtitle: 'Read our privacy guidelines',
                                icon: 'shield-lock-outline',
                                iconType: 'MaterialCommunityIcons',
                                color: '#64748B',
                            },
                            {
                                id: 'terms',
                                title: 'Terms & Conditions',
                                subtitle: 'Review our terms of service',
                                icon: 'document-text-outline',
                                iconType: 'Ionicons',
                                color: '#64748B',
                            },
                            {
                                id: 'logout',
                                title: 'Logout',
                                subtitle: 'Sign out from your account',
                                icon: 'logout',
                                iconType: 'MaterialCommunityIcons',
                                color: '#EF4444',
                                isNext: false,
                            },
                        ].map(renderOption)}
                    </View>

                    <View style={styles.footerSpacing} />
                </ScrollView>
            </View>

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.name}
                                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                                placeholder="Enter full name"
                            />

                            <Text style={styles.inputLabel}>Business Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.businessName}
                                onChangeText={(text) => setEditForm({ ...editForm, businessName: text })}
                                placeholder="Enter business name"
                            />

                            <Text style={styles.inputLabel}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.email}
                                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                                placeholder="example@business.com"
                                keyboardType="email-address"
                            />

                            <Text style={styles.inputLabel}>Business Address</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.businessAddress}
                                onChangeText={(text) => setEditForm({ ...editForm, businessAddress: text })}
                                placeholder="Street, Area, etc."
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ width: '48%' }}>
                                    <Text style={styles.inputLabel}>City</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editForm.city}
                                        onChangeText={(text) => setEditForm({ ...editForm, city: text })}
                                        placeholder="City"
                                    />
                                </View>
                                <View style={{ width: '48%' }}>
                                    <Text style={styles.inputLabel}>State</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editForm.state}
                                        onChangeText={(text) => setEditForm({ ...editForm, state: text })}
                                        placeholder="State"
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Logo URL</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.logoUrl}
                                onChangeText={(text) => setEditForm({ ...editForm, logoUrl: text })}
                                placeholder="https://example.com/logo.png"
                            />

                            <TouchableOpacity
                                style={[styles.saveButton, loading && { opacity: 0.7 }]}
                                onPress={handleSaveProfile}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#2563EB',
        height: 70,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    businessLogoContainer: {
        marginRight: 16,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    businessLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    businessInfoMain: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    businessName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
        marginRight: 10,
    },
    editText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 6,
    },
    infoText: {
        fontSize: 13,
        color: '#64748B',
    },
    contactInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
    optionsList: {
        marginTop: 24,
        paddingHorizontal: 16,
        gap: 4,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
    },
    footerSpacing: {
        height: 30,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    modalScroll: {
        paddingBottom: 40,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1E293B',
    },
    saveButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BusinessScreen;
