import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Alert,
    FlatList
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useIncomeStore } from '@/store/incomeStore';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import NeoInput from '@/components/ui/NeoInput';
import EmojiPicker from '@/components/categories/EmojiPicker';
import ColorPicker from '@/components/categories/ColorPicker';
import { haptic } from '@/utils/haptics';

export default function IncomeSourcesScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const { incomeSources, addIncomeSource } = useIncomeStore();

    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('💰');
    const [color, setColor] = useState('#10B981');
    const [loading, setLoading] = useState(false);

    const handleAddSource = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter a name for the income source.');
            return;
        }

        setLoading(true);
        try {
            await addIncomeSource({
                name: name.trim(),
                icon,
                color
            });
            haptic.success();
            setIsAdding(false);
            setName('');
            setIcon('💰');
        } catch (error) {
            console.error('Error adding income source:', error);
            Alert.alert('Error', 'Failed to add source.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ 
                headerTitle: 'Income Sources',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.background }
            }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isAdding ? (
                    <NeoCard style={styles.addCard}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text }]}>New Source</Text>
                            <TouchableOpacity onPress={() => setIsAdding(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <NeoInput 
                            label="Source Name"
                            placeholder="e.g. Side Hustle, Rent"
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Pick an Icon</Text>
                        <EmojiPicker selectedEmoji={icon} onEmojiSelect={setIcon} />

                        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Pick a Color</Text>
                        <ColorPicker selectedColor={color} onColorSelect={setColor} />

                        <NeoButton 
                            label="Create Source" 
                            onPress={handleAddSource} 
                            loading={loading}
                            style={{ marginTop: 24 }}
                            glowing
                        />
                    </NeoCard>
                ) : (
                    <TouchableOpacity 
                        style={[styles.addNewBtn, { borderColor: colors.accent, borderStyle: 'dashed' }]}
                        onPress={() => {
                            haptic.light();
                            setIsAdding(true);
                        }}
                    >
                        <Ionicons name="add-circle" size={24} color={colors.accent} />
                        <Text style={[styles.addNewText, { color: colors.accent }]}>Add New Source</Text>
                    </TouchableOpacity>
                )}

                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>EXISTING SOURCES</Text>
                
                <View style={styles.sourcesList}>
                    {incomeSources.map(source => (
                        <NeoCard key={source.id} style={styles.sourceItem}>
                            <View style={[styles.iconBox, { backgroundColor: source.color }]}>
                                <Text style={styles.sourceIconText}>{source.icon}</Text>
                            </View>
                            <View style={styles.sourceTextContent}>
                                <Text style={[styles.sourceName, { color: colors.text }]}>{source.name}</Text>
                            </View>
                            {/* We don't implement delete for now as per minimal requirements, but could be added */}
                        </NeoCard>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    addCard: {
        padding: 20,
        marginBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    addNewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: 32,
        gap: 12,
    },
    addNewText: {
        fontSize: 16,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 16,
    },
    sourcesList: {
        gap: 12,
    },
    sourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    sourceIconText: {
        fontSize: 22,
    },
    sourceTextContent: {
        flex: 1,
    },
    sourceName: {
        fontSize: 16,
        fontWeight: '600',
    }
});
