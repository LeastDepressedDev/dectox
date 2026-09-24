import * as gbs from './globals'
import type { Browser, Page } from 'puppeteer-core' with { "resolution-mode": "import" };

/**
 * Web browser instance. Set when `active` called.
 */
export var browser: Browser;

/**
 * Availability of Web requests functions. 
 * `true` - brower is up, everything is just fine.
 * `false` - browser is not up or some error caused a Web requests cutoff.
 */
export var available: boolean = false;

/**
 * Container for pages. Maps id: string to page: Page.
 */
export var pages: Map<string, Page>;

/**
 * Activates Web requests functional. If browser is already available will do nothing.
 */
export async function activate() {
    if (available) return;
    const cfg = gbs.configs();
    if (!cfg) return;
    const ppt = await import("puppeteer-core");
    browser = await ppt.launch({
        executablePath: cfg.get<string>("BrowserPath")
    });

    console.log(await browser.version());
    pages = new Map();
    available = true;
}

/**
 * Creates virtual browser tab. 
 * 
 * Works like a terminal version of a default browser. It allows you to use cookies and other things. To learn more read `puppeteer` lib docs.
 * 
 * @param key `string` id of a tab. 
 * @returns Promise to the Page instance being initialised. 
 */
export async function initTab(key: string): Promise<Page> {
    const page = await browser.newPage();
    pages.set(key, page);
    return page;
}

/**
 * Closes virtual browser tab.
 * 
 * @param key `string` id of a tab. 
 * @returns Promise to boolean value. True if operation succeeded.
 */
export async function closeTab(key: string): Promise<boolean> {
    if (!pages.has(key)) return false;
    pages.get(key)?.close();
    pages.delete(key);
    return true;
}

/**
 * Deactivates browser functional.
 */
export async function close() {
    pages.forEach(async (v, k) => {
        await closeTab(k);
    });
    browser.close();
    available = false;
}