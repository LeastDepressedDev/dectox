import * as vsc from 'vscode';
import * as gbs from './globals'

export async function commandHandler() {
    if (gbs.emg_cutoff) {
        gbs.msgCutoff(); return;
    }
    const selector = await vsc.window.showOpenDialog({
        title: "Choose picture to upload",
        filters: {
            "Image": ["png", "jpg", "jpeg"]
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

    // Test of parser
    // const imgData = await parseImage(vsc.Uri.file(selector[0].path));
    // vsc.window.showInformationMessage(`PX: ${imgData.pixel(100, 100)?.g}`);
}