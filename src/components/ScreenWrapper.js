import React from 'react';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, style, backgroundColor = '#fff', bottomSafe = true, topSafe = true }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor,
                paddingTop: topSafe ? insets.top : 0,
                paddingBottom: bottomSafe ? insets.bottom + 20 : 20,
            },
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ScreenWrapper;
