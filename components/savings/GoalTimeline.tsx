import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '@/components/ui/NeoCard';

interface GoalTimelineProps {
    createdAt: string;
    targetDate: string;
    savedAmount: number;
    targetAmount: number;
}

const GoalTimeline: React.FC<GoalTimelineProps> = ({
    createdAt,
    targetDate,
    savedAmount,
    targetAmount
}) => {
    const colors = useThemeColors();
    
    const start = new Date(createdAt);
    const end = new Date(targetDate);
    const now = new Date();
    
    const totalTime = end.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();
    
    const timeProgress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    const savingsProgress = Math.min(100, Math.max(0, (savedAmount / targetAmount) * 100));
    
    const isOnTrack = savingsProgress >= timeProgress;

    return (
        <NeoCard style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Timeline Progress</Text>
            
            <View style={styles.timelineWrapper}>
                {/* Track */}
                <View style={[styles.track, { backgroundColor: colors.surface2 }]} />
                
                {/* Savings Progress (Filled) */}
                <View 
                    style={[
                        styles.savingsFill, 
                        { width: `${savingsProgress}%`, backgroundColor: isOnTrack ? colors.success : colors.warning }
                    ]} 
                />
                
                {/* Today Marker */}
                <View 
                    style={[
                        styles.todayMarker, 
                        { left: `${timeProgress}%`, backgroundColor: colors.accent }
                    ]} 
                />
            </View>
            
            <View style={styles.labelsRow}>
                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>
                    {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={[styles.dateLabel, { color: colors.textMuted, textAlign: 'right' }]}>
                    {end.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </Text>
            </View>
            
            <View style={[styles.statusBox, { backgroundColor: isOnTrack ? `${colors.success}10` : `${colors.warning}10` }]}>
                <Text style={[styles.statusText, { color: isOnTrack ? colors.success : colors.warning }]}>
                    {isOnTrack ? '✓ On Track' : '⚠ Behind Schedule'}
                </Text>
            </View>
        </NeoCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 20,
    },
    timelineWrapper: {
        height: 24,
        justifyContent: 'center',
        marginBottom: 8,
    },
    track: {
        height: 8,
        borderRadius: 4,
        width: '100%',
    },
    savingsFill: {
        position: 'absolute',
        height: 8,
        borderRadius: 4,
    },
    todayMarker: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'white',
        transform: [{ translateX: -6 }],
    },
    labelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusBox: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
});

export default GoalTimeline;
