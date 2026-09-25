import * as wqr from './web_requests';
import * as gbs from './globals';
import * as vsc from 'vscode';
import { randomUUID } from 'crypto';
import { INSTANCE as bufpInstance } from './views/view_bufp';

/**
 * Local macros for picture grab tab id generation.
 * 
 * @param uuid unique id of the newly(to be) generated tab.
 * @returns final id.
 */
function stabf(uuid: string): string {
    return `${uuid}-picture-grab`;
}

//
// Giga Kostil javascript moment!!!
//
/**
 * @deprecated DO NOT USE THIS NOR REMOVE. It is an important thing that shuts off typescript compiler error.
 */
const window = { scrollBy: function(x: number, y: number){}};

//
//
//


/**
 * List of files located in the image buffer directory.
 */
export var bufpDir: [string, vsc.FileType][];

/**
 * Macros for obtaining image buffer directory.
 * 
 * @returns uri to the directory/folder.
 */
export function getBufpPath(): vsc.Uri {
    const defp = gbs.getExtLocalStorageUri();
    if (!defp) throw "Storage path is null!";
    return vsc.Uri.joinPath(defp, "bufp");
}

/**
 * Tries to open image buffer folder in systems registered explorer. 
 */
export async function revealBufp() {
    const path = getBufpPath();
    await vsc.commands.executeCommand('revealFileInOS', path);
}

/**
 * Scans image buffer page and updates {@link bufpDir}.
 */
export async function updatePicturesDirectory() {
    const path = getBufpPath();

    const dir = await vsc.workspace.fs.readDirectory(path);
    bufpDir = dir;
    if (bufpInstance) bufpInstance.refresh();
    gbs.debugMessage(`Updated bufpDir: ${bufpDir.length-1} files in there.`);
}

/**
 * Handles user web request.
 */
export async function commandHandler() {
    let result = await vsc.window.showInputBox({
        prompt: "Pinterest query to search",
        placeHolder: "Anything you like"
    });

    vsc.window.withProgress({
        location: vsc.ProgressLocation.Notification,
        title: `Request${result ? '('+result+')' : ''} in progress...`,
        cancellable: true
    }, async (prog, tkn) => {
        await getPictures(result ? result : " ", prog);
        await gbs.sleep(1000); // TODO: Make a proper request finished check
        await updatePicturesDirectory();
    });   
}

/**
 * Requests pinterest page and get images from it.
 * 
 * Will be properly documented later. (Or not, who knows)
 * 
 * @param query User pinterest query.
 * @param prog Optional {@link vsc.Progress} if called as task by {@link vsc.window.withProgress}.
 */
export async function getPictures(query: string, prog?: vsc.Progress<{
    message?: string;
    increment?: number;
}>) {

    if (prog) prog.report({message: "Preparing", increment: 0}); // 0%

    const cfg = gbs.configs();
    if (!cfg) throw "Configs are null!";
    const path = getBufpPath();
    try {
        await vsc.workspace.fs.stat(path);
        if (cfg.get<boolean>("ShouldClearBufp")) {
            await vsc.workspace.fs.delete(path, {
                recursive: true
            });
            await vsc.workspace.fs.createDirectory(path);
        }
    } catch {
        gbs.debugMessage("bufp directory not found... Creating new one");
        await vsc.workspace.fs.createDirectory(path);
    }

    const del = cfg.get<number>("RequestDelay");
    if (!del) throw "Failed to get RequestDelay config";
    const uuid = randomUUID();

    if (prog) prog.report({message: "Calling page", increment: 10}); // 10%

    const page = await wqr.initTab(stabf(uuid));
    await page.goto(`https://ru.pinterest.com/search/pins/?q=${query}&rs=typed`);

    const imagination: Set<string> = new Set();
    const pattern = /(60x60)/;

    for (let i = 1; i <= 10; i++) {

        const result = (await page.$$eval(".iFOUS5", els => {
            return els.map(element => element.src);
        })).filter((element) => !pattern.exec(element));
        const message = `Scanning page: Iteration: ${i}: Got ${result.length} pics.`;
        if (gbs.isDebug()) console.log(message);
        if (prog) prog.report({message: message, increment: 7}); // 7% each

        result.forEach((img) => imagination.add(img));

        await page.evaluate(() => {
            window.scrollBy(0, 500);
        });

        await gbs.sleep(del);
    } // 70% final >> 80%

    if (gbs.isDebug()) console.log(imagination.size);

    if (prog) prog.report({message: "Downloading pictures", increment: 0}); // 80%
    let i = 0;
    imagination.forEach(img => {
        fetch(img).then((response) => {
            response.arrayBuffer().then(buf => {
                vsc.workspace.fs.writeFile(vsc.Uri.joinPath(path, `${i++}.jpg`), new Uint8Array(buf));
            });
        })
    });

    if (prog) prog.report({message: "Clean up", increment: 20}); // 100%

    await wqr.closeTab(stabf(uuid));
    vsc.window.showInformationMessage(`Got ${imagination.size} pictures from pinterest.`);
    if (cfg.get<boolean>("OpenBufpFolderAfterRequest")) await revealBufp();
}