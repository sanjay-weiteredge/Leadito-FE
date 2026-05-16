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
    Platform,
    Share,
    RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userService from '../services/userService';
import { makeCall, openWhatsApp, getContactNumberSync } from '../utils/contact';
import * as ImagePicker from 'expo-image-picker';
import { useSubscription } from '../context/SubscriptionContext';

const { width } = Dimensions.get('window');

const BusinessScreen = ({ navigation }) => {
    const { clearSubscription } = useSubscription();
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
    const [selectedImage, setSelectedImage] = useState(null);

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

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserProfile();
        setRefreshing(false);
    };

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
            setSelectedImage(null);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
            setEditForm({ ...editForm, logoUrl: result.assets[0].uri });
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('email', editForm.email);
            formData.append('businessName', editForm.businessName);
            formData.append('businessAddress', editForm.businessAddress);
            formData.append('city', editForm.city);
            formData.append('state', editForm.state);

            if (selectedImage) {
                const uri = selectedImage.uri;
                const type = selectedImage.mimeType || 'image/jpeg';
                // Ensure filename has an extension
                const uriParts = uri.split('/');
                const fileName = uriParts[uriParts.length - 1];
                const extension = fileName.includes('.') ? '' : '.jpg';
                const name = fileName + extension;

                formData.append('logo', {
                    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                    type,
                    name
                });
            } else if (editForm.logoUrl) {
                formData.append('logoUrl', editForm.logoUrl);
            }

            const data = await userService.updateProfile(formData);
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
            color: '#9333EA',
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
                        await clearSubscription();
                        await AsyncStorage.clear();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    const handleShareApp = async () => {
        try {
            const result = await Share.share({
                message: 'Transform your business with Leadito - The ultimate lead management and business growth tool. Manage leads, track performance, and grow your business today!\n\nDownload Leadito now: https://leadito.pages.dev/',
                title: 'Share Leadito',
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleOptionPress = (id) => {
        if (id === 'logout') {
            handleLogout();
        } else if (id === 'support') {
            navigation.navigate('Support');
        } else if (id === 'plan') {
            navigation.navigate('PlanDetails');
        } else if (id === 'performance') {
            navigation.navigate('PerformanceSummary');
        } else if (id === 'payment') {
            navigation.navigate('PaymentInfo');
        } else if (id === 'notifications') {
            navigation.navigate('Notifications');
        } else if (id === 'share') {
            handleShareApp();
        } else if (id === 'workprocess') {
            navigation.navigate('WorkProcess');
        } else if (id === 'privacy') {
            navigation.navigate('PrivacyPolicy');
        } else if (id === 'terms') {
            navigation.navigate('Terms');
        } else if (id === 'refund') {
            navigation.navigate('RefundPolicy');
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
        <ScreenWrapper statusBarColor="#7B61FF" bottomSafe={false}>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Business</Text>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7B61FF']} tintColor="#7B61FF" />
                    }
                >
                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.profileHeader}>
                            <View style={styles.businessLogoContainer}>
                                <View style={[styles.logoCircle, { overflow: 'hidden' }]}>
                                    {user?.logoUrl ? (
                                        <Image source={{ uri: user.logoUrl }} style={styles.businessLogo} resizeMode="cover" />
                                    ) : (
                                        <MaterialCommunityIcons name="office-building" size={32} color="#7B61FF" />
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
                                    <Ionicons name="location" size={14} color="#7B61FF" style={styles.infoIcon} />
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

                    <View style={styles.optionsList}>
                        {[
                            {
                                id: 'plan',
                                title: 'Plan Details',
                                subtitle: user?.isActive ? 'Active Plan' : 'Free Tier - Click to Upgrade',
                                icon: 'card-account-details-outline',
                                iconType: 'MaterialCommunityIcons',
                                color: '#9333EA',
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
                                id: 'workprocess',
                                title: 'How It Works',
                                subtitle: 'Understand our work process',
                                icon: 'cog-outline',
                                iconType: 'MaterialCommunityIcons',
                                color: '#059669',
                            },
                            {
                                id: 'privacy',
                                title: 'Privacy Policy',
                                subtitle: 'Read our privacy guidelines',
                                icon: 'shield-lock-outline',
                                iconType: 'MaterialCommunityIcons',
                                color: '#0EA5E9',
                            },
                            {
                                id: 'terms',
                                title: 'Terms & Conditions',
                                subtitle: 'Review our terms of service',
                                icon: 'document-text-outline',
                                iconType: 'Ionicons',
                                color: '#F59E0B',
                            },
                            {
                                id: 'refund',
                                title: 'Refund Policy',
                                subtitle: 'View our refund conditions',
                                icon: 'cash-outline',
                                iconType: 'Ionicons',
                                color: '#F43F5E',
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={styles.modalScroll}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.name}
                                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                                placeholder="Enter full name"
                                placeholderTextColor="#000"
                            />

                            <Text style={styles.inputLabel}>Business Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.businessName}
                                onChangeText={(text) => setEditForm({ ...editForm, businessName: text })}
                                placeholder="Enter business name"
                                placeholderTextColor="#000"
                            />

                            <Text style={styles.inputLabel}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.email}
                                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                                placeholder="example@business.com"
                                placeholderTextColor="#000"
                                keyboardType="email-address"
                            />

                            <Text style={styles.inputLabel}>Business Address</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.businessAddress}
                                onChangeText={(text) => setEditForm({ ...editForm, businessAddress: text })}
                                placeholder="Street, Area, etc."
                                placeholderTextColor="#000"
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ width: '48%' }}>
                                    <Text style={styles.inputLabel}>City</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editForm.city}
                                        onChangeText={(text) => setEditForm({ ...editForm, city: text })}
                                        placeholder="City"
                                        placeholderTextColor="#000"
                                    />
                                </View>
                                <View style={{ width: '48%' }}>
                                    <Text style={styles.inputLabel}>State</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editForm.state}
                                        onChangeText={(text) => setEditForm({ ...editForm, state: text })}
                                        placeholder="State"
                                        placeholderTextColor="#000"
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Business Logo</Text>
                            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                                {editForm.logoUrl ? (
                                    <Image source={{ uri: editForm.logoUrl }} style={styles.previewLogo} />
                                ) : (
                                    <View style={styles.placeholderLogo}>
                                        <Ionicons name="camera" size={32} color="#94A3B8" />
                                        <Text style={styles.placeholderText}>Select Logo</Text>
                                    </View>
                                )}
                                <View style={styles.editBadge}>
                                    <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
                                </View>
                            </TouchableOpacity>

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
        backgroundColor: '#7B61FF',
        height: 70,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 28,
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
        padding: 16,
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
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9D5FF',
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D1E4E',
        flex: 1,
        marginRight: 10,
    },
    editText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#7B61FF',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 6,
    },
    infoText: {
        fontSize: 15,
        color: '#64748B',
    },
    contactInfoRow: {
        flexDirection: 'column',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactText: {
        fontSize: 14,
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
        padding: 10,
        borderRadius: 14,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconBg: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D1E4E',
        marginBottom: 1,
    },
    optionSubtitle: {
        fontSize: 12.5,
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    modalScroll: {
        paddingBottom: 40,
    },
    inputLabel: {
        fontSize: 15,
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
        fontSize: 16,
        color: '#2D1E4E',
    },
    saveButton: {
        backgroundColor: '#7B61FF',
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
    imagePickerButton: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        position: 'relative',
    },
    previewLogo: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    placeholderLogo: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#7B61FF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
});

export default BusinessScreen;
