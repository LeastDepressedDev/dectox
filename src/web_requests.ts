import * as vsc from 'vscode';
import * as gbs from './globals'
import type { Browser, Page } from 'puppeteer-core' with { "resolution-mode": "import" };

export var browser: Browser;
export var available: boolean = false;
export var pages: Map<string, Page>;

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

export async function initTab(key: string): Promise<Page> {
    const page = await browser.newPage();
    pages.set(key, page);
    return page;
}

export async function closeTab(key: string): Promise<boolean> {
    if (!pages.has(key)) return false;
    pages.get(key)?.close();
    pages.delete(key);
    return true;
}

export async function close() {
    browser.close();
}