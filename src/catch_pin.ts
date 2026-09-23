import * as wqr from './web_requests';
import * as gbs from './globals';
import * as vsc from 'vscode';
import { randomUUID } from 'crypto';

function stabf(uuid: string): string {
    return `${uuid}-picture-grab`;
}

//
// Giga Kostil javascript moment!!!
//
const window = { scrollBy: function(x: number, y: number){}};

//
//
//



export var bufpDir: [string, vsc.FileType][];

export function getBufpPath(): vsc.Uri {
    const defp = gbs.getExtLocalStorageUri();
    if (!defp) throw "Storage path is null!";
    return vsc.Uri.joinPath(defp, "bufp");
}

export async function updatePicturesDirectory() {
    const path = getBufpPath();

    const dir = await vsc.workspace.fs.readDirectory(path);
    bufpDir = dir;
    gbs.debugMessage(`Updated bufpDir: ${bufpDir.length-1} files in there.`);
}

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
        await getPictures(result ? result : " ");
        await gbs.sleep(1000); // TODO: Make a proper request finished check
        await updatePicturesDirectory();
    });   
}

export async function getPictures(query: string) {
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
    if (!del) throw "Failed to get RequestDelat config";
    const uuid = randomUUID();
    const page = await wqr.initTab(stabf(uuid));
    
    await page.goto(`https://ru.pinterest.com/search/pins/?q=${query}&rs=typed`);

    const imagination: Set<string> = new Set();
    const pattern = /(60x60)/;

    for (let i = 0; i < 10; i++) {

        const result = (await page.$$eval(".iFOUS5", els => {
            return els.map(element => element.src);
        })).filter((element) => !pattern.exec(element));
        if (gbs.isDebug()) console.log(`Iteration: ${i}: Got ${result.length} pics.`);

        result.forEach((img) => imagination.add(img));

        await page.evaluate(() => {
            window.scrollBy(0, 500);
        });

        await gbs.sleep(del);
    }

    if (gbs.isDebug()) console.log(imagination.size);

    let i = 0;
    imagination.forEach(img => {
        fetch(img).then((response) => {
            response.arrayBuffer().then(buf => {
                vsc.workspace.fs.writeFile(vsc.Uri.joinPath(path, `${i++}.jpg`), new Uint8Array(buf));
            });
        })
    });

    await wqr.closeTab(stabf(uuid));
    vsc.window.showInformationMessage(`Got ${imagination.size} pictures from pinterest.`);
}