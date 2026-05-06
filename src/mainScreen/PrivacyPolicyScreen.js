import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';

const PrivacyPolicyScreen = ({ navigation }) => {
    const policies = [
        {
            id: 1,
            title: "1. Introduction",
            content: "This Privacy Policy explains how Leadito AI (“we”, “our”, “us”) collects, uses, stores, and protects your information when you use our services, website, or application (“Services”). By using our Services, you agree to this Privacy Policy."
        },
        {
            id: 2,
            title: "2. Information We Collect",
            content: "a) Personal Information\nWe may collect:\n• Name\n• Phone number\n• Email address\n• Business name and details\n• Billing and payment information\n\nb) Usage Data\nWe may collect:\n• Device information (IP address, browser type, device type)\n• App usage data (logins, activity, interactions)\n• Campaign performance data\n\nc) Lead Data\nWe may collect and process:\n• Information of leads generated through advertising campaigns\n• CRM-related data used within our platform"
        },
        {
            id: 3,
            title: "3. How We Use Your Information",
            content: "We use your information to:\n• Provide and manage our services\n• Run and optimize advertising campaigns\n• Create and manage marketing content\n• Communicate with you (updates, reports, support)\n• Improve our platform and services\n• Process payments"
        },
        {
            id: 4,
            title: "4. Social Media Account Access",
            content: "• To provide our services, we may require access to your social media accounts, including Facebook and Instagram.\n• Clients must provide authorized access (such as Meta Business Manager permissions).\n• We do not request or store personal login passwords.\n• Access is used strictly for campaign management and optimization."
        },
        {
            id: 5,
            title: "5. Advertising & Platform Dependencies",
            content: "• Our services depend on third-party platforms such as Meta (Facebook/Instagram).\n• Ad performance and approvals are subject to their policies.\n• We use your data to optimize campaigns on these platforms."
        },
        {
            id: 6,
            title: "6. Data Sharing",
            content: "• We do not sell or misuse your personal data.\n• We may share information with trusted third parties (Meta, Payment providers, Hosting).\n• All parties are required to maintain confidentiality."
        },
        {
            id: 7,
            title: "7. Data Protection & Security",
            content: "• We implement technical measures to protect your data.\n• We restrict unauthorized access.\n• However, no system can guarantee 100% security."
        },
        {
            id: 8,
            title: "8. Data Retention",
            content: "• We retain your data as long as necessary to provide services.\n• Some data may be retained for legal or analytical purposes.\n• You may request deletion of your data."
        },
        {
            id: 9,
            title: "9. User Rights",
            content: "You have the right to:\n• Access your data\n• Request correction\n• Request deletion\n• Withdraw consent\n\nRequests can be made through our support contact."
        },
        {
            id: 10,
            title: "10. Client Responsibility",
            content: "• Clients must provide accurate information.\n• Clients must grant required permissions.\n• Revoking access may impact service delivery."
        },
        {
            id: 11,
            title: "11. Third-Party Platforms",
            content: "• We are not responsible for the privacy practices of third-party platforms like Meta.\n• Users are encouraged to review their specific policies."
        },
        {
            id: 12,
            title: "12. Children’s Privacy",
            content: "• Our services are not intended for individuals under 18 years of age.\n• We do not knowingly collect data from minors."
        },
        {
            id: 13,
            title: "13. Changes to this Policy",
            content: "• We may update this Privacy Policy at any time.\n• Updates will be posted on this page."
        },
        {
            id: 14,
            title: "14. Contact Us",
            content: "For any privacy-related queries, please contact our support team through the Support Center."
        }
    ];

    return (
        <ScreenWrapper statusBarColor="#7B61FF">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentCard}>
                        <Text style={styles.lastUpdated}>Effective Date: April 30, 2026</Text>

                        {policies.map((item) => (
                            <View key={item.id} style={styles.section}>
                                <Text style={styles.sectionTitle}>{item.title}</Text>
                                <Text style={styles.sectionText}>{item.content}</Text>
                            </View>
                        ))}

                        <View style={styles.footerNote}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
                            <Text style={styles.footerText}>Your privacy and data security are our top priorities.</Text>
                        </View>
                    </View>
                    <View style={{ height: 40 }} />
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentCard: {
        margin: 16,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    lastUpdated: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    footerNote: {
        marginTop: 20,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        alignItems: 'center',
        gap: 10,
    },
    footerText: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default PrivacyPolicyScreen;
