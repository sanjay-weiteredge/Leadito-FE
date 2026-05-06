import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import notificationService from '../services/notificationService';

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.listNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'lead_created':
                return { name: 'person-add', color: '#7B61FF', bg: '#F3E8FF' };
            case 'status_changed':
                return { name: 'swap-horizontal', color: '#10B981', bg: '#ECFDF5', isIonicons: true };
            case 'new_report':
                return { name: 'file-chart-outline', color: '#9F7AEA', bg: '#F3E8FF' };
            case 'payment':
                return { name: 'card-outline', color: '#F59E0B', bg: '#FEF3C7', isIonicons: true };
            default:
                return { name: 'notifications', color: '#64748B', bg: '#F8FAFC', isIonicons: true };
        }
    };

    const renderItem = ({ item }) => {
        const icon = getIcon(item.type);
        return (
            <TouchableOpacity
                style={[styles.notifCard, !item.isRead && styles.unreadCard]}
                onPress={() => item.isRead ? null : handleMarkAsRead(item.id)}
            >
                <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
                    {icon.isIonicons ? (
                        <Ionicons name={icon.name} size={20} color={icon.color} />
                    ) : (
                        <MaterialCommunityIcons name={icon.name} size={20} color={icon.color} />
                    )}
                </View>
                <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                        <Text style={[styles.notifTitle, !item.isRead && styles.unreadText]}>{item.title}</Text>
                        {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage}>{item.message}</Text>
                    <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Notifications</Text>
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#7B61FF" />
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Feather name="bell-off" size={60} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Notifications</Text>
                                <Text style={styles.emptySubtitle}>We'll notify you when something important happens.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: {
        padding: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    markAllText: {
        fontSize: 12,
        color: '#7B61FF',
        fontWeight: '600',
    },
    list: {
        paddingVertical: 10,
    },
    notifCard: {
        flexDirection: 'row',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    unreadCard: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D1E4E',
        flex: 1,
    },
    unreadText: {
        color: '#0F172A',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#7B61FF',
        marginLeft: 8,
    },
    notifMessage: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
        marginBottom: 8,
    },
    notifTime: {
        fontSize: 11,
        color: '#94A3B8',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D1E4E',
        marginTop: 15,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
});

export default NotificationsScreen;
