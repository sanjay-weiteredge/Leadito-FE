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
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Images from '../components/image';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '../context/SubscriptionContext';
import auth from '@react-native-firebase/auth';
import { showSweetAlert } from '../components/SweetAlert';

const { width } = Dimensions.get('window');

const OtpScreen = ({ navigation, route }) => {
    const { checkSubscription } = useSubscription();
    const insets = useSafeAreaInsets();
    const { phoneNumber, confirmation: initialConfirmation } = route.params || {};
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState(initialConfirmation);
    const inputRefs = useRef([]);

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
        try {
            if (!confirmation) {
                showSweetAlert('Verification Failed', 'Your session is invalid. Please go back and try again.');
                return;
            }

            const code = otp.join('');
            if (code.length < 6) {
                showSweetAlert('Invalid OTP', 'Please enter all 6 digits.');
                return;
            }

            setLoading(true);

            // Firebase confirmation
            const credential = await confirmation.confirm(code);
            const idToken = await credential.user.getIdToken();

            // Backend verification
            const data = await authService.verifyFirebaseOtp(idToken);

            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userProfile', JSON.stringify(data.user));
                await checkSubscription();

                if (data.isNewUser || !data.user.isOnboarded) {
                    navigation.navigate('Onboarding');
                } else {
                    navigation.navigate('Main');
                }
            }
        } catch (error) {
            console.error('🔥 Verify OTP Error:', error.code, error.message);
            let errorMessage = 'The verification code is incorrect. Please try again.';

            // Map technical/unknown errors to user-friendly messages
            if (error.message && error.message.includes('session-info')) {
                errorMessage = 'Your verification session has expired. Please resend the OTP.';
            } else if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'The code you entered is incorrect. Please check it and try again.';
            } else if (error.code === 'auth/session-expired') {
                errorMessage = 'Security session expired. Please resend the OTP.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = 'The OTP has expired. Please request a new one.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            showSweetAlert('Verification Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const fullPhoneNumber = `+91${phoneNumber}`;
            const newConfirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
            setConfirmation(newConfirmation);
            setTimer(30);
            showSweetAlert('OTP Resent', 'A new verification code has been sent to your phone.');
        } catch (error) {
            console.log('🔥 Resend Error:', error.code, error.message);
            let msg = 'Failed to resend OTP. Please try again later.';
            if (error.code === 'auth/too-many-requests') {
                msg = 'Too many requests. Please wait a few minutes before trying again.';
            } else if (error.code === 'auth/network-request-failed') {
                msg = 'Network error. Please check your connection.';
            }
            showSweetAlert('Resend Failed', msg);
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
                                selectionColor="#7405CB"
                                autoFocus={index === 0}
                            />
                        ))}
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
        paddingHorizontal: scale(24),
        alignItems: 'center',
    },
    logoContainer: {
        marginTop: 0,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    logo: {
        width: scale(200),
        height: verticalScale(80),
    },
    titleSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 35,
    },
    title: {
        fontSize: fontSize(24),
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: fontSize(14),
        color: '#64748B',
        textAlign: 'center',
        lineHeight: fontSize(20),
        paddingHorizontal: scale(15),
    },
    otpWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 35,
    },
    otpInput: {
        width: (Dimensions.get('window').width - scale(48) - scale(40)) / 6,
        height: verticalScale(54),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: fontSize(22),
        fontWeight: 'bold',
        color: '#2D1E4E',
        backgroundColor: '#F8FAFC',
    },
    otpInputActive: {
        borderColor: '#7B61FF',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
    },
    staticHintContainer: {
        marginBottom: 35,
    },
    hintBadge: {
        flexDirection: 'row',
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9D5FF',
    },
    hintLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#7B61FF',
        marginRight: 6,
        letterSpacing: 1,
    },
    hintValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    verifyButton: {
        backgroundColor: '#7B61FF',
        width: '100%',
        height: verticalScale(56),
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: fontSize(16),
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
        color: '#7B61FF',
        fontWeight: 'bold',
    },
    timerText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
});

export default OtpScreen;
