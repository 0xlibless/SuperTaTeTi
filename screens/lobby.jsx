import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { database } from '../lib/firebase';
import { ref, set, get, update } from 'firebase/database';
import Loading from '../components/loading';

const mkCells = () => Array(9).fill(null).map(() => Array(9).fill(null));
const mkBig   = () => Array(9).fill(null);

const ROOM_INIT = {
    cells: mkCells(),
    bigWinners: mkBig(),
    activeBoard: -1,
    currentPlayer: 'X',
    gameWinner: '',
    winLine: -1,
};

function genRoomId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Lobby({ navigate }) {
    const [joinMode, setJoinMode] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLoading, setShowLoading] = useState(false);
    const destination = useRef(null);
    const destParams  = useRef({});

    const goTo = (screen, params = {}) => {
        destination.current = screen;
        destParams.current  = params;
        setShowLoading(true);
    };

    async function handleCreateRoom() {
        setLoading(true);
        setError('');
        try {
            const id = genRoomId();
            await set(ref(database, `rooms/${id}`), {
                status: 'waiting',
                players: { X: true },
                ...ROOM_INIT,
            });
            goTo('multiplayer', { roomId: id, myRole: 'X' });
        } catch {
            setError('Error al crear la sala. Revisá tu conexión.');
            setLoading(false);
        }
    }

    async function handleJoin() {
        const code = roomCode.trim().toUpperCase();
        if (code.length < 4) { setError('Ingresá el código de sala'); return; }
        setLoading(true);
        setError('');
        try {
            const snapshot = await get(ref(database, `rooms/${code}`));
            if (!snapshot.exists()) { setError('Sala no encontrada'); setLoading(false); return; }
            const data = snapshot.val();
            if (data.status !== 'waiting') { setError('La sala ya está en juego'); setLoading(false); return; }
            if (data.players?.O) { setError('La sala está llena'); setLoading(false); return; }
            await update(ref(database, `rooms/${code}`), {
                status: 'playing',
                'players/O': true,
            });
            goTo('multiplayer', { roomId: code, myRole: 'O' });
        } catch {
            setError('Error al conectar. Revisá tu conexión.');
            setLoading(false);
        }
    }

    if (showLoading) return <Loading onDone={() => navigate(destination.current, destParams.current)} />;

    return (
        <View style={styles.screen}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigate('menu')}>
                <Entypo name="chevron-left" size={28} color="#7070aa" />
            </TouchableOpacity>
            <Text style={styles.title}>Multijugador</Text>
            <Text style={styles.subtitle}>Jugá con un amigo online</Text>

            {!joinMode ? (
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateRoom} disabled={loading}>
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.primaryBtnText}>Crear sala</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => setJoinMode(true)}>
                        <Text style={styles.secondaryBtnText}>Unirse a sala</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.joinForm}>
                    <TextInput
                        style={[styles.input, error ? styles.inputError : null]}
                        placeholder="Código de sala"
                        placeholderTextColor="#4a4a6a"
                        value={roomCode}
                        onChangeText={t => { setRoomCode(t.toUpperCase()); setError(''); }}
                        autoCapitalize="characters"
                        maxLength={8}
                    />
                    {!!error && <Text style={styles.errorText}>{error}</Text>}
                    {loading ? (
                        <ActivityIndicator color="#6c47ff" style={{ marginTop: 20 }} />
                    ) : (
                        <View style={styles.joinButtons}>
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleJoin}>
                                <Text style={styles.primaryBtnText}>Unirse</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.ghostBtn} onPress={() => { setJoinMode(false); setError(''); setRoomCode(''); }}>
                                <Text style={styles.ghostBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    backBtn: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 24,
    },
    title: {
        textAlign: 'center',
        fontFamily: 'Fredoka_700Bold',
        fontSize: 42,
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'Fredoka_700Bold',
        fontSize: 18,
        color: '#5a5a8a',
        marginBottom: 44,
    },
    buttons: { gap: 16 },
    primaryBtn: {
        backgroundColor: '#6c47ff',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryBtnText: {
        fontFamily: 'Fredoka_700Bold',
        fontSize: 22,
        color: '#ffffff',
    },
    secondaryBtn: {
        backgroundColor: 'rgba(108,71,255,0.15)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#6c47ff',
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontFamily: 'Fredoka_700Bold',
        fontSize: 22,
        color: '#6c47ff',
    },
    ghostBtn: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    ghostBtnText: {
        fontFamily: 'Fredoka_700Bold',
        fontSize: 18,
        color: '#4a4a7a',
    },
    joinForm: { gap: 0 },
    joinButtons: { gap: 12, marginTop: 16 },
    input: {
        backgroundColor: '#1a1a2e',
        borderWidth: 2,
        borderColor: '#2d2d58',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        fontFamily: 'Fredoka_700Bold',
        fontSize: 28,
        color: '#ffffff',
        letterSpacing: 6,
        textAlign: 'center',
    },
    inputError: { borderColor: '#ff4f7b' },
    errorText: {
        fontFamily: 'Fredoka_700Bold',
        color: '#ff4f7b',
        fontSize: 15,
        marginTop: 8,
        textAlign: 'center',
    },
});
