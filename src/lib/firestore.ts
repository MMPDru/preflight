import { db } from './firebase-config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { TrainingVideo } from './training-videos';

/**
 * Fetch all training videos from Firestore, ordered by newest first.
 */
export async function getTrainingVideos(): Promise<TrainingVideo[]> {
    try {
        const q = query(collection(db, 'training-videos'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as TrainingVideo[];
    } catch (error) {
        console.error("Error fetching training videos:", error);
        return [];
    }
}
