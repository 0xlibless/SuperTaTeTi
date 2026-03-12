
import { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Popup = forwardRef(({
    show,
    title = '¿Cómo se juega?',
    message,
    onClose,
    showConfirmButton = false,
    confirmText = 'Aceptar',
    confirmButtonColor = '#6c47ff',
    onConfirmPressed,
    cancelText = 'Cancelar',
    showCancelButton = false,
    onCancelPressed,
    contentContainerStyle,
    titleStyle,
    messageStyle,
    closeBtn = true,
}, ref) => {
    const [visible, setVisible] = useState(false);
    const isVisible = show ?? visible;

    function hide() {
        if (show === undefined) {
            setVisible(false);
        }
        onClose?.();
    }

    useImperativeHandle(ref, () => ({
        show() {
            if (!visible){
                setVisible(true);
            }
        },
        hide() {
            setVisible(false);
        }
    }));

    if (!isVisible) return null;

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            <View style={[styles.card, contentContainerStyle]}>
                <View style={styles.header}>
                    <Text style={[styles.title, titleStyle]}>{title}</Text>
                    {closeBtn && (
                        <TouchableOpacity onPress={hide} style={styles.closeBtn}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.divider} />
                <Text style={[styles.message, messageStyle]}>{message}</Text>
                {(showConfirmButton || showCancelButton) && (
                    <View style={styles.actions}>
                        {showCancelButton && (
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.cancelBtn]}
                                onPress={() => {
                                    hide();
                                    onCancelPressed?.();
                                }}
                            >
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        {showConfirmButton && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: confirmButtonColor }]}
                                onPress={() => {
                                    onConfirmPressed?.();
                                    if (!onConfirmPressed) hide();
                                }}
                            >
                                <Text style={styles.confirmText}>{confirmText}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
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
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 24,
    },
    actionBtn: {
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 12,
        minWidth: 110,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: '#6c47ff55',
    },
    cancelText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    confirmText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default Popup;
