import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Linking,
    Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '../components/ScreenWrapper';
import { makeCall, openWhatsApp, getContactInfo, getCallNumberSync, getWhatsAppNumberSync } from '../utils/contact';

const SupportScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const profileStr = await AsyncStorage.getItem('userProfile');
            if (profileStr) setUser(JSON.parse(profileStr));
        };
        loadUser();
    }, []);

    const handleWhatsApp = () => {
        const num = getWhatsAppNumberSync(user);
        openWhatsApp(num, "Hi, I need support with Leadito.");
    };

    const handleCall = () => {
        const num = getCallNumberSync(user);
        makeCall(num);
    };

    const handleBookCall = () => {
        const num = getWhatsAppNumberSync(user);
        openWhatsApp(num, "Hi, I would like to book a call with your support team to discuss my account.");
    };

    const SupportAction = ({ title, subtitle, icon, iconType, color, onPress }) => (
        <TouchableOpacity style={styles.actionCard} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                {iconType === 'FontAwesome5' && <FontAwesome5 name={icon} size={20} color={color} />}
                {iconType === 'Feather' && <Feather name={icon} size={22} color={color} />}
                {iconType === 'Ionicons' && <Ionicons name={icon} size={24} color={color} />}
                {iconType === 'MaterialCommunityIcons' && <MaterialCommunityIcons name={icon} size={24} color={color} />}
            </View>
            <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>{title}</Text>
                <Text style={styles.actionSubtitle}>{subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper statusBarColor="#7B61FF">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Support Center</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroSection}>
                        <View style={styles.illustrationBox}>
                            <MaterialCommunityIcons name="headset-customer-service" size={80} color="#7B61FF" />
                        </View>
                        <Text style={styles.heroTitle}>How can we help you?</Text>
                        <Text style={styles.heroSubtitle}>Our dedicated team is ready to assist you with any questions or issues.</Text>
                    </View>

                    <View style={styles.actionList}>
                        <SupportAction
                            title={`Chat with ${getContactInfo(user).TEAM}`}
                            subtitle="Instant messaging for help"
                            icon="whatsapp"
                            iconType="FontAwesome5"
                            color="#10B981"
                            onPress={handleWhatsApp}
                        />
                        <SupportAction
                            title={`Call ${getContactInfo(user).TEAM}`}
                            subtitle="Talk directly with our experts"
                            icon="phone-call"
                            iconType="Feather"
                            color="#7B61FF"
                            onPress={handleCall}
                        />
                        <SupportAction
                            title="Book a Call"
                            subtitle="Schedule a consultation at your convenience"
                            icon="calendar-check"
                            iconType="MaterialCommunityIcons"
                            color="#9F7AEA"
                            onPress={handleBookCall}
                        />
                    </View>

                    <View style={styles.faqSection}>
                        <Text style={styles.faqTitle}>Common Questions</Text>
                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>How do I upgrade my plan?</Text>
                            <Text style={styles.faqAnswer}>You can upgrade anytime from the "Plans" tab in the bottom menu.</Text>
                        </View>
                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>Can I manage multiple businesses?</Text>
                            <Text style={styles.faqAnswer}>Yes, our Growth and Premium plans support multi-business management.</Text>
                        </View>
                    </View>

                    <View style={styles.footerInfo}>
                        <Text style={styles.footerText}>Support available Mon-Sat, 10 AM - 7 PM</Text>
                        <Text style={styles.versionText}>Leadito App Version 1.0.4</Text>
                    </View>
                </ScrollView>
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
    content: {
        flex: 1,
    },
    heroSection: {
        padding: 30,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    illustrationBox: {
        marginBottom: 20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    actionList: {
        padding: 20,
        gap: 16,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
    },
    faqSection: {
        padding: 20,
        marginTop: 10,
    },
    faqTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 16,
    },
    faqItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 6,
    },
    faqAnswer: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    footerInfo: {
        padding: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 4,
    },
    versionText: {
        fontSize: 11,
        color: '#CBD5E1',
    },
});

export default SupportScreen;
