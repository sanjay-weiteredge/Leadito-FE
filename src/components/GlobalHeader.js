import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import notificationService from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GlobalHeader = ({ showNotification = true, onNotificationPress, showSupport = false, onSupportPress }) => {
    const navigation = useNavigation();
    const [unreadCount, setUnreadCount] = React.useState(0);

    const fetchHeaderData = React.useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            if (token && showNotification) {
                const data = await notificationService.listNotifications();
                const count = data.filter(n => !n.isRead).length;
                setUnreadCount(count);
            }
        } catch (e) {
            console.log('Error fetching header data:', e);
        }
    }, [showNotification]);

    useFocusEffect(
        React.useCallback(() => {
            fetchHeaderData();
        }, [fetchHeaderData])
    );

    const handleNotifPress = () => {
        if (onNotificationPress) {
            onNotificationPress();
        } else {
            navigation.navigate('Notifications');
        }
    };

    const handleSuppPress = () => {
        if (onSupportPress) {
            onSupportPress();
        } else {
            navigation.navigate('Support');
        }
    };
    return (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assessts/Leadito Logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
                <Text style={styles.logoText}>
                    Leadito <Text style={styles.logoAI}>AI</Text>
                </Text>
            </View>

            <View style={styles.headerRight}>
                {showSupport && (
                    <TouchableOpacity
                        style={[styles.iconButton, { marginRight: 10 }]}
                        onPress={handleSuppPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="headset-outline" size={24} color="#333" />
                    </TouchableOpacity>
                )}

                {showNotification && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleNotifPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 36,
        height: 36,
        marginRight: 8,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2D1E4E',
    },
    logoAI: {
        fontSize: 20,
        fontWeight: '700',
        color: '#7B61FF',
    },
    headerRight: {
        flexDirection: 'row',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#EF4444',
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
        paddingHorizontal: 3,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
});

export default GlobalHeader;
