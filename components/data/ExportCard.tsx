import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NeoCard from '../ui/NeoCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoBadge from '../ui/NeoBadge';

interface ExportCardProps {
    icon: string;
    iconBgColor: string;
    title: string;
    subtitle: string;
    badge?: string;
    children: React.ReactNode;
}

const ExportCard: React.FC<ExportCardProps> = ({
    icon,
    iconBgColor,
    title,
    subtitle,
    badge,
    children
}) => {
    const colors = useThemeColors();

    return (
        <NeoCard padding={16} marginBottom={16}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    <Text style={styles.icon}>{icon}</Text>
                </View>
                <View style={styles.titleContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        {badge && <NeoBadge label={badge} variant="primary" style={styles.badge} />}
                    </View>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                {children}
            </View>
        </NeoCard>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    icon: {
        fontSize: 22,
    },
    titleContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    badge: {
        marginLeft: 8,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 10,
    },
});

export default ExportCard;
