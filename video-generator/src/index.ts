import puppeteer, { Page } from 'puppeteer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { v4 as uuidv4 } from 'uuid';

// Load the script definitions
const scripts: any[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../video-scripts.json'), 'utf8')
);

// Base URL of the running app – you can change this to the deployed URL or localhost
const BASE_URL = process.env.APP_URL || 'http://localhost:5173'; // Vite dev default

// Google Cloud TTS – expects GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service‑account JSON
const ttsClient = new TextToSpeechClient();

/**
 * Generate an MP3 audio file for the given voiceover lines.
 */
async function generateVoiceover(id: string, lines: string[]): Promise<string> {
    const audioPath = path.resolve('output', `${id}-voice.mp3`);
    await fs.ensureDir(path.dirname(audioPath));

    // Concatenate all lines into one SSML string with pauses
    const ssml = `<speak>${lines.map(l => `${l}<break time="500ms"/>`).join(' ')}</speak>`;

    const request = {
        input: { ssml },
        // Choose a pleasant voice – you can change languageCode / name
        voice: { languageCode: 'en-US', name: 'en-US-Standard-C' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
    } as any;

    const [response] = await ttsClient.synthesizeSpeech(request);
    await fs.writeFile(audioPath, response.audioContent as Buffer);
    console.log(`✅ Voiceover generated for ${id}`);
    return audioPath;
}

/**
 * Execute the step actions on a Puppeteer page.
 */
async function executeSteps(page: Page, steps: any[]) {
    for (const step of steps) {
        const { action, target, value, duration, description } = step;
        console.log(`▶️ ${description}`);
        switch (action) {
            case 'navigate':
                await page.goto(`${BASE_URL}${target}`, { waitUntil: 'networkidle0' });
                break;
            case 'click':
                await page.waitForSelector(target, { visible: true, timeout: 5000 });
                await page.click(target);
                break;
            case 'type':
                await page.waitForSelector(target, { visible: true, timeout: 5000 });
                await page.type(target, value);
                break;
            case 'hover':
                await page.waitForSelector(target, { visible: true, timeout: 5000 });
                await page.hover(target);
                break;
            case 'select':
                await page.waitForSelector(target, { visible: true, timeout: 5000 });
                await page.select(target, value);
                break;
            case 'toggle':
                await page.waitForSelector(target, { visible: true, timeout: 5000 });
                await page.click(target);
                break;
            case 'upload':
                // For file uploads we need an absolute path to a sample file
                const filePath = path.resolve('samples', value);
                await page.waitForSelector(target, { visible: true, timeout: 5000 });
                const input = await page.$(target);
                await input!.uploadFile(filePath);
                break;
            case 'wait':
                await page.waitForTimeout(duration);
                break;
            default:
                console.warn(`⚠️ Unknown action: ${action}`);
        }
        // Small pause after each step to let UI settle
        await page.waitForTimeout(500);
    }
}

/**
 * Capture a series of screenshots based on the steps.
 * We capture after each step to build a storyboard.
 */
async function captureStoryboard(page: Page, steps: any[], id: string): Promise<string[]> {
    const framesDir = path.resolve('output', `${id}-frames`);
    await fs.ensureDir(framesDir);
    const framePaths: string[] = [];
    let idx = 0;
    for (const step of steps) {
        // after executing the step we take a screenshot
        const screenshotPath = path.join(framesDir, `frame-${String(idx).padStart(3, '0')}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        framePaths.push(screenshotPath);
        idx++;
    }
    return framePaths;
}

/**
 * Combine voiceover audio and storyboard frames into a final MP4.
 */
function assembleVideo(id: string, audioPath: string, frames: string[], duration: string) {
    const videoPath = path.resolve('output', `${id}.mp4`);

    // Calculate frame rate based on number of frames and total video duration
    const totalSeconds = duration.split(':').reduce((acc, t) => acc * 60 + Number(t), 0);
    const fps = frames.length / totalSeconds;

    // Build ffmpeg command
    const ffmpegCommand = ffmpeg()
        .addInput('pipe:0') // placeholder for audio
        .inputOptions(['-f', 'lavfi', '-i', `color=c=black:s=1280x720:r=${fps}`]) // black background video
        .addInput(audioPath)
        .addInputOption('-loop', '1') // loop the image sequence
        .addInput(frames[0]) // use first frame as background (will be overlaid later)
        .complexFilter([
            // overlay each frame at the appropriate timestamp
            `overlay=0:0:enable='between(t,0,${totalSeconds})'`
        ])
        .outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-c:a aac', '-shortest'])
        .output(videoPath);

    // Simpler approach: create a video from the image sequence then merge audio
    const imageSeqPattern = path.join(path.dirname(frames[0]), 'frame-%03d.png');
    ffmpeg()
        .input(imageSeqPattern)
        .inputFPS(fps)
        .outputOptions(['-c:v libx264', '-pix_fmt yuv420p'])
        .save(`${path.resolve('output', `${id}-video.mp4`)}
    )
    .on('end', () => {
      // Merge audio
      ffmpeg()
        .addInput(`${ path.resolve('output', `${id}-video.mp4`) }`)
        .addInput(audioPath)
        .outputOptions(['-c:v copy', '-c:a aac', '-shortest'])
        .save(videoPath)
        .on('end', () => console.log(`✅ Video assembled: ${ videoPath }`))
        .on('error', err => console.error('❌ Error merging audio', err));
    })
    .on('error', err => console.error('❌ Error creating video from frames', err));
}

/**
 * Main driver – iterate over all scripts and produce videos.
 */
async function generateAll() {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 720 } });
  const page = await browser.newPage();

  for (const script of scripts) {
    const { id, duration, steps, voiceover } = script;
    console.log(`\n === Generating video for ${ id } === `);
    await executeSteps(page, steps);
    const frames = await captureStoryboard(page, steps, id);
    const audioPath = await generateVoiceover(id, voiceover);
    assembleVideo(id, audioPath, frames, duration);
  }

  await browser.close();
}

// Run the generator
generateAll().catch(err => console.error('❌ Generation failed', err));
