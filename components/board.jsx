import { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import WinnerText from './wintext';
const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_W - 24, 420);

const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6],             
];

function checkResult(board) {
    for (const [a, b, c] of WIN_LINES) {
        if (
            board[a] &&
            board[a] !== 'D' &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a];
        }
    }
    if (board.every((v) => v !== null)) return 'D';
    return null;
}

function WonCell({ winner }) {
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const color = winner === 'X' ? '#6c47ff' : winner === 'O' ? '#ff4f7b' : '#555577';

    return (
        <View style={styles.wonCellInner}>
            <Animated.Text
                style={[
                    styles.bigSymbol,
                    styles.symbol,
                    { color, opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
            >
                {winner === 'D' ? '·' : winner}
            </Animated.Text>
        </View>
    );
}

const CELL = BOARD_SIZE / 3;
const cellCX = (idx) => ((idx % 3) + 0.5) * CELL;
const cellCY = (idx) => (Math.floor(idx / 3) + 0.5) * CELL;

function findWinLine(board) {
    for (let i = 0; i < WIN_LINES.length; i++) {
        const [a, b, c] = WIN_LINES[i];
        if (board[a] && board[a] !== 'D' && board[a] === board[b] && board[a] === board[c])
            return i;
    }
    return null;
}

function WinLine({ lineIdx, color }) {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 600,
            delay: 100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, []);

    const [a, , c] = WIN_LINES[lineIdx];
    const x1 = cellCX(a), y1 = cellCY(a);
    const x2 = cellCX(c), y2 = cellCY(c);
    const dx = x2 - x1, dy = y2 - y1;
    const fullLength = Math.sqrt(dx * dx + dy * dy) + 70;
    const angle = Math.atan2(dy, dx);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const LINE_H = 7;

    const animWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, fullLength] });

    return (
        <View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: midX - fullLength / 2,
                top: midY - LINE_H / 2,
                width: fullLength,
                height: LINE_H,
                transform: [{ rotate: `${angle}rad` }],
            }}
        >
            <Animated.View
                style={{
                    width: animWidth,
                    height: LINE_H,
                    borderRadius: LINE_H / 2,
                    backgroundColor: color,
                    opacity: 0.9,
                }}
            />
        </View>
    );
}

const mkCells = () => Array(9).fill(null).map(() => Array(9).fill(null));
const mkBig   = () => Array(9).fill(null);

