import { db } from './firebase-config';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { baseTrainingVideos } from './training-videos';

export async function seedTrainingVideos() {
    try {
        const collectionRef = collection(db, 'training-videos');
        
        // Check if we already have videos to avoid duplicates/overwriting if not needed
        // (Though for a hard seed, we might want to overwrite. Let's just overwrite by ID for now)
        
        console.log(`Starting seed of ${baseTrainingVideos.length} videos...`);
        
        let successCount = 0;
        let errorCount = 0;

        for (const video of baseTrainingVideos) {
            try {
                // Use the video ID as the document ID for stability
                const docRef = doc(collectionRef, video.id);
                
                // Add a createdAt timestamp if it doesn't exist in the source (it doesn't)
                const videoData = {
                    ...video,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await setDoc(docRef, videoData, { merge: true });
                successCount++;
            } catch (err) {
                console.error(`Failed to seed video ${video.id}:`, err);
                errorCount++;
            }
        }

        console.log(`Seeding complete. Success: ${successCount}, Errors: ${errorCount}`);
        return { success: true, count: successCount, errors: errorCount };
    } catch (error) {
        console.error("Fatal error during seeding:", error);
        throw error;
    }
}
