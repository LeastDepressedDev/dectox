import * as vsc from 'vscode';
import * as gbs from './globals';
import { commandHandler as asciiPicHandler } from './ascii_pic'; 
import { commandHandler as smartTabHandler } from './smart_tab';
import { activate as initWebRequests, close as closeWebRequests } from './web_requests';

export function activate(context: vsc.ExtensionContext) {
    if (gbs.isDebug()) gbs.debugMessage("[DEBUG] dectox It is started!!!");

    vsc.commands.registerCommand("dectox.PlacePic", asciiPicHandler); // Ascii picture handler proc
    vsc.commands.registerCommand("dectox.smartTab", smartTabHandler); // Smart tab handler proc

    initWebRequests();
}

export function deactivate() {
    closeWebRequests();
}