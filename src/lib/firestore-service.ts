import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    QueryConstraint,
    type WhereFilterOp,
    type DocumentData,
    type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase-config';
import type {
    User,
    Job,
    Annotation,
    Comment,
    Workflow,
    AnalyticsEvent,
    QueryOptions,
} from './types';

// Collection names
export const COLLECTIONS = {
    USERS: 'users',
    JOBS: 'jobs',
    ANNOTATIONS: 'annotations',
    COMMENTS: 'comments',
    WORKFLOWS: 'workflows',
    ANALYTICS: 'analytics',
} as const;

// Generic CRUD operations
export class FirestoreService<T extends Record<string, any>> {
    constructor(private collectionName: string) { }

    // Create
    async create(id: string, data: Omit<T, 'id'>): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await setDoc(docRef, { ...data, id });
    }

    // Read one
    async getById(id: string): Promise<T | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as T) : null;
    }

    // Read all
    async getAll(options?: QueryOptions): Promise<T[]> {
        const collectionRef = collection(db, this.collectionName);
        const constraints: QueryConstraint[] = [];

        if (options?.where) {
            options.where.forEach(({ field, operator, value }) => {
                constraints.push(where(field, operator as WhereFilterOp, value));
            });
        }

        if (options?.orderBy) {
            constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
        }

        if (options?.limit) {
            constraints.push(limit(options.limit));
        }

        const q = query(collectionRef, ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as T);
    }

    // Update
    async update(id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, data as any);
    }

    // Delete
    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    // Real-time listener
    subscribe(
        callback: (data: T[]) => void,
        options?: QueryOptions
    ): () => void {
        const collectionRef = collection(db, this.collectionName);
        const constraints: QueryConstraint[] = [];

        if (options?.where) {
            options.where.forEach(({ field, operator, value }) => {
                constraints.push(where(field, operator as WhereFilterOp, value));
            });
        }

        if (options?.orderBy) {
            constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
        }

        if (options?.limit) {
            constraints.push(limit(options.limit));
        }

        const q = query(collectionRef, ...constraints);

        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as T);
            callback(data);
        });
    }

    // Subscribe to single document
    subscribeToDoc(id: string, callback: (data: T | null) => void): () => void {
        const docRef = doc(db, this.collectionName, id);
        return onSnapshot(docRef, (doc) => {
            callback(doc.exists() ? (doc.data() as T) : null);
        });
    }
}

// Specialized services for each collection
export const userService = new FirestoreService<User>(COLLECTIONS.USERS);
export const jobService = new FirestoreService<Job>(COLLECTIONS.JOBS);
export const annotationService = new FirestoreService<Annotation>(COLLECTIONS.ANNOTATIONS);
export const commentService = new FirestoreService<Comment>(COLLECTIONS.COMMENTS);
export const workflowService = new FirestoreService<Workflow>(COLLECTIONS.WORKFLOWS);
export const analyticsService = new FirestoreService<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

// Specialized job queries
export const jobQueries = {
    async getByUser(userId: string): Promise<Job[]> {
        return jobService.getAll({
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: { field: 'uploadDate', direction: 'desc' },
        });
    },

    async getByStatus(status: Job['status']): Promise<Job[]> {
        return jobService.getAll({
            where: [{ field: 'status', operator: '==', value: status }],
            orderBy: { field: 'uploadDate', direction: 'desc' },
        });
    },

    async getAssignedToAgent(agentId: string): Promise<Job[]> {
        return jobService.getAll({
            where: [{ field: 'assignedTo', operator: '==', value: agentId }],
            orderBy: { field: 'uploadDate', direction: 'desc' },
        });
    },

    subscribeToUserJobs(userId: string, callback: (jobs: Job[]) => void): () => void {
        return jobService.subscribe(callback, {
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: { field: 'uploadDate', direction: 'desc' },
        });
    },
};

// Specialized annotation queries
export const annotationQueries = {
    async getByJob(jobId: string): Promise<Annotation[]> {
        return annotationService.getAll({
            where: [{ field: 'jobId', operator: '==', value: jobId }],
            orderBy: { field: 'createdAt', direction: 'asc' },
        });
    },

    async getByPage(jobId: string, page: number): Promise<Annotation[]> {
        return annotationService.getAll({
            where: [
                { field: 'jobId', operator: '==', value: jobId },
                { field: 'page', operator: '==', value: page },
            ],
        });
    },

    subscribeToJobAnnotations(
        jobId: string,
        callback: (annotations: Annotation[]) => void
    ): () => void {
        return annotationService.subscribe(callback, {
            where: [{ field: 'jobId', operator: '==', value: jobId }],
            orderBy: { field: 'createdAt', direction: 'asc' },
        });
    },
};

// Specialized comment queries
export const commentQueries = {
    async getByJob(jobId: string): Promise<Comment[]> {
        return commentService.getAll({
            where: [{ field: 'jobId', operator: '==', value: jobId }],
            orderBy: { field: 'createdAt', direction: 'asc' },
        });
    },

    async getByAnnotation(annotationId: string): Promise<Comment[]> {
        return commentService.getAll({
            where: [{ field: 'annotationId', operator: '==', value: annotationId }],
            orderBy: { field: 'createdAt', direction: 'asc' },
        });
    },

    subscribeToJobComments(
        jobId: string,
        callback: (comments: Comment[]) => void
    ): () => void {
        return commentService.subscribe(callback, {
            where: [{ field: 'jobId', operator: '==', value: jobId }],
            orderBy: { field: 'createdAt', direction: 'asc' },
        });
    },
};

// Specialized workflow queries
export const workflowQueries = {
    async getTemplates(): Promise<Workflow[]> {
        return workflowService.getAll({
            where: [{ field: 'isTemplate', operator: '==', value: true }],
            orderBy: { field: 'usageCount', direction: 'desc' },
        });
    },

    async getUserWorkflows(userId: string): Promise<Workflow[]> {
        return workflowService.getAll({
            where: [{ field: 'userId', operator: '==', value: userId }],
            orderBy: { field: 'updatedAt', direction: 'desc' },
        });
    },
};

// Analytics helpers
export const analyticsHelpers = {
    async trackEvent(type: AnalyticsEvent['type'], data: Partial<AnalyticsEvent>): Promise<void> {
        const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await analyticsService.create(id, {
            type,
            timestamp: Timestamp.now(),
            metadata: {},
            metrics: {},
            ...data,
        } as Omit<AnalyticsEvent, 'id'>);
    },

    async getRecentEvents(limit: number = 100): Promise<AnalyticsEvent[]> {
        return analyticsService.getAll({
            orderBy: { field: 'timestamp', direction: 'desc' },
            limit,
        });
    },
};

// Utility functions
export const firestoreUtils = {
    // Convert Firebase Timestamp to Date
    timestampToDate(timestamp: Timestamp): Date {
        return timestamp.toDate();
    },

    // Convert Date to Firebase Timestamp
    dateToTimestamp(date: Date): Timestamp {
        return Timestamp.fromDate(date);
    },

    // Get current timestamp
    now(): Timestamp {
        return Timestamp.now();
    },
};
