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
    ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Images from '../components/image';

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
            { icon: 'bullseye-arrow', title: 'Ad Campaign Setup', desc: 'Strategic campaign creation and setup', color: '#2563EB' },
            { icon: 'account-group', title: 'Targeted Audience Reach', desc: 'Reach the right people who are interested', color: '#3B82F6' },
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

    const handleSkip = () => {
        navigation.replace('Login');
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
                        <MaterialCommunityIcons name={item.icon} size={20} color="#fff" />
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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SafeAreaView style={styles.safeArea}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

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

                <View style={styles.footer}>
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

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>


                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    skipText: {
        color: '#2563EB',
        fontSize: 16,
        fontWeight: '700',
    },
    slide: {
        width: width,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        paddingTop: 80,
    },
    textSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0D2141',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 16,
    },
    highlightText: {
        color: '#2563EB',
    },
    description: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    imageFullContainer: {
        width: width * 0.9,
        height: height * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullSlideImage: {
        width: '100%',
        height: '100%',
    },
    illustrationSection: {
        height: 350,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        width: '100%',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    listItemIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    listItemText: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0D2141',
    },
    listItemDesc: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },

    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#2563EB',
        width: 28,
    },
    inactiveDot: {
        backgroundColor: '#E2E8F0',
    },
    nextButton: {
        backgroundColor: '#2563EB',
        height: 58,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },

});

export default IntroSlider;
