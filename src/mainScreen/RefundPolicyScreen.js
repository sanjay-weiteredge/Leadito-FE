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

const RefundPolicyScreen = ({ navigation }) => {
    const policies = [
        {
            id: 1,
            title: "1. Overview",
            content: "This Refund Policy explains the conditions under which payments made to Leadito are refundable. By purchasing our services, you agree to this policy."
        },
        {
            id: 2,
            title: "2. No Refund After Service Initiation",
            content: "All payments are non-refundable once the service has started. Service is considered started when any of the following occurs:\n• Campaign setup has begun\n• Advertising creatives have been created\n• Ad account access has been requested or granted\n• Dashboard/app access has been provided"
        },
        {
            id: 3,
            title: "3. Mandatory 3-Month Commitment",
            content: "• All services are provided under a minimum 3-month commitment\n• Clients agree to complete the full duration at the time of purchase\n• Early cancellation or discontinuation does not qualify for any refund"
        },
        {
            id: 4,
            title: "4. No Refund Based on Performance",
            content: "Leadito provides advertising and lead generation services. We do not guarantee:\n• Sales\n• Revenue\n• Conversions or closings\n• Return on Investment (ROI)\n\nDissatisfaction based on performance is not a valid reason for refund."
        },
        {
            id: 5,
            title: "5. Lead Generation Understanding",
            content: "We aim to generate leads using advertising strategies. However, lead quantity and quality may vary depending on:\n• Business niche\n• Market demand\n• Competition\n• Performance"
        },
        {
            id: 6,
            title: "6. Ad Spend Policy",
            content: "• Advertising budget is separate from service fee\n• Clients are responsible for funding ad spend directly on advertising platforms (e.g., Meta)\n• Leadito does not control or refund any ad platform charges"
        },
        {
            id: 7,
            title: "7. Limited Exception (Before Service Start Only)",
            content: "Refund requests may be considered only if:\n• Service has NOT started\n• AND Request is made within 24 hours of payment\n\nAll such requests are reviewed and approved at our sole discretion."
        },
        {
            id: 8,
            title: "8. Non-Refundable Situations",
            content: "Refunds will not be provided in the following cases:\n• Change of mind after purchase\n• Delay in client communication or response\n• Poor lead handling or follow-up by client\n• Business performance issues\n• Failure to provide required access or information\n• Ad account restrictions or platform-related issues"
        },
        {
            id: 9,
            title: "9. Ad Platform Issues & Delays",
            content: "• Our services depend on third-party platforms such as Meta (Facebook/Instagram).\n• Ads or accounts may be rejected, restricted, disabled, or delayed.\n• These actions are controlled by the platform.\n• Resolution timelines depend on the platform and are not under our control.\n• Platform-related delays or issues do not qualify for refunds."
        },
        {
            id: 10,
            title: "10. Issue Resolution",
            content: "If any issue arises, clients should contact support. We will make reasonable efforts to resolve concerns through optimization and adjustments. Refunds will not be issued in place of service improvements."
        },
        {
            id: 11,
            title: "11. Chargebacks",
            content: "Initiating a chargeback without contacting support first is considered a violation of this policy. We reserve the right to suspend services and take necessary action."
        },
        {
            id: 12,
            title: "12. Agreement",
            content: "By making a payment, the client confirms that they have read and understood this Refund Policy, agree to the 3-month commitment, and accept the non-refundable nature of the service after initiation."
        }
    ];

    return (
        <ScreenWrapper statusBarColor="#7B61FF">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Refund Policy</Text>
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
                            <Ionicons name="information-circle-outline" size={24} color="#7B61FF" />
                            <Text style={styles.footerText}>Please review this policy before making any payments.</Text>
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

export default RefundPolicyScreen;
