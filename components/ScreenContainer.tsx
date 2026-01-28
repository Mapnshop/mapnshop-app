import React from 'react';
import { View, StyleSheet, ScrollView, Platform, SafeAreaView, ViewStyle, StatusBar, KeyboardAvoidingView } from 'react-native';
import { Layout } from '@/constants/Layout';
import { Colors } from '@/constants/Colors';

interface ScreenContainerProps {
    children: React.ReactNode;
    scrollable?: boolean;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    fullWidth?: boolean; // If true, simpler internal padding
}

export function ScreenContainer({
    children,
    scrollable = false,
    style,
    contentContainerStyle,
    fullWidth = false,
}: ScreenContainerProps) {

    const Wrapper = scrollable ? ScrollView : View;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <Wrapper
                    style={[styles.container, style]}
                    contentContainerStyle={scrollable ? [styles.scrollContent, contentContainerStyle] : undefined}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.content, fullWidth && styles.fullWidthContent]}>
                        {children}
                    </View>
                </Wrapper>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        width: '100%',
        maxWidth: Layout.maxWidth,
        alignSelf: 'center',
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
    },
    fullWidthContent: {
        paddingHorizontal: 0,
        maxWidth: '100%',
    },
});
