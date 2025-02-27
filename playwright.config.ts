import { defineConfig } from '@playwright/test';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    testDir: './tests/e2e',
    use: {
        headless: false,
        viewport: { width: 1280, height: 720 },
        permissions: ['bookmarks'],
    },
    projects: [
        {
            name: 'chromium',
            use: {
                browserName: 'chromium',
                launchOptions: {
                    args: [
                        `--disable-extensions-except=${join(__dirname, 'dist')}`,
                        `--load-extension=${join(__dirname, 'dist')}`
                    ]
                }
            },
        }
    ]
});