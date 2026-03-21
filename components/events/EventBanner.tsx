import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NeoBadge from '../ui/NeoBadge';
import { useThemeColors } from '../../hooks/useThemeColors';

interface EventBannerProps {
    name: string;
    color: string;
    status: 'upcoming' | 'active' | 'completed';
    daysRemaining: number;
    height?: number;
}

const EventBanner: React.FC<EventBannerProps> = ({
    name,
    color,
    status,
    daysRemaining,
    height = 80
}) => {
    const colors = useThemeColors();

    return (
        <View style={[styles.banner, { backgroundColor: color, height }]}>
            <View style={styles.overlay} />
            <View style={styles.content}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    <View style={styles.infoRow}>
                        {status !== 'completed' && daysRemaining >= 0 && (
                            <Text style={styles.daysText}>
                                {daysRemaining === 0 ? 'Ends Today' : `${daysRemaining} Days Left`}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={styles.statusDot} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        width: '100%',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    infoRow: {
        marginTop: 4,
    },
    daysText: {
        fontSize: 13,
        fontWeight: '500',
        color: 'white',
        opacity: 0.9,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        opacity: 0.5,
    }
});

export default EventBanner;
