import { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Board from '../components/board';
import Loading from '../components/loading';

export default function Game({ navigate }) {
    const [showLoading, setShowLoading] = useState(false);
    const destination = useRef(null);

    const goTo = (screen) => {
        destination.current = screen;
        setShowLoading(true);
    };

    if (showLoading) return <Loading onDone={() => navigate(destination.current)} />;

    return (
        <View style={styles.container}>
            <Board navigate={goTo} />
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
