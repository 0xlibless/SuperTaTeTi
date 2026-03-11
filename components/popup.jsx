
import { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Popup = forwardRef(({ message }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        show() {
            if (!visible){
                setVisible(true);
            }
        }
    }));

    if (!visible) return null;

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>¿Cómo se juega?</Text>
                    <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.divider} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 100,
    },
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        borderWidth: 1,
        borderColor: '#6c47ff',
        shadowColor: '#6c47ff',
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    closeBtn: {
        backgroundColor: '#6c47ff',
        borderRadius: 20,
        width: 28,
        height: 28,
        top: -3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        top: -1,
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#6c47ff44',
        marginBottom: 16,
    },
    message: {
        color: '#cccccc',
        fontSize: 15,
        lineHeight: 24,
    },
});

export default Popup;
