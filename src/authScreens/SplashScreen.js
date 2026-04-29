import React, { useEffect, useRef } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
    Dimensions,
} from 'react-native';
import Images from '../components/image';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 2,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Small delay before notifying parent to transition
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 1500);
        });
    }, [fadeAnim, scaleAnim, onFinish]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <Animated.View style={[
                styles.logoContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
                {/* Logo image imported via image.js */}
                <Image
                    source={Images.logo}
                    style={styles.logoImage}
                    resizeMode="contain"
                />

            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: width,
        height: height * 0.4,
    },
});

export default SplashScreen;
