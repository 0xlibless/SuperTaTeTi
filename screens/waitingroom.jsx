import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

export default function WaitingRoom({ roomId, onCancel }) {
    return (
        <View style={styles.screen}>
            <Text style={styles.title}>Sala creada</Text>
            <Text style={styles.subtitle}>Compartí este código con tu oponente</Text>
            <View style={styles.codeBox}>
                <Text style={styles.codeText}>{roomId}</Text>
            </View>
            <ActivityIndicator color="#6c47ff" size="large" style={{ marginTop: 28 }} />
            <Text style={styles.hint}>Esperando oponente...</Text>
            <TouchableOpacity style={styles.ghostBtn} onPress={onCancel}>
                <Text style={styles.ghostBtnText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0f0f1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'Fredoka_700Bold',
        fontSize: 42,
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'Fredoka_700Bold',
        fontSize: 18,
        color: '#5a5a8a',
        marginBottom: 20,
    },
    codeBox: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#6c47ff',
        paddingVertical: 20,
        paddingHorizontal: 40,
    },
    codeText: {
        fontFamily: 'Fredoka_700Bold',
        fontSize: 46,
        color: '#6c47ff',
        letterSpacing: 10,
    },
    hint: {
        fontFamily: 'Fredoka_700Bold',
        fontSize: 18,
        color: '#5a5a8a',
        marginTop: 14,
    },
    ghostBtn: {
        marginTop: 36,
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    ghostBtnText: {
        fontFamily: 'Fredoka_700Bold',
        fontSize: 18,
        color: '#4a4a7a',
    },
});
