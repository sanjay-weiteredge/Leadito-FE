import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Images from '../components/image';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSubscription } from '../context/SubscriptionContext';
import { showSweetAlert } from '../components/SweetAlert';
import { fontSize } from '../utils/responsive';

const EmailIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <Path d="M22 6l-10 7L2 6" />
    </Svg>
);

const AddressIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <Path d="M9 22V12h6v10" />
    </Svg>
);

const StateIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z" />
        <Circle cx="12" cy="9" r="3" />
    </Svg>
);

// LogoIcon removed from this screen

const { width } = Dimensions.get('window');

// --- SVG Icons ---
const UserIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
    </Svg>
);

const PhoneIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
);

const BusinessIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </Svg>
);

const TypeIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <Path d="M9 22v-4h6v4" />
        <Path d="M8 6h.01" />
        <Path d="M16 6h.01" />
        <Path d="M8 10h.01" />
        <Path d="M16 10h.01" />
        <Path d="M8 14h.01" />
        <Path d="M16 14h.01" />
    </Svg>
);

const CityIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
        <Circle cx="12" cy="10" r="3" />
    </Svg>
);

const InfoIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M12 16v-4" />
        <Path d="M12 8h.01" />
    </Svg>
);

const ArrowRightIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 12h14" />
        <Path d="M12 5l7 7-7 7" />
    </Svg>
);

