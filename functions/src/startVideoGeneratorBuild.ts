import * as functions from 'firebase-functions';
import { CloudBuildClient } from '@google-cloud/cloudbuild';
import * as path from 'path';

// Cloud Build client uses Application Default Credentials (the function's service account)
const client = new CloudBuildClient();

/**
 * Starts a Cloud Build that builds the video‑generator Docker image and deploys it to Cloud Run.
 * This mirrors the steps in video-generator-cloud/cloudbuild.yaml.
 */
export const startVideoGeneratorBuild = functions.https.onRequest(async (req, res) => {
    try {
        // The project ID is inferred from the environment variable set by Functions runtime
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        if (!projectId) throw new Error('Project ID not available');

        const build = {
            steps: [
                {
                    name: 'gcr.io/cloud-builders/docker',
                    args: ['build', '-t', `gcr.io/${projectId}/video-generator`, './video-generator-cloud'],
                },
                {
                    name: 'gcr.io/cloud-builders/docker',
                    args: ['push', `gcr.io/${projectId}/video-generator`],
                },
                {
                    name: 'gcr.io/google.com/cloudsdktool/cloud-sdk',
                    entrypoint: 'gcloud',
                    args: [
                        'run', 'deploy', 'video-generator',
                        `--image=gcr.io/${projectId}/video-generator`,
                        '--region=us-central1',
                        '--allow-unauthenticated',
                        `--set-env-vars=VIDEO_BUCKET=gen-lang-client-0375513343.appspot.com,APP_URL=https://gen-lang-client-0375513343.web.app`
                    ],
                },
            ],
            images: [`gcr.io/${projectId}/video-generator`],
        };

        const [operation] = await client.createBuild({ projectId, build });
        const buildId = (operation.metadata as any)?.build?.id || 'unknown';
        console.log(`✅ Cloud Build started (id=${buildId})`);
        res.json({ success: true, buildId });
    } catch (err) {
        console.error('❌ Failed to start Cloud Build', err);
        res.status(500).json({ error: (err as Error).message });
    }
});
