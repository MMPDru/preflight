import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    Timestamp,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from './firebase-config';

export interface ChatMessage {
    id?: string;
    threadId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    timestamp: Timestamp | Date;
    type: 'text' | 'file' | 'image' | 'proof' | 'system';
    attachments?: any[];
    proofLink?: any;
    mentions?: string[];
    reactions?: any[];
    replyTo?: string;
    isRead: boolean;
    isEdited: boolean;
    sentiment?: 'positive' | 'neutral' | 'negative';
    aiSuggested?: boolean;
    translated?: boolean;
    originalLanguage?: string;
}

export interface ChatThread {
    id?: string;
    title: string;
    participants: string[];
    participantNames: Record<string, string>;
    lastMessage?: any;
    lastMessageAt?: Timestamp | Date;
    unreadCount: Record<string, number>;
    isPinned: Record<string, boolean>;
    isMuted: Record<string, boolean>;
    mode: 'customer' | 'internal' | 'group' | 'broadcast' | 'support';
    createdAt: Timestamp | Date;
    createdBy: string;
    metadata?: {
        customerId?: string;
        proofId?: string;
        ticketId?: string;
    };
}

export interface TypingIndicator {
    threadId: string;
    userId: string;
    userName: string;
    timestamp: Timestamp | Date;
}

