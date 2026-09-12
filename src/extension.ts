import * as vsc from 'vscode';
import * as gbs from './globals';
import { commandHandler as asciiPicHandler, test }  from './ascii_pic'; 

export function activate(context: vsc.ExtensionContext) {
    if (gbs.isDebug()) gbs.debugMessage("[DEBUG] dectox It is started!!!");

    vsc.commands.registerCommand("dectox.PlacePic", asciiPicHandler); // Ascii picture handler proc
    vsc.commands.registerCommand("dectox.TestAscii", () => {test(vsc.Uri.file("/home/sirtage/all/isop/dectox/wbs.png"));});
}

export function deactivate() {
    
}