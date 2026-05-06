import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import Images from '../components/image';
import authService from '../services/authService';
import { ActivityIndicator, Alert } from 'react-native';

const LoginScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (phoneNumber.length < 10) {
            Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
            return;
        }

        setLoading(true);
        try {
            const data = await authService.sendOtp(phoneNumber);
            console.log('OTP Result:', data);
            navigation.navigate('Otp', { phoneNumber });
        } catch (error) {
            console.log('🔥 OTP ERROR FULL:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                configUrl: error.config?.url,
                header: error.config?.headers?.Authorization
            });
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Illustration Section */}
                    <View style={styles.illustrationContainer}>
                        <Image
                            source={Images.mobileLogin}
                            style={styles.illustration}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Welcome Text Section */}
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>Welcome to Leadito AI</Text>
                        <Text style={styles.subWelcomeText}>Login or sign up to get started</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Enter your phone number</Text>
                        <View style={styles.phoneInputContainer}>
                            <TouchableOpacity style={styles.countryPicker}>
                                <Image
                                    source={{ uri: 'https://flagcdn.com/w40/in.png' }}
                                    style={styles.flagIcon}
                                />
                                <Text style={styles.countryCode}>+91</Text>
                                <Ionicons name="chevron-down" size={16} color="#475569" />
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="98765 43210"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="lock-closed-outline" size={14} color="#64748B" />
                            <Text style={styles.infoText}>
                                We'll send you a one-time password (OTP) to verify your number
                            </Text>
                        </View>

                        {/* Send OTP Button */}
                        <TouchableOpacity
                            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                            activeOpacity={0.8}
                            onPress={handleSendOtp}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>Send OTP</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerBaseText}>
                            By continuing, you agree to our{' '}
                        </Text>
                        <View style={styles.footerLinkRow}>
                            <TouchableOpacity>
                                <Text style={styles.footerLinkText}>Terms of Service</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerBaseText}> and </Text>
                            <TouchableOpacity>
                                <Text style={styles.footerLinkText}>Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
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
    scrollContent: {
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(40),
    },

    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustration: {
        width: '100%',
        height: verticalScale(200),
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    welcomeText: {
        fontSize: fontSize(24),
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 8,
    },
    subWelcomeText: {
        fontSize: fontSize(15),
        color: '#64748B',
    },
    formSection: {
        width: '100%',
    },
    inputLabel: {
        fontSize: fontSize(14),
        fontWeight: '600',
        color: '#2D1E4E',
        marginBottom: verticalScale(12),
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        height: verticalScale(56),
        backgroundColor: '#F8FAFC',
    },
    countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
    },
    flagIcon: {
        width: 24,
        height: 18,
        borderRadius: 2,
        marginRight: 8,
    },
    countryCode: {
        fontSize: fontSize(16),
        fontWeight: '600',
        color: '#2D1E4E',
        marginRight: 4,
    },
    divider: {
        width: 1,
        height: '60%',
        backgroundColor: '#E2E8F0',
    },
    textInput: {
        flex: 1,
        fontSize: fontSize(16),
        color: '#2D1E4E',
        paddingHorizontal: scale(16),
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 2,
    },
    infoText: {
        fontSize: fontSize(11),
        color: '#64748B',
        marginLeft: 6,
        lineHeight: fontSize(16),
    },
    primaryButton: {
        backgroundColor: '#7B61FF',
        height: verticalScale(56),
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(30),
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
        marginRight: 8,
    },
    orDividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    orText: {
        marginHorizontal: 16,
        color: '#94A3B8',
        fontSize: 13,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(56),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    googleButtonText: {
        color: '#1E293B',
        fontSize: fontSize(16),
        fontWeight: '600',
    },
    footerContainer: {
        marginTop: verticalScale(40),
        alignItems: 'center',
    },
    footerBaseText: {
        fontSize: fontSize(12),
        color: '#64748B',
    },
    footerLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    footerLinkText: {
        fontSize: fontSize(12),
        color: '#7B61FF',
        fontWeight: '500',
    },
});

export default LoginScreen;
