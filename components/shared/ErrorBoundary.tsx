import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import NeoButton from '../ui/NeoButton';
import { router } from 'expo-router';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        this.setState({ hasError: false, error: null });
    };

    private handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        router.replace('/(tabs)/');
    };

    public render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.emoji}>😵</Text>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.subtitle}>The app encountered an unexpected error.</Text>

                        <ScrollView style={styles.errorBox} contentContainerStyle={styles.errorTextContainer}>
                            <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
                        </ScrollView>

                        <View style={styles.buttonContainer}>
                            <NeoButton
                                label="Restart App"
                                onPress={this.handleReload}
                                style={styles.button}
                            />
                            <NeoButton
                                label="Go Home"
                                onPress={this.handleGoHome}
                                variant="secondary"
                                style={styles.button}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    errorBox: {
        maxHeight: 200,
        width: '100%',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 15,
        marginBottom: 30,
    },
    errorTextContainer: {
        paddingBottom: 10,
    },
    errorText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        color: '#4B5563',
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
    },
});
