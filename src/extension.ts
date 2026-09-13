import * as vsc from 'vscode';
import * as gbs from './globals';
import { commandHandler as asciiPicHandler } from './ascii_pic'; 
import * as lb from './left-bar/provider';

async function generalTest() {
    console.log("Test viewcont click")
}

export function activate(context: vsc.ExtensionContext) {
    if (gbs.isDebug()) {
        gbs.debugMessage("[DEBUG] dectox It is started!!!");
        vsc.commands.registerCommand("dectox.Test", generalTest) 
    }

    vsc.commands.registerCommand("dectox.PlacePic", asciiPicHandler); // Ascii picture handler proc

    lb.registerOptionsProvider(context); // Options Webview
}

export function deactivate() {
    
}