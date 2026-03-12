import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { database } from '../lib/firebase';
import { ref, set, update } from 'firebase/database';
import TurnIndicator from './turnindicator';

const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_W - 24, 420);
const CELL = BOARD_SIZE / 3;

const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
];

const mkCells  = () => Array(9).fill(null).map(() => Array(9).fill(null));
const mkBig    = () => Array(9).fill(null);

export const INITIAL_GAME = {
    cells:         mkCells(),
    bigWinners:    mkBig(),
    activeBoard:   -1,
    currentPlayer: 'X',
    gameWinner:    '',
    winLine:       -1,
};

function checkResult(board) {
    for (const [a, b, c] of WIN_LINES) {
        if (board[a] && board[a] !== 'D' && board[a] === board[b] && board[a] === board[c])
            return board[a];
    }
    if (board.every(v => v !== null)) return 'D';
    return null;
}

function findWinLine(board) {
    for (let i = 0; i < WIN_LINES.length; i++) {
        const [a, b, c] = WIN_LINES[i];
        if (board[a] && board[a] !== 'D' && board[a] === board[b] && board[a] === board[c])
            return i;
    }
    return null;
}

// ─── Sub-componentes visuales ─────────────────────────────────────────────────

function WonCell({ winner }) {
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        ]).start();
    }, []);
    const color = winner === 'X' ? '#6c47ff' : winner === 'O' ? '#ff4f7b' : '#555577';
    return (
        <View style={styles.wonCellInner}>
            <Animated.Text style={[styles.bigSymbol, styles.symbol, { color, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                {winner === 'D' ? '·' : winner}
            </Animated.Text>
        </View>
    );
}

const cellCX = (idx) => ((idx % 3) + 0.5) * CELL;
const cellCY = (idx) => (Math.floor(idx / 3) + 0.5) * CELL;

function WinLine({ lineIdx, color }) {
    const progress = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1, duration: 600, delay: 100,
            easing: Easing.out(Easing.cubic), useNativeDriver: false,
        }).start();
    }, []);
    const [a, , c] = WIN_LINES[lineIdx];
    const x1 = cellCX(a), y1 = cellCY(a), x2 = cellCX(c), y2 = cellCY(c);
    const dx = x2 - x1, dy = y2 - y1;
    const fullLength = Math.sqrt(dx * dx + dy * dy) + 70;
    const angle      = Math.atan2(dy, dx);
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
    const LINE_H = 7;
    const animWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, fullLength] });
    return (
        <View pointerEvents="none" style={{ position: 'absolute', left: midX - fullLength / 2, top: midY - LINE_H / 2, width: fullLength, height: LINE_H, transform: [{ rotate: `${angle}rad` }] }}>
            <Animated.View style={{ width: animWidth, height: LINE_H, borderRadius: LINE_H / 2, backgroundColor: color, opacity: 0.9 }} />
        </View>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MultiplayerBoard({ roomId, myRole, gameState, onLeave }) {
    const { cells, bigWinners, activeBoard, currentPlayer, gameWinner, winLine } = gameState;
    const boardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(boardAnim, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }, []);

    async function handlePress(bigIdx, smallIdx) {
        if (gameWinner) return;
        if (bigWinners[bigIdx]) return;
        const activeBoardNorm = activeBoard === -1 ? null : activeBoard;
        if (activeBoardNorm !== null && activeBoardNorm !== bigIdx) return;
        if (cells[bigIdx][smallIdx]) return;
        if (currentPlayer !== myRole) return;

        const newCells = cells.map((row, i) =>
            i === bigIdx ? row.map((v, j) => (j === smallIdx ? currentPlayer : v)) : row
        );
        const newBig = [...bigWinners];
        const smallResult = checkResult(newCells[bigIdx]);
        if (smallResult) newBig[bigIdx] = smallResult;
        const bigResult  = checkResult(newBig);
        const nextBoard  = newBig[smallIdx] ? -1 : smallIdx;

        await update(ref(database, `rooms/${roomId}`), {
            cells:         newCells,
            bigWinners:    newBig,
            activeBoard:   nextBoard,
            currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
            gameWinner:    bigResult || '',
            winLine:       bigResult ? (findWinLine(newBig) ?? -1) : -1,
        });
    }

    async function handleReset() {
        await set(ref(database, `rooms/${roomId}`), {
            status:  'playing',
            players: { X: true, O: true },
            ...INITIAL_GAME,
        });
    }

    const isMyTurn       = currentPlayer === myRole && !gameWinner;
    const activeBoardNorm = activeBoard === -1 ? null : activeBoard;
    const winLineNorm    = winLine === -1 ? null : winLine;

    return (
        <View style={styles.wrapper}>
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={onLeave}>
                    <Entypo name="chevron-left" size={28} color="#7070aa" />
                </TouchableOpacity>
                <View style={styles.turnRow}>
                    <TurnIndicator currentPlayer={currentPlayer} gameWinner={gameWinner || null} />
                </View>
                <View style={styles.placeholder} />
            </View>

            {!gameWinner && (
                <Text style={styles.subText}>
                    {isMyTurn ? 'Tu turno' : 'Turno del oponente…'}
                </Text>
            )}

            <Animated.View style={[
                { width: BOARD_SIZE, height: BOARD_SIZE },
                { opacity: boardAnim, transform: [{ scale: boardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }] },
            ]}>
                {[0, 1, 2].map(bigRow => (
                    <View key={bigRow} style={styles.bigRow}>
                        {[0, 1, 2].map(bigCol => {
                            const bigIdx = bigRow * 3 + bigCol;
                            const bigW   = bigWinners[bigIdx];
                            const isBoardActive = !bigW && (activeBoardNorm === null || activeBoardNorm === bigIdx);
                            return (
                                <View key={bigCol} style={[
                                    styles.bigCell,
                                    bigCol < 2 && styles.bigBorderRight,
                                    bigRow < 2 && styles.bigBorderBottom,
                                    isBoardActive && !gameWinner && {
                                        backgroundColor: currentPlayer === 'X' ? 'rgba(108,71,255,0.12)' : 'rgba(255,79,123,0.12)',
                                        borderWidth: 2,
                                        borderColor:     currentPlayer === 'X' ? 'rgba(108,71,255,0.65)' : 'rgba(255,79,123,0.65)',
                                        borderRadius: 6,
                                    },
                                    bigW === 'X' && styles.bigCellWonX,
                                    bigW === 'O' && styles.bigCellWonO,
                                    bigW === 'D' && styles.bigCellDraw,
                                ]}>
                                    {bigW ? <WonCell winner={bigW} /> : (
                                        [0, 1, 2].map(smallRow => (
                                            <View key={smallRow} style={styles.smallRow}>
                                                {[0, 1, 2].map(smallCol => {
                                                    const smallIdx = smallRow * 3 + smallCol;
                                                    const val      = cells[bigIdx][smallIdx];
                                                    const canPlay  = isMyTurn && !bigW && !val && (activeBoardNorm === null || activeBoardNorm === bigIdx);
                                                    return (
                                                        <TouchableOpacity
                                                            key={smallCol}
                                                            style={[styles.smallCell, smallCol < 2 && styles.smallBorderRight, smallRow < 2 && styles.smallBorderBottom]}
                                                            onPress={() => handlePress(bigIdx, smallIdx)}
                                                            activeOpacity={canPlay ? 0.5 : 1}
                                                        >
                                                            {val ? (
                                                                <Text style={[styles.smallSymbol, styles.symbol, val === 'X' ? styles.xColor : styles.oColor]}>
                                                                    {val}
                                                                </Text>
                                                            ) : null}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        ))
                                    )}
                                    {!isBoardActive && !bigW && activeBoardNorm !== null && (
                                        <View style={styles.inactiveOverlay} pointerEvents="none" />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
                {winLineNorm !== null && gameWinner !== 'D' && (
                    <WinLine lineIdx={winLineNorm} color={gameWinner === 'X' ? '#6c47ff' : '#ff4f7b'} />
                )}
            </Animated.View>

            {gameWinner && (
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                    <Text style={styles.resetText}>Jugar de nuevo</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const BIG_SEP   = '#5050a0';
const SMALL_SEP = '#2d2d58';

const styles = StyleSheet.create({
    wrapper:    { alignItems: 'center', gap: 16 },
    topRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: BOARD_SIZE },
    turnRow:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
    placeholder:{ width: 40 },
    backBtn:    { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
    subText:    { fontFamily: 'Fredoka_700Bold', fontSize: 15, color: '#5a5a8a' },

    bigRow:         { flex: 1, flexDirection: 'row' },
    bigCell:        { flex: 1, padding: 3 },
    bigBorderRight: { borderRightWidth: 3, borderRightColor: BIG_SEP },
    bigBorderBottom:{ borderBottomWidth: 3, borderBottomColor: BIG_SEP },
    bigCellWonX:    { backgroundColor: 'rgba(108,71,255,0.28)', alignItems: 'center', justifyContent: 'center' },
    bigCellWonO:    { backgroundColor: 'rgba(255,79,123,0.28)', alignItems: 'center', justifyContent: 'center' },
    bigCellDraw:    { backgroundColor: 'rgba(80,80,100,0.15)',  alignItems: 'center', justifyContent: 'center' },
    wonCellInner:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
    bigSymbol:      { fontSize: 56, fontWeight: 'bold' },
    inactiveOverlay:{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.42)' },

    smallRow:         { flex: 1, flexDirection: 'row' },
    smallCell:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
    smallBorderRight: { borderRightWidth: 1, borderRightColor: SMALL_SEP },
    smallBorderBottom:{ borderBottomWidth: 1, borderBottomColor: SMALL_SEP },
    smallSymbol:      { fontSize: CELL / 4.5, lineHeight: CELL / 4 },
    symbol:           { fontFamily: 'Fredoka_700Bold' },
    xColor:           { color: '#6c47ff' },
    oColor:           { color: '#ff4f7b' },

    resetBtn:  { backgroundColor: '#6c47ff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 48 },
    resetText: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: '#ffffff' },
});