class ChatService {
    // Create a new chat thread
    async createThread(thread: Omit<ChatThread, 'id' | 'createdAt'>): Promise<string> {
        const threadData = {
            ...thread,
            createdAt: serverTimestamp(),
            lastMessageAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'chatThreads'), threadData);
        return docRef.id;
    }

    // Send a message
    async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
        const messageData = {
            ...message,
            timestamp: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'chatMessages'), messageData);

        // Update thread's last message
        const threadRef = doc(db, 'chatThreads', message.threadId);
        await updateDoc(threadRef, {
            lastMessage: {
                content: message.content,
                senderId: message.senderId,
                senderName: message.senderName,
                timestamp: serverTimestamp()
            },
            lastMessageAt: serverTimestamp()
        });

        // Increment unread count for other participants
        const threadDoc = await getDocs(query(
            collection(db, 'chatThreads'),
            where('__name__', '==', message.threadId)
        ));

        if (!threadDoc.empty) {
            const thread = threadDoc.docs[0].data() as ChatThread;
            const unreadCount = { ...thread.unreadCount };

            thread.participants.forEach(participantId => {
                if (participantId !== message.senderId) {
                    unreadCount[participantId] = (unreadCount[participantId] || 0) + 1;
                }
            });

            await updateDoc(threadRef, { unreadCount });
        }

        // AI Sentiment Analysis (mock - replace with actual AI service)
        if (message.type === 'text') {
            const sentiment = this.analyzeSentiment(message.content);
            await updateDoc(doc(db, 'chatMessages', docRef.id), { sentiment });
        }

        return docRef.id;
    }

    // Subscribe to messages in a thread
    subscribeToMessages(
        threadId: string,
        callback: (messages: ChatMessage[]) => void
    ): () => void {
        const q = query(
            collection(db, 'chatMessages'),
            where('threadId', '==', threadId),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages: ChatMessage[] = [];
            snapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
            });
            callback(messages);
        });
    }

    // Subscribe to user's threads
    subscribeToThreads(
        userId: string,
        callback: (threads: ChatThread[]) => void
    ): () => void {
        const q = query(
            collection(db, 'chatThreads'),
            where('participants', 'array-contains', userId),
            orderBy('lastMessageAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const threads: ChatThread[] = [];
            snapshot.forEach((doc) => {
                threads.push({ id: doc.id, ...doc.data() } as ChatThread);
            });
            callback(threads);
        });
    }

    // Mark messages as read
    async markAsRead(threadId: string, userId: string): Promise<void> {
        const q = query(
            collection(db, 'chatMessages'),
            where('threadId', '==', threadId),
            where('isRead', '==', false),
            where('senderId', '!=', userId)
        );

        const snapshot = await getDocs(q);
        const updates = snapshot.docs.map(doc =>
            updateDoc(doc.ref, { isRead: true })
        );

        await Promise.all(updates);

        // Reset unread count
        const threadRef = doc(db, 'chatThreads', threadId);
        const threadDoc = await getDocs(query(
            collection(db, 'chatThreads'),
            where('__name__', '==', threadId)
        ));

        if (!threadDoc.empty) {
            const thread = threadDoc.docs[0].data() as ChatThread;
            const unreadCount = { ...thread.unreadCount };
            unreadCount[userId] = 0;
            await updateDoc(threadRef, { unreadCount });
        }
    }

    // Add reaction to message
    async addReaction(messageId: string, userId: string, userName: string, emoji: string): Promise<void> {
        const messageRef = doc(db, 'chatMessages', messageId);
        const messageDoc = await getDocs(query(
            collection(db, 'chatMessages'),
            where('__name__', '==', messageId)
        ));

        if (!messageDoc.empty) {
            const message = messageDoc.docs[0].data() as ChatMessage;
            const reactions = message.reactions || [];

            // Check if user already reacted
            const existingIndex = reactions.findIndex(r => r.userId === userId);

            if (existingIndex >= 0) {
                // Remove reaction
                reactions.splice(existingIndex, 1);
            } else {
                // Add reaction
                reactions.push({ emoji, userId, userName });
            }

            await updateDoc(messageRef, { reactions });
        }
    }

    // Set typing indicator
    async setTyping(threadId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
        const typingRef = doc(db, 'typingIndicators', `${threadId}_${userId}`);

        if (isTyping) {
            await updateDoc(typingRef, {
                threadId,
                userId,
                userName,
                timestamp: serverTimestamp()
            }).catch(() => {
                // Document doesn't exist, create it
                addDoc(collection(db, 'typingIndicators'), {
                    threadId,
                    userId,
                    userName,
                    timestamp: serverTimestamp()
                });
            });
        } else {
            // Remove typing indicator
            await updateDoc(typingRef, {
                timestamp: new Date(0) // Set to old date to expire
            }).catch(() => { });
        }
    }

    // Subscribe to typing indicators
    subscribeToTyping(
        threadId: string,
        currentUserId: string,
        callback: (typingUsers: TypingIndicator[]) => void
    ): () => void {
        const q = query(
            collection(db, 'typingIndicators'),
            where('threadId', '==', threadId)
        );

        return onSnapshot(q, (snapshot) => {
            const now = new Date();
            const typingUsers: TypingIndicator[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data() as TypingIndicator;
                const timestamp = data.timestamp instanceof Timestamp
                    ? data.timestamp.toDate()
                    : data.timestamp;

                // Only show if typing in last 3 seconds and not current user
                if (data.userId !== currentUserId &&
                    now.getTime() - timestamp.getTime() < 3000) {
                    typingUsers.push(data);
                }
            });

            callback(typingUsers);
        });
    }

    // Pin/unpin thread
    async togglePin(threadId: string, userId: string): Promise<void> {
        const threadRef = doc(db, 'chatThreads', threadId);
        const threadDoc = await getDocs(query(
            collection(db, 'chatThreads'),
            where('__name__', '==', threadId)
        ));

        if (!threadDoc.empty) {
            const thread = threadDoc.docs[0].data() as ChatThread;
            const isPinned = { ...thread.isPinned };
            isPinned[userId] = !isPinned[userId];
            await updateDoc(threadRef, { isPinned });
        }
    }

    // Mute/unmute thread
    async toggleMute(threadId: string, userId: string): Promise<void> {
        const threadRef = doc(db, 'chatThreads', threadId);
        const threadDoc = await getDocs(query(
            collection(db, 'chatThreads'),
            where('__name__', '==', threadId)
        ));

        if (!threadDoc.empty) {
            const thread = threadDoc.docs[0].data() as ChatThread;
            const isMuted = { ...thread.isMuted };
            isMuted[userId] = !isMuted[userId];
            await updateDoc(threadRef, { isMuted });
        }
    }

    // Search messages
    async searchMessages(threadId: string, searchQuery: string): Promise<ChatMessage[]> {
        const q = query(
            collection(db, 'chatMessages'),
            where('threadId', '==', threadId),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        const snapshot = await getDocs(q);
        const messages: ChatMessage[] = [];

        snapshot.forEach((doc) => {
            const message = { id: doc.id, ...doc.data() } as ChatMessage;
            if (message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
                messages.push(message);
            }
        });

        return messages;
    }

    // AI Sentiment Analysis (mock implementation)
    private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
        const positiveWords = ['great', 'excellent', 'perfect', 'love', 'amazing', 'wonderful', 'fantastic'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'wrong', 'issue', 'problem', 'error'];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    // Generate AI suggested responses
    async getSuggestedResponses(threadId: string, context: string): Promise<string[]> {
        // In production, this would call an AI service
        // For now, return context-aware suggestions
        const suggestions = [
            "I'll review this and get back to you shortly.",
            "Could you share the proof file?",
            "Let me check with the team.",
            "This looks good to approve!",
            "I've made the requested changes.",
            "When do you need this completed?"
        ];

        // Simple context matching
        if (context.toLowerCase().includes('proof')) {
            return [
                "I'll review the proof now.",
                "The proof looks great!",
                "Could you clarify the changes needed?"
            ];
        }

        if (context.toLowerCase().includes('urgent') || context.toLowerCase().includes('asap')) {
            return [
                "I'll prioritize this right away.",
                "Working on this now.",
                "I can have this ready within the hour."
            ];
        }

        return suggestions.slice(0, 3);
    }

    // Check for escalation triggers
    shouldEscalate(message: string, sentiment: string): boolean {
        const escalationKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'complaint'];
        const lowerMessage = message.toLowerCase();

        const hasKeyword = escalationKeywords.some(keyword => lowerMessage.includes(keyword));
        const isNegative = sentiment === 'negative';

        return hasKeyword || isNegative;
    }

    // Auto-categorize message
    categorizeMessage(content: string): string {
        const categories = {
            'approval': ['approve', 'approved', 'looks good', 'sign off'],
            'revision': ['change', 'fix', 'update', 'modify', 'revise'],
            'question': ['?', 'how', 'what', 'when', 'where', 'why'],
            'urgent': ['urgent', 'asap', 'immediately', 'rush'],
            'technical': ['bleed', 'cmyk', 'resolution', 'dpi', 'color profile']
        };

        const lowerContent = content.toLowerCase();

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }
}

export const chatService = new ChatService();
