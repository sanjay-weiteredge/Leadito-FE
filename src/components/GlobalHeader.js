import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GlobalHeader = ({ showNotification = true, onNotificationPress }) => {
    return (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                    <Ionicons name="checkmark-done-sharp" size={20} color="#fff" />
                </View>
                <Text style={styles.logoText}>
                    Leadito <Text style={[styles.logoText, { color: '#4CAF50' }]}>AI</Text>
                </Text>
            </View>

            {showNotification && (
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onNotificationPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            )}
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
    logoIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#0047AB',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0D1B3E',
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
    },
});

export default GlobalHeader;
