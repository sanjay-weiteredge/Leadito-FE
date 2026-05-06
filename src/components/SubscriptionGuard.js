import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../context/SubscriptionContext';

const { width } = Dimensions.get('window');

const SubscriptionGuard = ({
    children,
    message = "Subscription Expired",
    subMessage = "Renew now to continue accessing your leads and ad results.",
    type = 'overlay', // 'overlay' or 'inline'
    lockLeads = false,
    disabled = false
}) => {
    const { isActive: contextActive } = useSubscription();
    const navigation = useNavigation();

    const isActive = contextActive || disabled;

    if (isActive) {
        return children;
    }

    if (type === 'inline') {
        return (
            <View style={styles.inlineContainer}>
                <View style={styles.iconContainerSmall}>
                    <Ionicons name="lock-closed" size={24} color="#7B61FF" />
                </View>
                <Text style={styles.inlineTitle}>{message}</Text>
                <TouchableOpacity
                    style={styles.inlineButton}
                    onPress={() => navigation.navigate('Plans')}
                >
                    <Text style={styles.inlineButtonText}>Unlock Now</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.blurredContent} pointerEvents="none">
                {children}
            </View>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed" size={40} color="#7B61FF" />
                    </View>
                    <Text style={styles.title}>{message}</Text>
                    <Text style={styles.subTitle}>{subMessage}</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Plans')}
                    >
                        <Text style={styles.buttonText}>Renew Now to Access</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    blurredContent: {
        flex: 1,
        opacity: 0.3,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 1000,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#F3E8FF',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginBottom: 10,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
    },
    button: {
        backgroundColor: '#7B61FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 16,
        gap: 10,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Inline Styles
    inlineContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginVertical: 10,
    },
    iconContainerSmall: {
        width: 48,
        height: 48,
        backgroundColor: '#F3E8FF',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    inlineTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 15,
        textAlign: 'center',
    },
    inlineButton: {
        backgroundColor: '#7B61FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    inlineButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    }
});

export default SubscriptionGuard;
