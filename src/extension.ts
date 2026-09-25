import * as vsc from 'vscode';
import * as gbs from './globals';

import { activate as initWebRequests, close as closeWebRequests } from './web_requests';

import { commandHandler as asciiPicHandler, placePicture } from './ascii_pic'; 
import { commandHandler as smartTabHandler } from './smart_tab';
import { getPictures, revealBufp, commandHandler as grabPicHandler, updatePicturesDirectory } from './catch_pin';
import { GeneralTreeProvider } from './views/view_general';
import { INSTANCE } from './views/view_bufp';

export function activate(context: vsc.ExtensionContext) {
    if (gbs.isDebug()) gbs.debugMessage("[DEBUG] dectox It is started!!!");
    gbs.setContext(context);
    updatePicturesDirectory();

    // Modules
    vsc.commands.registerCommand("dectox.ChoosePlacePicture", asciiPicHandler); // Ascii picture handler proc
    vsc.commands.registerCommand("dectox.smartTab", smartTabHandler); // Smart tab handler proc
    vsc.commands.registerCommand("dectox.grabpics", grabPicHandler); // Picture requester proc

    // System
    vsc.commands.registerCommand("dectox.refreshViewBufp", async () => INSTANCE.refresh());
    vsc.commands.registerCommand("dectox.PlacePic", async (cmd) => {
        placePicture(cmd.resourceUri);
    });

    // Callables
    vsc.commands.registerCommand("dectox.reavealBufp", revealBufp); //  Reveal buffer folder command
    vsc.commands.registerCommand("decctox.pintest", () => {getPictures("anything");});

    vsc.window.registerTreeDataProvider("dectoxGeneral", new GeneralTreeProvider());
    vsc.window.registerTreeDataProvider("dectoxBufp", INSTANCE);

    initWebRequests();
}

export function deactivate() {
    closeWebRequests();
}