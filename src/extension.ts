import * as vsc from 'vscode';
import * as gbs from './globals';

import { activate as initWebRequests, close as closeWebRequests } from './web_requests';

import { commandHandler as asciiPicHandler } from './ascii_pic'; 
import { commandHandler as smartTabHandler } from './smart_tab';
import { getPictures, revealBufp, commandHandler as grabPicHandler } from './catch_pin';

export function activate(context: vsc.ExtensionContext) {
    if (gbs.isDebug()) gbs.debugMessage("[DEBUG] dectox It is started!!!");
    gbs.setContext(context);

    vsc.commands.registerCommand("dectox.PlacePic", asciiPicHandler); // Ascii picture handler proc
    vsc.commands.registerCommand("dectox.smartTab", smartTabHandler); // Smart tab handler proc
    vsc.commands.registerCommand("dectox.grabpics", grabPicHandler); // Picture requester proc

    vsc.commands.registerCommand("dectox.reavealBufp", revealBufp); //  Reveal buffer folder command
    vsc.commands.registerCommand("decctox.pintest", () => {getPictures("anything");});

    initWebRequests();
}

export function deactivate() {
    closeWebRequests();
}