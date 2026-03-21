import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import NeoCard from '../ui/NeoCard';

export const SkeletonCard = () => {
    return (
        <NeoCard padding={16} style={styles.container}>
            <View style={styles.header}>
                <Skeleton width={40} height={40} borderRadius={20} />
                <View style={styles.headerText}>
                    <Skeleton width="60%" height={14} style={styles.mb} />
                    <Skeleton width="40%" height={10} />
                </View>
            </View>
            <View style={styles.content}>
                <Skeleton width="100%" height={12} style={styles.mb} />
                <Skeleton width="90%" height={12} style={styles.mb} />
                <Skeleton width="70%" height={12} />
            </View>
        </NeoCard>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    content: {
        paddingTop: 8,
    },
    mb: {
        marginBottom: 8,
    },
});
