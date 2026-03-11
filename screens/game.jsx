import { View, StyleSheet } from 'react-native';
import Board from '../components/board';

export default function Game() {
    return (
        <View style={styles.container}>
            <Board />
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
