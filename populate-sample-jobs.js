// Script to populate Firestore with sample jobs for testing
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sampleJobs = [
    {
        id: 'job-sample-1',
        fileName: 'brochure-design.pdf',
        status: 'completed',
        uploadDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000 * 2)),
        fileSize: 2500000,
        userId: 'mock-user-id',
        fileUrl: '',
        analysisResults: {
            status: 'pass',
            issues: [],
            warnings: 2,
            errors: 0
        },
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000 * 2)),
        updatedAt: admin.firestore.Timestamp.now(),
    },
    {
        id: 'job-sample-2',
        fileName: 'business-cards.pdf',
        status: 'pending',
        uploadDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)),
        fileSize: 1200000,
        userId: 'mock-user-id',
        fileUrl: '',
        analysisResults: null,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)),
        updatedAt: admin.firestore.Timestamp.now(),
    },
    {
        id: 'job-sample-3',
        fileName: 'poster-final.pdf',
        status: 'queue',
        uploadDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1800000)),
        fileSize: 5800000,
        userId: 'mock-user-id',
        fileUrl: '',
        analysisResults: null,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1800000)),
        updatedAt: admin.firestore.Timestamp.now(),
    },
    {
        id: 'job-sample-4',
        fileName: 'magazine-spread.pdf',
        status: 'completed',
        uploadDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000)),
        fileSize: 8900000,
        userId: 'mock-user-id',
        fileUrl: '',
        analysisResults: {
            status: 'pass',
            issues: [],
            warnings: 0,
            errors: 0
        },
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000)),
        updatedAt: admin.firestore.Timestamp.now(),
    },
    {
        id: 'job-sample-5',
        fileName: 'flyer-promo.pdf',
        status: 'queue',
        uploadDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 900000)),
        fileSize: 1500000,
        userId: 'mock-user-id',
        fileUrl: '',
        analysisResults: null,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 900000)),
        updatedAt: admin.firestore.Timestamp.now(),
    },
];

async function populateJobs() {
    try {
        console.log('Populating sample jobs...');

        for (const job of sampleJobs) {
            await db.collection('jobs').doc(job.id).set(job);
            console.log(`✓ Created job: ${job.fileName}`);
        }

        console.log('\n✅ Successfully populated', sampleJobs.length, 'sample jobs');
        console.log('\nJob Status Summary:');
        console.log('- Queue:', sampleJobs.filter(j => j.status === 'queue').length);
        console.log('- Pending:', sampleJobs.filter(j => j.status === 'pending').length);
        console.log('- Completed:', sampleJobs.filter(j => j.status === 'completed').length);

    } catch (error) {
        console.error('Error populating jobs:', error);
    }

    process.exit(0);
}

populateJobs();
