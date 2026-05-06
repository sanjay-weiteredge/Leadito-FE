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

const WorkProcessScreen = ({ navigation }) => {
    const processes = [
        {
            id: 1,
            title: "1. Payment & App Access (Within 24 Hours)",
            content: "Once payment is completed, you will receive:\n• Access to the Leadito AI app/dashboard\n• Onboarding instructions\n\nApp access is provided within 24 hours."
        },
        {
            id: 2,
            title: "2. Business Research & Strategy Planning",
            content: "Our team performs detailed research on:\n• Your business model\n• Target audience\n• Offer and pricing\n• Market competition\n\nUsing our experience + AI tools, we create:\n• Campaign strategy\n• Funnel plan\n• Targeting approach"
        },
        {
            id: 3,
            title: "3. Account Setup & Access",
            content: "If you already have accounts:\nWe request authorized access to:\n• Facebook (Meta) Business Manager\n• Instagram account\n• Ad account\n\nIf you do NOT have accounts:\nWe will assist in setting up:\n• Facebook account\n• Instagram account\n• Facebook Page\n• Meta Ads account\n\n👉 Complete setup will be handled by our team with your approval."
        },
        {
            id: 4,
            title: "4. Creative Development & Copywriting",
            content: "We create:\n• Ad creatives (images/videos)\n• Ad copy (headlines, captions, hooks)\n\nEverything is customized based on:\n• Your niche\n• Audience behavior\n• Market trends"
        },
        {
            id: 5,
            title: "5. Campaign Setup",
            content: "We configure:\n• Ad campaigns\n• Target audience\n• Budget structure\n• Lead capture system\n\nFull setup is completed before launch."
        },
        {
            id: 6,
            title: "6. Ad Budget (Client Responsibility)",
            content: "Advertising budget is separate from service fee.\nClients can add budget:\n• Weekly\n• Monthly\n• Or continuously\n\nImportant:\nAds will run only when budget is available.\nIf budget is not added or gets exhausted:\n• Campaigns will pause\n• Lead generation will stop\n\nLeadito AI is not responsible for interruptions due to lack of ad budget."
        },
        {
            id: 7,
            title: "7. Campaign Launch",
            content: "Once setup is complete and budget is added:\nAds are launched on Facebook & Instagram (Meta platforms)."
        },
        {
            id: 8,
            title: "8. Ad Approval & Testing Phase (2–7 Days)",
            content: "Ads go through platform review.\nApproval timelines depend on:\n• Platform policies\n• Account history\n\n👉 Typically: 2 to 7 days for stable performance.\nAds may be:\n• Approved\n• Rejected\n• Delayed\n\nWe will list issues, modify ads, and resubmit campaigns as needed."
        },
        {
            id: 9,
            title: "9. Optimization Phase",
            content: "Campaigns are continuously:\n• Monitored\n• Optimized\n• Improved\n\nPoor-performing ads are replaced, and high-performing ads are scaled."
        },
        {
            id: 10,
            title: "10. Lead Generation",
            content: "Leads are generated through ads.\nLeads are shared via:\n• WhatsApp\n• CRM\n• App Dashboard"
        },
        {
            id: 11,
            title: "11. Client Responsibility (Very Important)",
            content: "Client must:\n• Respond to leads quickly\n• Follow up consistently\n• Convert leads into customers\n\n👉 Leadito AI is responsible for lead generation, not sales closing."
        },
        {
            id: 12,
            title: "12. Continuous Improvement",
            content: "Campaigns are improved based on:\n• Performance data\n• Market response\n• Testing insights"
        },
        {
            id: 13,
            title: "13. Platform Dependency",
            content: "Ads depend on third-party platforms (Meta).\nAds may:\n• Be rejected\n• Be restricted\n• Be delayed\n\nResolution time is controlled by the platform."
        },
        {
            id: 14,
            title: "14. Timeline Expectations",
            content: "• Setup: 2–5 days\n• Ad approval & stabilization: 2–7 days\n• Performance improves over time with optimization\n\n👉 Results vary based on:\n• Niche\n• Budget\n• Market demand"
        },
        {
            id: 15,
            title: "15. Service Commitment",
            content: "Minimum service duration: 3 months\nBreakdown:\n• Month 1: Testing\n• Month 2: Optimization\n• Month 3: Scaling"
        }
    ];

    return (
        <ScreenWrapper statusBarColor="#7B61FF">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>How It Works</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.introCard}>
                        <Text style={styles.introTitle}>LEADITO AI – WORK PROCESS</Text>
                        <Text style={styles.introText}>
                            At Leadito AI, we follow a structured system to set up, launch, and optimize lead generation campaigns for your business.
                        </Text>
                    </View>

                    <View style={styles.contentCard}>
                        {processes.map((item) => (
                            <View key={item.id} style={styles.section}>
                                <Text style={styles.sectionTitle}>{item.title}</Text>
                                <Text style={styles.sectionText}>{item.content}</Text>
                            </View>
                        ))}

                        <View style={styles.footerNote}>
                            <Ionicons name="information-circle-outline" size={24} color="#7B61FF" />
                            <Text style={styles.footerText}>
                                Final Note: By using Leadito AI services, the client acknowledges and agrees to this work process and understands that results improve over time through testing, optimization, and consistent execution.
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
    introCard: {
        margin: 16,
        marginBottom: 0,
        padding: 20,
        backgroundColor: '#7B61FF',
        borderRadius: 20,
        alignItems: 'center',
    },
    introTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    introText: {
        fontSize: 14,
        color: '#F8FAFC',
        textAlign: 'center',
        lineHeight: 20,
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
        gap: 12,
    },
    footerText: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 20,
    },
});

export default WorkProcessScreen;
