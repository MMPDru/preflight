# PreFlight Pro Backend Deployment

This backend is containerized and ready for deployment to Google Cloud Run.

## Prerequisites

1.  Google Cloud SDK (`gcloud`) installed and authenticated.
2.  A Google Cloud Project created.

## Deployment Steps

1.  **Build and Submit the Container Image**

    Run the following command from the `server/` directory:

    ```bash
    gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/pre-press-server
    ```

    Replace `[YOUR_PROJECT_ID]` with your actual Google Cloud project ID.

2.  **Deploy to Cloud Run**

    ```bash
    gcloud run deploy pre-press-server \
      --image gcr.io/[YOUR_PROJECT_ID]/pre-press-server \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

3.  **Update Frontend**

    Once deployed, Cloud Run will provide a URL (e.g., `https://pre-press-server-xyz.a.run.app`).
    Update the frontend API calls in `src/lib/automation-templates.ts` to point to this new URL instead of `http://localhost:3001`.

## Local Testing with Docker

To test the container locally:

1.  Build the image:
    ```bash
    docker build -t pre-press-server .
    ```

2.  Run the container:
    ```bash
    docker run -p 3001:3001 pre-press-server
    ```
