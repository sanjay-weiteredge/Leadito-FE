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

const TermsScreen = ({ navigation }) => {
    const terms = [
        {
            id: 1,
            title: "1. Acceptance of Terms",
            content: "By accessing or using Leadito AI services, website, or application, you agree to be bound by these Terms & Conditions."
        },
        {
            id: 2,
            title: "2. Services",
            content: "Leadito AI provides:\n• Digital advertising services (Meta/Facebook/Instagram)\n• Lead generation campaigns\n• Creative support (images, videos, ad creatives)\n• Access to app/dashboard for performance tracking"
        },
        {
            id: 3,
            title: "3. Payment Terms",
            content: "• All services are offered under a mandatory 3-month commitment\n• Clients must pay ₹15,000 upfront (₹5,000/month equivalent)\n• OR\n• If any other plan is selected, the client must still agree to a minimum 3-month commitment\n• Payments must be made in advance before service activation"
        },
        {
            id: 4,
            title: "4. Lead Generation & Performance Disclaimer",
            content: "• Leadito AI provides advertising services with the objective of generating leads\n• We commit to running and optimizing campaigns using proven strategies\n• However, lead quantity and quality may vary depending on:\n  - Business niche\n  - Market demand\n  - Competition\n  - Platform performance\n• Therefore, we do not guarantee a fixed number of leads"
        },
        {
            id: 5,
            title: "5. No Guarantee of Sales / Revenue / ROI",
            content: "Leadito AI does not guarantee:\n• Sales\n• Revenue\n• Conversions or closings\n• Return on Investment (ROI)\n\nResults depend on:\n• Client’s pricing and offer\n• Follow-up and sales process\n• Market conditions\n• Customer behavior"
        },
        {
            id: 6,
            title: "6. Client Responsibilities",
            content: "Clients agree to:\n• Provide accurate business information\n• Respond to leads promptly\n• Maintain proper follow-up\n• Provide required access (ad accounts, assets)\n• Cooperate during campaign execution\n\nFailure to do so may impact results."
        },
        {
            id: 7,
            title: "7. Social Media & Ad Account Access",
            content: "• Clients must provide authorized access (e.g., Meta Business Manager permissions)\n• We do not request login passwords\n• Access is used strictly for campaign management and optimization"
        },
        {
            id: 8,
            title: "8. Ad Platform Policies",
            content: "• Ads are subject to third-party platform policies (Meta/Facebook/Instagram)\n• Ads may be rejected, delayed, or restricted\n• We will attempt to:\n  - Modify ads\n  - Resubmit campaigns\n• Final approval is controlled by the platform, not Leadito AI"
        },
        {
            id: 9,
            title: "9. Ad Spend",
            content: "• Advertising budget is separate from service fee\n• Clients are responsible for funding ad spend directly\n• Leadito AI is not responsible for ad platform charges"
        },
        {
            id: 10,
            title: "10. Cancellation Policy",
            content: "• Minimum commitment is 3 months\n• Early cancellation is not allowed\n• No refunds after service initiation"
        },
        {
            id: 11,
            title: "11. Limitation of Liability",
            content: "Leadito AI is not responsible for:\n• Business losses\n• Revenue loss\n• Ad performance fluctuations\n• Platform changes or restrictions\n• External market conditions"
        },
        {
            id: 12,
            title: "12. Termination",
            content: "We reserve the right to terminate services if:\n• Client violates policies\n• Non-cooperation\n• Misuse or abusive behavior"
        },
        {
            id: 13,
            title: "13. Intellectual Property",
            content: "All creatives and materials remain the property of Leadito AI unless otherwise agreed."
        },
        {
            id: 14,
            title: "14. Changes to Terms",
            content: "We may update these Terms at any time. Continued use implies acceptance."
        },
        {
            id: 15,
            title: "15. Governing Law",
            content: "These Terms shall be governed by the laws of India."
        }
    ];

    return (
        <ScreenWrapper statusBarColor="#7B61FF">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Terms & Conditions</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentCard}>
                        <Text style={styles.lastUpdated}>Effective Date: April 30, 2026</Text>

                        {terms.map((item) => (
                            <View key={item.id} style={styles.section}>
                                <Text style={styles.sectionTitle}>{item.title}</Text>
                                <Text style={styles.sectionText}>{item.content}</Text>
                            </View>
                        ))}

                        <View style={styles.footerContact}>
                            <Text style={styles.contactTitle}>Questions about our Terms?</Text>
                            <Text style={styles.contactDesc}>
                                If you have any questions regarding these Terms and Conditions, please contact our support team.
                            </Text>
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
    footerContact: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        alignItems: 'center',
    },
    contactTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 8,
    },
    contactDesc: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default TermsScreen;
