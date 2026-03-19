import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { geminiService } from '../src/services/gemini';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../src/theme';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
};

export default function ChatbotScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        // Initialize the Gemini chat history session
        const session = geminiService.startChatSession();
        setChatSession(session);

        // Add initial greeting from AI visually
        setMessages([
            {
                id: Date.now().toString(),
                text: 'Greetings! I am Avas AI. How can I help you find your dream property today?',
                sender: 'ai',
                timestamp: new Date(),
            }
        ]);
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim() || !chatSession) return;

        const userText = inputText.trim();
        const newMessage: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Send message to Gemini session to maintain history
            const result = await chatSession.sendMessage(userText);
            const responseText = result.response.text();

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'ai',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered a network error while connecting to my AI brain. Please try again.',
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Image
                        source={require('../assets/images/avas-ai-avatar.png')}
                        style={styles.headerAvatar}
                    />
                    <Text style={styles.headerTitle}>Avas AI Guide</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Chat Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
            >
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.messageRow,
                            msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAi
                        ]}
                    >
                        {msg.sender === 'ai' && (
                            <Image
                                source={require('../assets/images/avas-ai-avatar.png')}
                                style={styles.aiAvatarImage}
                            />
                        )}
                        <View
                            style={[
                                styles.messageBubble,
                                msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi
                            ]}
                        >
                            <Text style={msg.sender === 'user' ? styles.textUser : styles.textAi}>
                                {msg.text}
                            </Text>
                            <Text style={msg.sender === 'user' ? styles.timeUser : styles.timeAi}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                ))}

                {isLoading && (
                    <View style={[styles.messageRow, styles.messageRowAi]}>
                        <Image
                            source={require('../assets/images/avas-ai-avatar.png')}
                            style={styles.aiAvatarImage}
                        />
                        <View style={[styles.messageBubble, styles.bubbleAi, { padding: Spacing.md }]}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
                <LinearGradient
                    colors={[Colors.surface, 'rgba(30,30,40,0.95)']}
                    style={styles.inputBackground}
                >
                    <TextInput
                        style={styles.input}
                        placeholder="Ask me about sizes, prices, or Vastu..."
                        placeholderTextColor={Colors.textMuted}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryDark]}
                            style={styles.sendGradient}
                        >
                            <Ionicons name="send" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
        backgroundColor: Colors.surface,
        ...Shadows.sm,
    },
    backButton: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: Colors.glass,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.text,
    },

    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxl,
        gap: Spacing.lg,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: Spacing.sm,
        maxWidth: '85%',
    },
    messageRowUser: {
        alignSelf: 'flex-end',
    },
    messageRowAi: {
        alignSelf: 'flex-start',
        gap: Spacing.sm,
    },
    aiAvatar: {
        width: 32, height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 4,
    },
    aiAvatarImage: {
        width: 32, height: 32,
        borderRadius: 16,
        marginBottom: 4,
    },
    headerAvatar: {
        width: 28, height: 28,
        borderRadius: 14,
    },
    messageBubble: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
    },
    bubbleUser: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    bubbleAi: {
        backgroundColor: Colors.surfaceElevated,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderBottomLeftRadius: 4,
    },
    textUser: {
        ...Typography.body,
        color: '#FFF',
    },
    textAi: {
        ...Typography.body,
        color: Colors.text,
        lineHeight: 22,
    },
    timeUser: {
        ...Typography.tiny,
        color: 'rgba(255,255,255,0.6)',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    timeAi: {
        ...Typography.tiny,
        color: Colors.textMuted,
        alignSelf: 'flex-start',
        marginTop: 4,
    },

    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: Colors.glassBorder,
    },
    inputBackground: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.surfaceBright,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
        minHeight: 48,
        maxHeight: 120,
        ...Typography.body,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sendButton: {
        width: 48, height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    sendGradient: {
        width: '100%', height: '100%',
        justifyContent: 'center', alignItems: 'center',
    }
});
