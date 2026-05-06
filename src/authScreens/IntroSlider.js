import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Image,
    SafeAreaView,
    ImageBackground,
} from 'react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Images from '../components/image';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Get More Leads for Your Business',
        highlight: 'Leads',
        description: 'Generate high-quality leads using proven ad strategies and AI-powered optimization.',
        image: Images.introSlider,
    },
    {
        id: '2',
        title: 'We Handle Everything for You',
        highlight: 'Everything',
        description: 'We create, run and optimize campaigns that bring you high-quality leads.',
        items: [
            { icon: 'bullseye-arrow', title: 'Ad Campaign Setup', desc: 'Strategic campaign creation and setup', color: '#7B61FF' },
            { icon: 'account-group', title: 'Targeted Audience Reach', desc: 'Reach the right people who are interested', color: '#9F7AEA' },
            { icon: 'pencil', title: 'Creative Design & Copy', desc: 'High-converting ads that get results', color: '#F59E0B' },
            { icon: 'chart-line', title: 'Lead Tracking System', desc: 'Track and manage every lead in one place', color: '#10B981' }
        ]
    },
    {
        id: '3',
        title: 'Track Everything in One Dashboard',
        highlight: 'Dashboard',
        description: 'Monitor leads, follow-ups, appointments and ROI in real time.',
        image: Images.introSlider2,
    },
    {
        id: '4',
        title: 'Start Getting Leads in the Next 7 Days',
        highlight: 'Next 7 Days',
        description: 'Join businesses already growing with Leadito AI.',
        image: Images.introSlider1,
        isLast: true
    }
];

const IntroSlider = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const insets = useSafeAreaInsets();

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current.scrollToIndex({
                index: currentIndex + 1,
                animated: true
            });
        } else {
            navigation.replace('Login');
        }
    };


    const renderSlide = ({ item, index }) => {
        const titleParts = item.title.split(item.highlight);

        // Special rendering for Image Slides (Slides 1, 3, and 4)
        if (index === 0 || index === 2 || index === 3) {
            return (
                <View style={styles.slide}>
                    <View style={styles.contentContainer}>
                        <View style={styles.textSection}>
                            <Text style={styles.title}>
                                {titleParts[0]}
                                <Text style={styles.highlightText}>{item.highlight}</Text>
                                {titleParts[1] || ''}
                            </Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                        <View style={styles.imageFullContainer}>
                            <Image
                                source={item.image}
                                style={styles.fullSlideImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.slide}>
                <View style={styles.contentContainer}>
                    <View style={styles.textSection}>
                        <Text style={styles.title}>
                            {titleParts[0]}
                            <Text style={styles.highlightText}>{item.highlight}</Text>
                            {titleParts[1] || ''}
                        </Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>

                    <View style={styles.illustrationSection}>
                        {index === 1 && renderSlide2(item.items || [])}
                    </View>
                </View>
            </View>
        );
    };

    const renderSlide2 = (items) => (
        <View style={styles.listContainer}>
            {(items || []).map((item, i) => (
                <View key={i} style={styles.listItem}>
                    <View style={[styles.listItemIcon, { backgroundColor: item.color }]}>
                        <MaterialCommunityIcons name={item.icon} size={18} color="#fff" />
                    </View>
                    <View style={styles.listItemText}>
                        <Text style={styles.listItemTitle}>{item.title}</Text>
                        <Text style={styles.listItemDesc}>{item.desc}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.contentWrapper}>
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    renderItem={renderSlide}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => {
                        const offset = e.nativeEvent.contentOffset.x;
                        const index = Math.round(offset / width);
                        setCurrentIndex(index);
                    }}
                    keyExtractor={(item) => item.id}
                />

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + verticalScale(20), verticalScale(50)) }]}>
                    <View style={styles.footerTop}>
                        <View style={styles.dotsContainer}>
                            {SLIDES.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        currentIndex === i ? styles.activeDot : styles.inactiveDot
                                    ]}
                                />
                            ))}
                        </View>

                    </View>

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentWrapper: {
        flex: 1,
    },
    footerTop: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    slide: {
        width: width,
        flex: 1,
        paddingHorizontal: scale(24),
    },
    contentContainer: {
        alignItems: 'center',
        paddingTop: verticalScale(10),
        flex: 1,
        justifyContent: 'center',
    },
    textSection: {
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    title: {
        fontSize: fontSize(26),
        fontWeight: '900',
        color: '#2D1E4E',
        textAlign: 'center',
        lineHeight: fontSize(32),
        marginBottom: verticalScale(12),
    },
    highlightText: {
        color: '#7B61FF',
    },
    description: {
        fontSize: fontSize(15),
        color: '#64748B',
        textAlign: 'center',
        lineHeight: fontSize(22),
        paddingHorizontal: scale(20),
    },
    imageFullContainer: {
        flex: 1,
        width: scale(300),
        maxHeight: verticalScale(320),
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullSlideImage: {
        width: '100%',
        height: '100%',
    },
    illustrationSection: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        width: '100%',
    },
    listContent: {
        paddingBottom: verticalScale(20),
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: moderateScale(14),
        borderRadius: 18,
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    listItemIcon: {
        width: scale(44),
        height: scale(44),
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(16),
    },
    listItemText: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: fontSize(15),
        fontWeight: 'bold',
        color: '#2D1E4E',
    },
    listItemDesc: {
        fontSize: fontSize(12),
        color: '#64748B',
        marginTop: 2,
    },

    footer: {
        paddingHorizontal: scale(24),
        paddingBottom: verticalScale(30),
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: scale(8),
        height: scale(8),
        borderRadius: 4,
        marginHorizontal: scale(4),
    },
    activeDot: {
        backgroundColor: '#7B61FF',
        width: scale(28),
    },
    inactiveDot: {
        backgroundColor: '#E2E8F0',
    },
    nextButton: {
        backgroundColor: '#7B61FF',
        height: verticalScale(56),
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: fontSize(18),
        fontWeight: 'bold',
        marginRight: 10,
    },

});

export default IntroSlider;
