import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert as RNAlert } from 'react-native';

let globalSetConfig = null;

export const SweetAlertProvider = () => {
    const [config, setConfig] = useState({
        show: false,
        title: '',
        message: '',
        showCancelButton: false,
        showConfirmButton: true,
        cancelText: 'Cancel',
        confirmText: 'OK',
        onConfirm: null,
        onCancel: null,
        confirmColor: '#7B61FF',
        cancelColor: '#F1F5F9',
        cancelTextColor: '#475569',
        iconName: 'information-circle',
        iconColor: '#7B61FF',
    });

    // Store the global reference
    globalSetConfig = setConfig;

    const closeAlert = () => {
        setConfig(prev => ({ ...prev, show: false }));
    };

    const handleConfirm = () => {
        if (config.onConfirm) config.onConfirm();
        closeAlert();
    };

    const handleCancel = () => {
        if (config.onCancel) config.onCancel();
        closeAlert();
    };

    // Auto-detect error or success icons from titles
    const inferIcon = () => {
        const titleUpper = config.title?.toUpperCase() || '';
        if (titleUpper.includes('SUCCESS')) return { name: 'checkmark-circle', color: '#10B981' };
        if (titleUpper.includes('ERROR') || titleUpper.includes('FAIL')) return { name: 'close-circle', color: '#EF4444' };
        if (titleUpper.includes('WARNING') || titleUpper.includes('NOTICE')) return { name: 'warning', color: '#F59E0B' };
        if (titleUpper.includes('LOGOUT')) return { name: 'log-out', color: '#EF4444' };
        return { name: config.iconName, color: config.iconColor }; // Default
    };

    const displayIcon = inferIcon();

    return (
        <Modal
            transparent={true}
            visible={config.show}
            animationType="fade"
            onRequestClose={closeAlert}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Ionicons name={displayIcon.name} size={64} color={displayIcon.color} style={styles.icon} />

                    {config.title ? <Text style={styles.title}>{config.title}</Text> : null}

                    {config.message ? <Text style={styles.message}>{config.message}</Text> : null}

                    <View style={styles.buttonContainer}>
                        {config.showCancelButton && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelBtn, { backgroundColor: config.cancelColor }]}
                                onPress={handleCancel}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.buttonText, { color: config.cancelTextColor }]}>{config.cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        {config.showConfirmButton && (
                            <TouchableOpacity
                                style={[styles.button, styles.confirmBtn, { backgroundColor: config.confirmColor }]}
                                onPress={handleConfirm}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.buttonText, { color: '#fff' }]}>{config.confirmText}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const showSweetAlert = (title, message, options = {}) => {
    if (globalSetConfig) {
        globalSetConfig({
            show: true,
            title: title || '',
            message: message || '',
            showCancelButton: options.showCancelButton || false,
            showConfirmButton: options.showConfirmButton !== false, // default true
            cancelText: options.cancelText || 'Cancel',
            confirmText: options.confirmText || 'OK',
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null,
            confirmColor: options.confirmColor || '#7B61FF',
            cancelColor: options.cancelColor || '#F1F5F9',
            cancelTextColor: options.cancelTextColor || '#475569',
            iconName: options.iconName || 'information-circle',
            iconColor: options.iconColor || '#7B61FF',
        });
    } else {
        // Fallback
        let buttons = [];
        if (options.showCancelButton) {
            buttons.push({ text: options.cancelText || 'Cancel', onPress: options.onCancel, style: 'cancel' });
        }
        buttons.push({ text: options.confirmText || 'OK', onPress: options.onConfirm });
        RNAlert.alert(title, message, buttons);
    }
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // Nice dark overlay
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertBox: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 12,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100,
    },
    cancelBtn: {
        flex: 1,
    },
    confirmBtn: {
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: 'bold',
    }
});
