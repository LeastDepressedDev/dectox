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

export async function getPictures(query: string) {
    const defp = gbs.getExtLocalStorageUri();
    if (!defp) throw "Storage path is null!";
    const path = vsc.Uri.joinPath(defp, "bufp");
    try {
        await vsc.workspace.fs.stat(path);
    } catch {
        gbs.debugMessage("bufp directory not found... Creating new one");
        await vsc.workspace.fs.createDirectory(path);
    }

    const uuid = randomUUID();
    const page = await wqr.initTab(stabf(uuid));
    
    await page.goto(`https://ru.pinterest.com/search/pins/?q=${query}&rs=typed`);

    const imagination: Set<string> = new Set();
    const pattern = /(60x60)/;

    for (let i = 0; i < 10; i++) {

        const result = (await page.$$eval(".iFOUS5", els => {
            return els.map(element => element.src);
        })).filter((element) => !pattern.exec(element));
        console.log(`Iteration: ${i}: Got ${result.length} pics.`);

        result.forEach((img) => imagination.add(img));

        await page.evaluate(() => {
            window.scrollBy(0, 200);
        });

        await gbs.sleep(200);
    }

    console.log(imagination.size);

    let i = 0;
    imagination.forEach(img => {
        fetch(img).then((response) => {
            response.arrayBuffer().then(buf => {
                console.log(buf.byteLength);
                vsc.workspace.fs.writeFile(vsc.Uri.joinPath(path, `${i++}.jpg`), new Uint8Array(buf));
            });
        })
    });

    await wqr.closeTab(stabf(uuid));
}