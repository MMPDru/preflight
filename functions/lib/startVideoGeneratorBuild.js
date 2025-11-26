"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startVideoGeneratorBuild = void 0;
const functions = __importStar(require("firebase-functions"));
const cloudbuild_1 = require("@google-cloud/cloudbuild");
// Cloud Build client uses Application Default Credentials (the function's service account)
const client = new cloudbuild_1.CloudBuildClient();
/**
 * Starts a Cloud Build that builds the video‑generator Docker image and deploys it to Cloud Run.
 * This mirrors the steps in video-generator-cloud/cloudbuild.yaml.
 */
exports.startVideoGeneratorBuild = functions.https.onRequest(async (req, res) => {
    try {
        // The project ID is inferred from the environment variable set by Functions runtime
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        if (!projectId)
            throw new Error('Project ID not available');
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
        const buildId = operation.metadata?.build?.id || 'unknown';
        console.log(`✅ Cloud Build started (id=${buildId})`);
        res.json({ success: true, buildId });
    }
    catch (err) {
        console.error('❌ Failed to start Cloud Build', err);
        res.status(500).json({ error: err.message });
    }
});
//# sourceMappingURL=startVideoGeneratorBuild.js.map