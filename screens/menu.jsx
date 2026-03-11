import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import Popup from '../components/popup';
import { useFonts, Bangers_400Regular } from '@expo-google-fonts/bangers';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SYMBOLS = ['X', 'O'];
const PARTICLE_COUNT = 22;

function randomBetween(a, b) {
    return a + Math.random() * (b - a);
}

function Particle() {
    const symbol = SYMBOLS[Math.floor(Math.random() * 2)];
    const size = randomBetween(40, 100);
    const startX = randomBetween(0, SCREEN_W);
    const duration = randomBetween(6000, 14000);
    const delay = randomBetween(0, 8000);
    const opacity = randomBetween(0.06, 0.22);
    const rotate = randomBetween(-60, 60);

    const translateY = useRef(new Animated.Value(-60)).current;
    const spin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = () => {
            translateY.setValue(-100);
            spin.setValue(0);
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: SCREEN_H + 60,
                    duration,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(spin, {
                    toValue: 1,
                    duration,
                    delay,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) loop();
            });
        };
        loop();
    }, []);

    const spinInterpolated = spin.interpolate({
        inputRange: [0, 1],
        outputRange: [`${rotate}deg`, `${rotate + 180}deg`],
    });

    return (
        <Animated.Text
            style={{
                position: 'absolute',
                left: startX,
                fontSize: size,
                fontWeight: 'bold',
                color: symbol === 'X' ? '#6c47ff' : '#ffffff',
                opacity,
                transform: [{ translateY }, { rotate: spinInterpolated }],
            }}
        >
            {symbol}
        </Animated.Text>
    );
}

export default function Menu() {
    const particles = useRef(
        Array.from({ length: PARTICLE_COUNT }, (_, i) => i)
    ).current;
    const popupRef = useRef(null);
    const [fontsLoaded] = useFonts({ Bangers_400Regular });

    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {particles.map((i) => (
                    <Particle key={i} />
                ))}
            </View>

            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {particles.map((i) => (
                    <Particle key={i} />
                ))}
            </View>

            <TouchableOpacity style={styles.helpbtn} onPress={() => popupRef.current?.show()}>
                <Entypo name="help" size={25} color="#000000" />
            </TouchableOpacity>

            <Popup ref={popupRef} message="Es un TaTeTi, pero cada casillero tiene otro TaTeTi adentro. Ganás un casillero grande ganando el TaTeTi chico que tiene adentro. El truco es que donde tirás dentro del TaTeTi chico, ahí manda al otro a jugar en el tablero grande. Ej: Si tirás arriba a la derecha, el otro tiene que jugar en el tablero grande de arriba a la derecha. Si ese tablero ya está ganado, elegís libre. Gana quien hace TaTeTi en el tablero principal." />

            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={styles.title}>Super </Text>
                <Text style={[styles.title, { color: '#6c47ff' }]}>TaTeTi </Text>
            </View>
            <Text style={styles.subtitle}>El Tic-Tac-Toe definitivo</Text>

            <View style={styles.buttons}>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => { }}>
                    <Text style={styles.btnPrimaryText}>Jugar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnSecondary} onPress={() => { }}>
                    <Text style={styles.btnSecondaryText}>Multijugador</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    title: {
        fontSize: 52,
        fontFamily: 'Bangers_400Regular',
        color: '#ffffff',
        marginRight: -8,
        right: -5,
        letterSpacing: 4,
        paddingRight: 4,
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Bangers_400Regular',
        color: '#9980ff',
        marginBottom: 48,
        letterSpacing: 3,
        paddingRight: 3,
        textAlign: 'center',
    },
    buttons: {
        width: '70%',
        gap: 16,
    },
    btnPrimary: {
        backgroundColor: '#6c47ff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    btnSecondary: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6c47ff',
    },
    btnSecondaryText: {
        color: '#6c47ff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    helpbtn: {
        backgroundColor: '#ffffff',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 32,
        padding: 8,
        position: 'absolute',
        top: 50,
        right: 20,
    },
});