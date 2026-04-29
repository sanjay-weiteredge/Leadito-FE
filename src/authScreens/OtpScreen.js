import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Images from '../components/image';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Alert } from 'react-native';

const { width } = Dimensions.get('window');

const OtpScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { phoneNumber } = route.params || {};
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    const staticOtp = "123456";

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value.length !== 0 && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 6) {
            Alert.alert('Incomplete OTP', 'Please enter the 6-digit code.');
            return;
        }

        setLoading(true);
        try {
            const data = await authService.verifyOtp(phoneNumber, enteredOtp);

            // Store token for future authenticated requests
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userProfile', JSON.stringify(data.user));

            if (!data.user.isOnboarded) {
                navigation.navigate('Onboarding');
            } else {
                // If already onboarded, go to Main/Home
                navigation.navigate('Main');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setTimer(30);
        try {
            await authService.sendOtp(phoneNumber);
            Alert.alert('Success', 'OTP has been resent to your number.');
        } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP.');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
                    </View>

                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Verification Code</Text>
                        <Text style={styles.subtitle}>
                            Please enter the 6-digit code sent to your mobile number for secure access.
                        </Text>
                    </View>

                    <View style={styles.otpWrapper}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputActive : {}
                                ]}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={digit}
                                onChangeText={(value) => handleChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                selectionColor="#2563EB"
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>

                    <View style={styles.staticHintContainer}>
                        <View style={styles.hintBadge}>
                            <Ionicons name="information-circle-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                            <Text style={styles.hintLabel}>TEST OTP</Text>
                            <Text style={styles.hintValue}>{staticOtp}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.verifyButton, loading && { opacity: 0.7 }]}
                        activeOpacity={0.8}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.resendWrapper}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        {timer > 0 ? (
                            <Text style={styles.timerText}>Resend in {timer}s</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend}>
                                <Text style={styles.resendLink}>Resend OTP</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
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
        paddingHorizontal: 20,
        height: 60,
        justifyContent: 'center',
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    logoContainer: {
        marginTop: 0,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    logo: {
        width: 250,
        height: 100,
    },
    titleSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 35,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 15,
    },
    otpWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 35,
    },
    otpInput: {
        width: (width - 48 - 40) / 6,
        height: 54,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        backgroundColor: '#F8FAFC',
    },
    otpInputActive: {
        borderColor: '#2563EB',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
    },
    staticHintContainer: {
        marginBottom: 35,
    },
    hintBadge: {
        flexDirection: 'row',
        backgroundColor: '#F0F7FF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D0E4FF',
    },
    hintLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#2563EB',
        marginRight: 6,
        letterSpacing: 1,
    },
    hintValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    verifyButton: {
        backgroundColor: '#2563EB',
        width: '100%',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
    },
    resendText: {
        fontSize: 14,
        color: '#64748B',
    },
    resendLink: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: 'bold',
    },
    timerText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
});

export default OtpScreen;
