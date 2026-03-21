import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function TabLayout() {
    const colors = useThemeColors();

    const TabIcon = ({ name, color, focused }: { name: any, color: string, focused: boolean }) => (
        <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: 4 }}>
            <Ionicons name={focused ? name : `${name}-outline`} size={24} color={color} />
        </View>
    );

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: Platform.OS === 'ios' ? 88 : 64,
                paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                paddingTop: 8,
                elevation: 0,
                shadowOpacity: 0,
            },
            tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: '500',
                marginTop: 2,
            },
            headerStyle: {
                backgroundColor: colors.background,
                elevation: 0,
                shadowOpacity: 0,
            },
            headerTitleStyle: {
                fontWeight: '600',
                fontSize: 17,
                color: colors.text,
            },
            headerShadowVisible: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Overview',
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarLabel: 'Stats',
                    tabBarIcon: ({ color, focused }) => <TabIcon name="stats-chart" color={color} focused={focused} />
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: 'Events',
                    tabBarLabel: 'Events',
                    tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={color} focused={focused} />
                }}
            />
            <Tabs.Screen
                name="ai-insights"
                options={{
                    title: 'AI Insights',
                    tabBarLabel: 'AI',
                    tabBarIcon: ({ color, focused }) => <TabIcon name="sparkles" color={color} focused={focused} />
                }}
            />
        </Tabs>
    );
}