const OnboardingScreen = ({ navigation }) => {
    const { checkSubscription } = useSubscription();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        businessName: '',
        businessType: '',
        businessAddress: '',
        city: '',
        state: '',
        logoUrl: '',
    });
    const [selectedLogo, setSelectedLogo] = useState(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            const profile = await AsyncStorage.getItem('userProfile');
            if (profile) {
                const user = JSON.parse(profile);
                setFormData(prev => ({ ...prev, phoneNumber: user.phone }));
            }
        };
        fetchUser();
    }, []);

    const handleInput = (key, value) => {
        setFormData({ ...formData, [key]: value });
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: null }));
        }
    };

    const pickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedLogo(result.assets[0]);
            setFormData({ ...formData, logoUrl: result.assets[0].uri });
        }
    };

    const handleCompleteSetup = async () => {
        const { fullName, email, businessName, businessType, businessAddress, city, state } = formData;

        let newErrors = {};
        if (!fullName?.trim()) newErrors.fullName = 'Full Name is required';

        if (email?.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!businessName?.trim()) newErrors.businessName = 'Business Name is required';
        if (!businessType?.trim()) newErrors.businessType = 'Business Type is required';
        if (!city?.trim()) newErrors.city = 'City is required';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('name', fullName);
            formDataToSubmit.append('email', email);
            formDataToSubmit.append('businessName', businessName);
            formDataToSubmit.append('businessType', businessType);
            formDataToSubmit.append('businessAddress', businessAddress);
            formDataToSubmit.append('city', city);
            formDataToSubmit.append('state', state);

            if (selectedLogo) {
                const uri = selectedLogo.uri;
                const type = selectedLogo.mimeType || 'image/jpeg';
                const name = uri.split('/').pop();
                formDataToSubmit.append('logo', { uri, type, name });
            }

            const data = await authService.onboarding(formDataToSubmit);

            // Update stored token and profile with onboarded status
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userProfile', JSON.stringify(data.user));

            // Refresh subscription status now that the token is updated.
            await checkSubscription();

            showSweetAlert('Success', 'Profile setup complete!', {
                confirmText: 'Start Exploring',
                onConfirm: () => navigation.navigate('Main')
            });
        } catch (error) {
            console.error('Onboarding Error:', error);
            showSweetAlert('Error', error.response?.data?.message || 'Failed to complete setup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Complete Your Profile</Text>
                        <Text style={styles.subtitle}>Tell us about your business to get started</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.inputLabel}>Full Name*</Text>
                        <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
                            <UserIcon />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChangeText={(val) => handleInput('fullName', val)}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                        {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

                        <Text style={styles.inputLabel}>Email Address</Text>
                        <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                            <EmailIcon />
                            <TextInput
                                style={styles.input}
                                placeholder="example@business.com"
                                value={formData.email}
                                onChangeText={(val) => handleInput('email', val)}
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <View style={[styles.inputWrapper, styles.disabledInput]}>
                            <PhoneIcon />
                            <TextInput
                                style={styles.input}
                                value={formData.phoneNumber}
                                editable={false}
                                color="#64748B"
                            />
                        </View>

                        <Text style={styles.inputLabel}>Business Name*</Text>
                        <View style={[styles.inputWrapper, errors.businessName && styles.inputError]}>
                            <BusinessIcon />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your business name"
                                value={formData.businessName}
                                onChangeText={(val) => handleInput('businessName', val)}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                        {errors.businessName ? <Text style={styles.errorText}>{errors.businessName}</Text> : null}

                        <Text style={styles.inputLabel}>Business Type*</Text>
                        <View style={[styles.inputWrapper, errors.businessType && styles.inputError]}>
                            <TypeIcon />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Real Estate, Gym, Coaching"
                                value={formData.businessType}
                                onChangeText={(val) => handleInput('businessType', val)}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                        {errors.businessType ? <Text style={styles.errorText}>{errors.businessType}</Text> : null}

                        <Text style={styles.inputLabel}>Business Address</Text>
                        <View style={styles.inputWrapper}>
                            <AddressIcon />
                            <TextInput
                                style={styles.input}
                                placeholder="Street, Area, etc."
                                value={formData.businessAddress}
                                onChangeText={(val) => handleInput('businessAddress', val)}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>
                                <Text style={styles.inputLabel}>City*</Text>
                                <View style={[styles.inputWrapper, errors.city && styles.inputError]}>
                                    <CityIcon />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="City"
                                        value={formData.city}
                                        onChangeText={(val) => handleInput('city', val)}
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>
                                {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
                            </View>

                            <View style={{ width: '48%' }}>
                                <Text style={styles.inputLabel}>State</Text>
                                <View style={[styles.inputWrapper, errors.state && styles.inputError]}>
                                    <StateIcon />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="State"
                                        value={formData.state}
                                        onChangeText={(val) => handleInput('state', val)}
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>
                                {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
                            </View>
                        </View>

                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                        activeOpacity={0.8}
                        onPress={handleCompleteSetup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>Complete Setup</Text>
                                <ArrowRightIcon />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footerNote}>
                        <Ionicons name="lock-closed" size={14} color="#64748B" style={{ marginRight: 6 }} />
                        <Text style={styles.footerText}>
                            You cannot access the app without completing your profile.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 220,
        height: 70,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        justifyContent: 'center',
    },
    stepWrapper: {
        alignItems: 'center',
        width: 80,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    stepCompleted: {
        backgroundColor: '#7B61FF',
    },
    stepActive: {
        backgroundColor: '#7B61FF',
    },
    stepInactive: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    stepNumberActive: {
        color: '#FFFFFF',
        fontSize: fontSize(12),
        fontWeight: 'bold',
    },
    stepNumberInactive: {
        color: '#94A3B8',
        fontSize: fontSize(12),
        fontWeight: 'bold',
    },
    stepText: {
        fontSize: fontSize(10),
        color: '#94A3B8',
        textAlign: 'center',
    },
    stepTextActive: {
        color: '#7B61FF',
        fontWeight: 'bold',
    },
    stepLineActive: {
        height: 1,
        width: 40,
        backgroundColor: '#7B61FF',
        marginBottom: 20,
    },
    stepLineInactive: {
        height: 1,
        width: 40,
        backgroundColor: '#E2E8F0',
        marginBottom: 20,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    titleSection: {
        alignItems: 'center',
        marginVertical: 10,
    },
    title: {
        fontSize: fontSize(24),
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: fontSize(14),
        color: '#64748B',
        textAlign: 'center',
    },
    formContainer: {
        marginTop: 4,
    },
    inputLabel: {
        fontSize: fontSize(14),
        fontWeight: '600',
        color: '#2D1E4E',
        marginTop: 20,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    disabledInput: {
        backgroundColor: '#F1F5F9',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: fontSize(15),
        color: '#1E293B',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        color: '#EF4444',
        fontSize: fontSize(12),
        marginTop: 6,
        marginLeft: 4,
    },
    dropdownText: {
        flex: 1,
        marginLeft: 12,
        fontSize: fontSize(15),
        color: '#94A3B8',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F3E8FF',
        borderRadius: 12,
        padding: 16,
        marginTop: 30,
        alignItems: 'flex-start',
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoTitle: {
        fontSize: fontSize(14),
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: fontSize(12),
        color: '#64748B',
        lineHeight: 18,
    },
    primaryButton: {
        backgroundColor: '#7B61FF',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: fontSize(16),
        fontWeight: 'bold',
        marginRight: 12,
    },
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: fontSize(12),
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
    },
    logoPickerContainer: {
        width: '100%',
        height: 160,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        position: 'relative',
    },
    logoPlaceholder: {
        alignItems: 'center',
    },
    logoIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoPlaceholderText: {
        fontSize: fontSize(14),
        color: '#64748B',
    },
    logoPreview: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    logoEditBadge: {
        position: 'absolute',
        bottom: 15,
        right: '50%',
        marginRight: -70,
        backgroundColor: '#7B61FF',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
});

export default OnboardingScreen;
