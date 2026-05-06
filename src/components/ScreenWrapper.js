import React from 'react';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, style, backgroundColor = '#fff', statusBarColor, bottomSafe = true, topSafe = true }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: statusBarColor || backgroundColor }}>
            {topSafe && <View style={{ height: insets.top }} />}
            <View style={[
                styles.container,
                {
                    backgroundColor: backgroundColor,
                    paddingBottom: bottomSafe ? insets.bottom + 10 : 0,
                },
                style
            ]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ScreenWrapper;
