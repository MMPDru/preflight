
const API_BASE_URL = 'https://us-central1-gen-lang-client-0375513343.cloudfunctions.net/api/api/v1';

export async function fixPdfWithBackend(fileUrl: string, fixTypes: string[]): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
        // 1. Fetch the file blob
        const response = await fetch(fileUrl);
        const blob = await response.blob();

        // 2. Create FormData
        const formData = new FormData();
        formData.append('file', blob, 'document.pdf');
        formData.append('fixTypes', JSON.stringify(fixTypes));

        // 3. Send to Backend
        const result = await fetch(`${API_BASE_URL}/fix-pdf`, {
            method: 'POST',
            body: formData
        });

        if (!result.ok) {
            const errorText = await result.text();
            throw new Error(`Backend error: ${result.statusText} - ${errorText}`);
        }

        const data = await result.json();
        return {
            success: true,
            url: data.url,
            message: 'Processed successfully by backend.'
        };

    } catch (error: any) {
        console.error('Backend Fix Error:', error);
        return {
            success: false,
            message: error.message || 'Failed to process PDF on backend.'
        };
    }
}
