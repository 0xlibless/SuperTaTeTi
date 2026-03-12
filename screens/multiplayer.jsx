import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { database } from '../lib/firebase';
import { ref, set, onValue } from 'firebase/database';
import { INITIAL_GAME } from '../components/multiplayerboard';
import MultiplayerBoard from '../components/multiplayerboard';
import WaitingRoom from './waitingroom';
import Loading from '../components/loading';

function toArr(val, len) {
    if (!val) return Array(len).fill(null);
    if (Array.isArray(val)) {
        const arr = val.slice(0, len);
        while (arr.length < len) arr.push(null);
        return arr.map(v => (v === undefined ? null : v));
    }
    return Array.from({ length: len }, (_, i) => (val[i] !== undefined ? val[i] : null));
}

export default function Multiplayer({ navigate, roomId, myRole }) {
    const [phase, setPhase] = useState('waiting');
    const [gameState, setGameState] = useState(INITIAL_GAME);
    const [showLoading, setShowLoading] = useState(false);
    const destination = useRef(null);
    const unsubRef = useRef(null);

    const goTo = (screen) => {
        destination.current = screen;
        setShowLoading(true);
    };

    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomId}`);
        const unsub = onValue(roomRef, snapshot => {
            const raw = snapshot.val();
            if (!raw) {
                goTo('lobby');
                return;
            }
            const cells = toArr(raw.cells, 9).map(row => toArr(row, 9));
            const bigWinners = toArr(raw.bigWinners, 9);
            setGameState({
                cells,
                bigWinners,
                activeBoard: raw.activeBoard !== undefined ? raw.activeBoard : -1,
                currentPlayer: raw.currentPlayer || 'X',
                gameWinner: raw.gameWinner || '',
                winLine: raw.winLine !== undefined ? raw.winLine : -1,
            });
            if (raw.status === 'playing') setPhase('game');
        });
        unsubRef.current = unsub;
        return () => unsub();
    }, [roomId]);

    function handleLeave() {
        if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
        if (phase === 'waiting') {
            set(ref(database, `rooms/${roomId}`), null);
        }
        goTo('lobby');
    }

    if (showLoading) return <Loading onDone={() => navigate(destination.current)} />;
    if (phase === 'waiting') return <WaitingRoom roomId={roomId} onCancel={handleLeave} />;
    return (
        <View style={styles.container}>
            <MultiplayerBoard roomId={roomId} myRole={myRole} gameState={gameState} onLeave={handleLeave} />
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
});
