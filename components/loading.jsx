import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useFonts, Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { useEffect, useRef } from 'react';

const { width: W, height: H } = Dimensions.get('window');
const LINE_WIDTH = W * 0.65;
const CIRCLE_SIZE = Math.sqrt(W * W + H * H) * 2;

export default function Loading({ onDone }) {
    const [fontsLoaded] = useFonts({ Bangers_400Regular, Fredoka_700Bold });

    const circleScale = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const xScales = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    const lineW = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!fontsLoaded) return;

        Animated.timing(circleScale, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            Animated.stagger(160, xScales.map(scale =>
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 4,
                    tension: 120,
                    useNativeDriver: true,
                })
            )).start(() => {
                Animated.timing(lineW, {
                    toValue: LINE_WIDTH,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }).start(() => {
                    setTimeout(() => {
                        Animated.parallel([
                            Animated.timing(fadeAnim, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                            Animated.timing(circleScale, {
                                toValue: 0,
                                duration: 600,
                                easing: Easing.in(Easing.cubic),
                                useNativeDriver: true,
                            }),
                        ]).start(() => onDone?.());
                    }, 400);
                });
            });
        });
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.circle, { transform: [{ scale: circleScale }] }]}
                pointerEvents="none"
            />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={styles.title}>Super TaTeTi </Text>
                </View>
                <View style={styles.xRow}>
                    {xScales.map((scale, i) => (
                        <Animated.View key={i} style={[styles.xContainer, { transform: [{ scale }] }]}>
                            <Text style={styles.xanimation}>X</Text>
                        </Animated.View>
                    ))}
                    <View style={styles.lineContainer} pointerEvents="none">
                        <Animated.View style={[styles.line, { width: lineW }]} />
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: '#6c47ff',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 52,
        fontFamily: 'Bangers_400Regular',
        color: '#ffffff',
        letterSpacing: 4,
        paddingRight: 4,
        right: -8,
        textAlign: 'center',
        marginBottom: 16,
    },
    xRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    xContainer: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    xanimation: {
        fontSize: 72,
        fontFamily: 'Fredoka_700Bold',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 80,
    },
    lineContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    line: {
        height: 6,
        backgroundColor: '#ffffff',
        borderRadius: 3,
    },
});

