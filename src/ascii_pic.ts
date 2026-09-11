import * as vsc from 'vscode';
import * as gbs from './globals'

import sharp from 'sharp';

export interface rgba {
  r?: number,
  g?: number,
  b?: number,
  a?: number
}

export class PreparedImgData {
  public w: number;
  public h: number;
  public c: number;
  public raw?: Uint8ClampedArray;

  public constructor(w: number, h: number, c: number) {
    this.w = w;
    this.h = h;
    this.c = c;
  }

  public addRaw(buf: Buffer): PreparedImgData {
    this.raw = new Uint8ClampedArray(buf);
    return this;
  }

  public pixel(x: number, y: number): rgba | null {
    if (!this.raw) return null;
    const ix = (this.w*y+x)*this.c

    switch (this.c) {
      case 1:
        return {
          g: this.raw[ix]
        };
      case 2:
        return {
          g: this.raw[ix],
          a: this.raw[ix+1]
        };
      case 3:
        return {
          r: this.raw[ix],
          g: this.raw[ix+1],
          b: this.raw[ix+2]
        }
      case 4:
        return {
          r: this.raw[ix],
          g: this.raw[ix+1],
          b: this.raw[ix+2],
          a: this.raw[ix+3]
        }
      default:
        return null;
    }
  }
}

async function parseImage(file_path: vsc.Uri) : Promise<PreparedImgData> {
    const content = await vsc.workspace.fs.readFile(file_path);

    const img_data = await sharp(content).raw().toBuffer({ resolveWithObject: true });
    
    const img = new PreparedImgData(
        img_data.info.width, 
        img_data.info.height, 
        img_data.info.channels)
      .addRaw(img_data.data);

    return img;
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