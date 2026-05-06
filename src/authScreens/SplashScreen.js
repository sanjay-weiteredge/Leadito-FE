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
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 12,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 1800);
        });
    }, [fadeAnim, scaleAnim, onFinish]);

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <Animated.View style={[
                styles.imageContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
                <Image
                    source={Images.onboarding}
                    style={styles.fullScreenImage}
                    resizeMode="cover"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        flex: 1,
        width: width,
        height: height,
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
});

export default SplashScreen;
