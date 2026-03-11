import { View, Text, StyleSheet } from 'react-native';

export default function Multiplayer() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Lo que va a ser programar esto la que lo pario</Text>
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
    text: {
        color: '#ffffff',
        fontSize: 24,
    },
});
