import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import WinnerText from './wintext';

export default function TurnIndicator({ currentPlayer, gameWinner }) {
    const pill1Anim = useRef(new Animated.Value(0)).current;
    const pill2Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(80, [
            Animated.spring(pill1Anim, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
            Animated.spring(pill2Anim, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
        ]).start();
    }, []);

    if (gameWinner) return <WinnerText winner={gameWinner} />;

    return (
        <View style={styles.turnRow}>
            {[pill1Anim, pill2Anim].map((anim, i) => {
                const p       = i === 0 ? 'X' : 'O';
                const isActive = p === currentPlayer;
                const pColor   = p === 'X' ? '#6c47ff' : '#ff4f7b';
                return (
                    <Animated.View
                        key={p}
                        style={[
                            styles.pill,
                            isActive
                                ? { borderColor: pColor, backgroundColor: `${pColor}28` }
                                : styles.pillInactive,
                            {
                                opacity: anim,
                                transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
                            },
                        ]}
                    >
                        <Text style={[styles.pillText, styles.symbol, { color: isActive ? pColor : '#3d3d5c' }]}>
                            {p}
                        </Text>
                    </Animated.View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    turnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    pill: {
        width: 56,
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    pillInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    pillText: {
        fontSize: 34,
        lineHeight: 38,
    },
    symbol: {
        fontFamily: 'Fredoka_700Bold',
    },
});
