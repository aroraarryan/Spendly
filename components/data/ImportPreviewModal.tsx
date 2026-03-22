import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import { Ionicons } from '@expo/vector-icons';

interface ImportPreviewModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    preview: {
        expenseCount: number;
        categoryCount: number;
        eventCount: number;
        backupDate: string;
    };
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
    visible,
    onClose,
    onConfirm,
    preview
}) => {
    const colors = useThemeColors();

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Confirm Import</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        You are about to import data from a backup created on <Text style={{ fontWeight: '700', color: colors.text }}>{preview.backupDate}</Text>.
                    </Text>

                    <View style={styles.statsContainer}>
                        <View style={[styles.statItem, { backgroundColor: colors.surface2 }]}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{preview.expenseCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Expenses</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: colors.surface2 }]}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{preview.categoryCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Categories</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: colors.surface2 }]}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{preview.eventCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Events</Text>
                        </View>
                    </View>

                    <View style={[styles.warningBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                        <Ionicons name="warning" size={20} color="#B45309" style={{ marginRight: 10 }} />
                        <Text style={[styles.warningText, { color: '#92400E' }]}>
                            Existing data will be kept. Duplicates will be skipped automatically.
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <View style={{ flex: 1 }}>
                            <NeoButton label="Cancel" variant="ghost" onPress={onClose} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <NeoButton label="Import Now" variant="primary" onPress={onConfirm} />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        borderRadius: 24,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    warningBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 32,
        alignItems: 'center',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
});

export default ImportPreviewModal;
