import * as vsc from 'vscode';
import * as gbs from './globals'

import sharp from 'sharp';

// Might be changed later because i dont like this method and libraries
export async function parseImage(file_path: vsc.Uri) {
    
}

export async function commandHandler() {
    if (gbs.emg_cutoff) {
        gbs.msgCutoff(); return;
    }
    const selector = await vsc.window.showOpenDialog({
        title: "Choose picture to upload",
        filters: {
            "Image": ["png", "bmp", "jpg", "jpeg"]
        },
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false
    });

    if (!selector || selector.length<1) {
        vsc.window.showErrorMessage("Aborting ASCII picture placement...\nNo image file specified.");
        return;
    }

    if (gbs.isDebug()) gbs.debugMessage(`[DEBUG] Got file path: "${selector[0].path}".`);

    const imgData = await parseImage(vsc.Uri.file(selector[0].path));
}