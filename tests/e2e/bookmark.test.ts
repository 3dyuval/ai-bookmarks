import { type BrowserContext, expect, test } from '@playwright/test';
import type { Bookmarks } from "webextension-polyfill";

test.describe('Bookmark Operations', () => {


    let context: BrowserContext;

    test('HELLO WORLD', ({browser}) => {

        if (browser.isConnected()) {
            console.log('Browser is connected');
        }
    })
    test('should add a bookmark', async ({browser}) => {
        // Create a new context
        context = await browser.newContext({
            permissions: []
        });
        const page = await context.newPage();
        // Navigate to Google
        await page.goto('https://www.google.com');

        // Add bookmark using Chrome's bookmarks API
        const title = 'Google Homepage';
        const url = 'https://www.google.com';

        // Create bookmark using chrome.bookmarks API
        const bookmarkCreated = await page.evaluate<Bookmarks.BookmarkTreeNode>(([title, url]) => {
            return new Promise((resolve) => {
                chrome.bookmarks.create(
                    {title, url},
                    (bookmark) => resolve(bookmark)
                );
            });
        }, [title, url]);

        // Navigate to your extension's popup
        // Note: You'll need to replace 'your-extension-id' with actual extension ID
        await page.goto(`chrome-extension://ai-bookmarks/popup.html`);

        // Wait for the treeview to be visible
        await page.waitForSelector('v-treeview');

        // Assert the bookmark exists in your extension's UI
        const bookmarkElement = page.locator('text=Google Homepage');
        await expect(bookmarkElement).toBeVisible();

        // Cleanup - remove the bookmark
        await page.evaluate((bookmarkId) => {
            return new Promise((resolve) => {
                chrome.bookmarks.remove(bookmarkId, resolve);
            });
        }, bookmarkCreated.id);
    });

    test.afterEach(async () => {
        if (context) {
            await context.close();
        }
    });
});