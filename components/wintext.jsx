import { Text, StyleSheet } from 'react-native';

export default function WinnerText({ winner }) {
    if (winner !== 'D') {
        return (
            <Text style={[styles.resultText, winner === 'X' ? styles.xColor : styles.oColor]}>
                ¡Gana {winner}!
            </Text>
        );
    } else {
        return (
            <Text style={[styles.resultText, styles.drawColor]}>
                ¡Empate!
            </Text>
        );
    }
}

const styles = StyleSheet.create({
    resultText: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Bangers_400Regular',
    },
    xColor:    { color: '#6c47ff' },
    oColor:    { color: '#ff4f7b' },
    drawColor: { color: '#aaaacc' },
});
