import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Alert,
    Platform,
    KeyboardAvoidingView,
    FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useIncomeStore } from '@/store/incomeStore';
import { useSettingsStore } from '@/store/settingsStore';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import NeoInput from '@/components/ui/NeoInput';
import NumpadButton from '@/components/shared/NumpadButton';
import { haptic } from '@/utils/haptics';

export default function AddIncomeModal() {
    const { incomeId } = useLocalSearchParams<{ incomeId?: string }>();
    const colors = useThemeColors();
    const router = useRouter();
    const { currencySymbol } = useSettingsStore();
    
    const { 
        income, 
        incomeSources, 
        addIncome, 
        updateIncome, 
        deleteIncome 
    } = useIncomeStore();

    const [amount, setAmount] = useState('0');
    const [sourceId, setSourceId] = useState('');
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (incomeId) {
            const entry = income.find(i => i.id === incomeId);
            if (entry) {
                setAmount(entry.amount.toString());
                setSourceId(entry.source_id);
                setDate(new Date(entry.date));
                setNote(entry.note || '');
                setIsRecurring(entry.is_recurring === 1);
            }
        } else if (incomeSources.length > 0) {
            setSourceId(incomeSources[0].id);
        }
    }, [incomeId, income, incomeSources]);

    const handleNumpadPress = (val: string) => {
        if (val === 'del') {
            setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else if (val === '.') {
            if (!amount.includes('.')) {
                setAmount(prev => prev + '.');
            }
        } else {
            setAmount(prev => prev === '0' ? val : prev + val);
        }
    };

    const handleSave = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
            return;
        }

        if (!sourceId) {
            Alert.alert('Select Source', 'Please select an income source.');
            return;
        }

        setLoading(true);
        try {
            const incomeData = {
                amount: numAmount,
                source_id: sourceId,
                date: date.toISOString().split('T')[0],
                note: note.trim() || undefined,
                is_recurring: isRecurring ? 1 : 0,
                recurring_interval: isRecurring ? 'monthly' : undefined
            };

            if (incomeId) {
                await updateIncome(incomeId, incomeData);
            } else {
                await addIncome(incomeData as any);
            }
            
            haptic.success();
            router.back();
        } catch (error) {
            console.error('Error saving income:', error);
            Alert.alert('Error', 'Failed to save income. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Income',
            'Are you sure you want to delete this income entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                        if (incomeId) {
                            await deleteIncome(incomeId);
                            haptic.medium();
                            router.back();
                        }
                    } 
                }
            ]
        );
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const renderSourceItem = ({ item }: { item: typeof incomeSources[0] }) => {
        const isSelected = sourceId === item.id;
        return (
            <TouchableOpacity 
                style={[
                    styles.sourceItem, 
                    { backgroundColor: isSelected ? item.color : colors.surface2 }
                ]}
                onPress={() => {
                    haptic.light();
                    setSourceId(item.id);
                }}
            >
                <Text style={styles.sourceIcon}>{item.icon}</Text>
                <Text 
                    style={[
                        styles.sourceName, 
                        { color: isSelected ? 'white' : colors.textSecondary }
                    ]}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <Stack.Screen options={{ 
                headerTitle: incomeId ? 'Edit Income' : 'Add Income',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: colors.text, fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                ),
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.background }
            }} />

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Amount Display */}
                <View style={styles.amountContainer}>
                    <Text style={[styles.currency, { color: colors.textMuted }]}>{currencySymbol}</Text>
                    <Text style={[styles.amountText, { color: colors.text }]}>{Number(amount).toLocaleString()}</Text>
                </View>

                {/* Source Selection */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>INCOME SOURCE</Text>
                        <TouchableOpacity onPress={() => router.push('/income-sources')}>
                            <Text style={[styles.manageBtn, { color: colors.accent }]}>Manage</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList 
                        data={incomeSources}
                        renderItem={renderSourceItem}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.sourceList}
                    />
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <TouchableOpacity 
                        style={[styles.fieldRow, { backgroundColor: colors.surface2 }]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <View style={styles.fieldLeft}>
                            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Date</Text>
                        </View>
                        <Text style={[styles.fieldValue, { color: colors.text }]}>
                            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChangeDate}
                            maximumDate={new Date()}
                        />
                    )}

                    <NeoInput 
                        placeholder="Add a note (optional)"
                        value={note}
                        onChangeText={setNote}
                        leftElement={<Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />}
                    />

                    <View style={[styles.fieldRow, { backgroundColor: colors.surface2 }]}>
                        <View style={styles.fieldLeft}>
                            <Ionicons name="repeat-outline" size={20} color={colors.textSecondary} />
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Recurring Monthly</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => {
                                haptic.light();
                                setIsRecurring(!isRecurring);
                            }}
                            style={[
                                styles.toggle, 
                                { backgroundColor: isRecurring ? colors.success : colors.border }
                            ]}
                        >
                            <View style={[styles.toggleCircle, isRecurring ? { right: 2 } : { left: 2 }]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Numpad */}
                <View style={styles.numpad}>
                    <View style={styles.numpadRow}>
                        <NumpadButton value="1" onPress={handleNumpadPress} />
                        <NumpadButton value="2" onPress={handleNumpadPress} />
                        <NumpadButton value="3" onPress={handleNumpadPress} />
                    </View>
                    <View style={styles.numpadRow}>
                        <NumpadButton value="4" onPress={handleNumpadPress} />
                        <NumpadButton value="5" onPress={handleNumpadPress} />
                        <NumpadButton value="6" onPress={handleNumpadPress} />
                    </View>
                    <View style={styles.numpadRow}>
                        <NumpadButton value="7" onPress={handleNumpadPress} />
                        <NumpadButton value="8" onPress={handleNumpadPress} />
                        <NumpadButton value="9" onPress={handleNumpadPress} />
                    </View>
                    <View style={styles.numpadRow}>
                        <NumpadButton value="." onPress={handleNumpadPress} />
                        <NumpadButton value="0" onPress={handleNumpadPress} />
                        <NumpadButton value="del" onPress={handleNumpadPress} />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <NeoButton 
                        label={incomeId ? "Update Income" : "Save Income"} 
                        onPress={handleSave}
                        loading={loading}
                        glowing
                    />
                    
                    {incomeId && (
                        <NeoButton 
                            label="Delete Entry" 
                            variant="danger" 
                            onPress={handleDelete}
                            style={{ marginTop: 12 }}
                        />
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginVertical: 20,
    },
    currency: {
        fontSize: 24,
        fontWeight: '600',
        marginRight: 4,
    },
    amountText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    manageBtn: {
        fontSize: 13,
        fontWeight: '600',
    },
    sourceList: {
        gap: 12,
    },
    sourceItem: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 80,
    },
    sourceIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    sourceName: {
        fontSize: 12,
        fontWeight: '600',
    },
    form: {
        gap: 12,
        marginBottom: 24,
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    fieldLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        position: 'absolute',
        top: 2,
    },
    numpad: {
        marginBottom: 32,
    },
    numpadRow: {
        flexDirection: 'row',
    },
    actions: {
        marginBottom: 40,
    }
});