export default function Board({ navigate }) {
    const [cells, setCells]             = useState(mkCells);
    const [bigWinners, setBigWinners]   = useState(mkBig);
    const [activeBoard, setActiveBoard] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [gameWinner, setGameWinner]   = useState(null);
    const [winLine, setWinLine]         = useState(null);

    const pill1Anim  = useRef(new Animated.Value(0)).current;
    const pill2Anim  = useRef(new Animated.Value(0)).current;
    const boardAnim  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(80, [
            Animated.spring(pill1Anim, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
            Animated.spring(pill2Anim, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
            Animated.spring(boardAnim, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
        ]).start();
    }, []);

    function handlePress(bigIdx, smallIdx) {
        if (gameWinner) return;
        if (bigWinners[bigIdx]) return;                             
        if (activeBoard !== null && activeBoard !== bigIdx) return; 
        if (cells[bigIdx][smallIdx]) return;                       

        const newCells = cells.map((row, i) =>
            i === bigIdx
                ? row.map((v, j) => (j === smallIdx ? currentPlayer : v))
                : row
        );

        const newBig = [...bigWinners];
        const smallResult = checkResult(newCells[bigIdx]);
        if (smallResult) newBig[bigIdx] = smallResult;

        const bigResult = checkResult(newBig);


        const nextBoard = newBig[smallIdx] ? null : smallIdx;

        setCells(newCells);
        setBigWinners(newBig);
        setActiveBoard(nextBoard);
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        if (bigResult) {
            setGameWinner(bigResult);
            setWinLine(findWinLine(newBig));
        }
    }

    function reset() {
        setCells(mkCells());
        setBigWinners(mkBig());
        setActiveBoard(null);
        setCurrentPlayer('X');
        setGameWinner(null);
        setWinLine(null);
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigate?.('menu')}>
                    <Entypo name="chevron-left" size={28} color="#7070aa" />
                </TouchableOpacity>
                <View style={styles.turnRow}>
                    {gameWinner ? (
                        <WinnerText winner={gameWinner} />
                    ) : (
                        [pill1Anim, pill2Anim].map((anim, i) => {
                            const p = i === 0 ? 'X' : 'O';
                            const isActive = p === currentPlayer;
                            const pColor   = p === 'X' ? '#6c47ff' : '#ff4f7b';
                            return (
                                <Animated.View
                                    key={p}
                                    style={[
                                        styles.playerPill,
                                        isActive
                                            ? { borderColor: pColor, backgroundColor: `${pColor}28` }
                                            : styles.playerPillInactive,
                                        {
                                            opacity: anim,
                                            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
                                        },
                                    ]}
                                >
                                    <Text style={[styles.playerPillText, styles.symbol, { color: isActive ? pColor : '#3d3d5c' }]}>
                                        {p}
                                    </Text>
                                </Animated.View>
                            );
                        })
                    )}
                </View>
                <View style={styles.backBtnPlaceholder} />
            </View>

            <Animated.View style={[
                { width: BOARD_SIZE, height: BOARD_SIZE },
                {
                    opacity: boardAnim,
                    transform: [{ scale: boardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }],
                },
            ]}>
                {[0, 1, 2].map((bigRow) => (

                    <View key={bigRow} style={styles.bigRow}>
                        {[0, 1, 2].map((bigCol) => {
                            const bigIdx = bigRow * 3 + bigCol;
                            const bigW   = bigWinners[bigIdx];
                            const isBoardActive =
                                !bigW && (activeBoard === null || activeBoard === bigIdx);

                            return (
                                <View
                                    key={bigCol}
                                    style={[
                                        styles.bigCell,
                                        bigCol < 2 && styles.bigBorderRight,
                                        bigRow < 2 && styles.bigBorderBottom,
                                        isBoardActive && !gameWinner && {
                                            backgroundColor: currentPlayer === 'X'
                                                ? 'rgba(108, 71, 255, 0.12)'
                                                : 'rgba(255, 79, 123, 0.12)',
                                            borderWidth: 2,
                                            borderColor: currentPlayer === 'X'
                                                ? 'rgba(108, 71, 255, 0.65)'
                                                : 'rgba(255, 79, 123, 0.65)',
                                            borderRadius: 6,
                                        },
                                        bigW === 'X' && styles.bigCellWonX,
                                        bigW === 'O' && styles.bigCellWonO,
                                        bigW === 'D' && styles.bigCellDraw,
                                    ]}
                                >
                                    {bigW ? (
                                        <WonCell winner={bigW} />
                                    ) : (
                                        [0, 1, 2].map((smallRow) => (
                                            <View key={smallRow} style={styles.smallRow}>
                                                {[0, 1, 2].map((smallCol) => {
                                                    const smallIdx = smallRow * 3 + smallCol;
                                                    const val      = cells[bigIdx][smallIdx];
                                                    const canPlay  =
                                                        !gameWinner &&
                                                        !bigW &&
                                                        !val &&
                                                        (activeBoard === null || activeBoard === bigIdx);

                                                    return (
                                                        <TouchableOpacity
                                                            key={smallCol}
                                                            style={[
                                                                styles.smallCell,
                                                                smallCol < 2 && styles.smallBorderRight,
                                                                smallRow < 2 && styles.smallBorderBottom,
                                                            ]}
                                                            onPress={() => handlePress(bigIdx, smallIdx)}
                                                            activeOpacity={canPlay ? 0.5 : 1}
                                                        >
                                                            {val && (
                                                                <Text
                                                                    style={[
                                                                        styles.smallSymbol,
                                                                        styles.symbol,
                                                                        val === 'X' ? styles.xColor : styles.oColor,
                                                                    ]}
                                                                >
                                                                    {val}
                                                                </Text>
                                                            )}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        ))
                                    )}
                                    {!isBoardActive && !bigW && activeBoard !== null && (
                                        <View style={styles.inactiveOverlay} pointerEvents="none" />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
                {winLine !== null && gameWinner !== 'D' && (
                    <WinLine
                        lineIdx={winLine}
                        color={gameWinner === 'X' ? '#6c47ff' : '#ff4f7b'}
                    />
                )}
            </Animated.View>

            {gameWinner && (
                <TouchableOpacity style={styles.bttns} onPress={reset}>
                    <Text style={styles.resetText}>Jugar de nuevo</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const BIG_SEP_COLOR   = '#5050a0';
const SMALL_SEP_COLOR = '#2d2d58';

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        gap: 20,
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: BOARD_SIZE,
        marginBottom: 4,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    backBtnPlaceholder: {
        width: 40,
    },
    turnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    playerPill: {
        width: 56,
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    playerPillInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    playerPillText: {
        fontSize: 34,
        lineHeight: 38,
    },

    bigRow: {
        flex: 1,
        flexDirection: 'row',
    },
    bigCell: {
        flex: 1,
        padding: 3,
    },
    bigBorderRight: {
        borderRightWidth: 3,
        borderRightColor: BIG_SEP_COLOR,
    },
    bigBorderBottom: {
        borderBottomWidth: 3,
        borderBottomColor: BIG_SEP_COLOR,
    },
    bigCellWonX: {
        backgroundColor: 'rgba(108, 71, 255, 0.28)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bigCellWonO: {
        backgroundColor: 'rgba(255, 79, 123, 0.28)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bigCellDraw: {
        backgroundColor: 'rgba(80, 80, 100, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wonCellInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inactiveOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.42)',
    },
    bigSymbol: {
        fontSize: 56,
        fontWeight: 'bold',
    },

    smallRow: {
        flex: 1,
        flexDirection: 'row',
    },
    smallCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallBorderRight: {
        borderRightWidth: 1,
        borderRightColor: SMALL_SEP_COLOR,
    },
    smallBorderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: SMALL_SEP_COLOR,
    },
    smallSymbol: {
        fontSize: 17,
        fontWeight: 'bold',
    },

    xColor:    { color: '#6c47ff' },
    oColor:    { color: '#ff4f7b' },
    drawColor: { color: '#555577' },

    resultText: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    bttns: {
        backgroundColor: '#6c47ff',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 12,
    },
    resetText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    symbol: {
        fontFamily: 'Fredoka_700Bold',
    },
});
