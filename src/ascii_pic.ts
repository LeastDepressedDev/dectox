import * as vsc from 'vscode';
import * as gbs from './globals'

import * as pictureworks from './pictureworks'

export function calcDepth(col: pictureworks.rgba) {
  return Math.sqrt(col.r*col.r + col.g*col.g + col.b*col.b);
}

export class TransitedPicture extends pictureworks.PreparedImgData {
  public dptArray?: Float32Array

  public depthArray(): TransitedPicture {
    this.dptArray = new Float32Array(this.w*this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const pxl = this.pixel(x, y);
        if (!pxl) throw "Nullified pixel... Probably image corrupted";
        this.dptArray[this.h*y+x] = calcDepth(pxl);
      }
    }
    return this;
  }
}

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
    const imgData = await pictureworks.parseImage(vsc.Uri.file(selector[0].path));
    vsc.window.showInformationMessage(`PX: ${imgData.pixel(100, 100)?.g}`);
}

export async function test(path: vsc.Uri) {
  vsc.window.showInformationMessage("Testing img");
  const imgData = await pictureworks.parseImage(path);
  const trans = (imgData as TransitedPicture).depthArray();
  
  
}