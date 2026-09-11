import * as vsc from 'vscode';
import * as gbs from './globals'

import * as pngjs from 'pngjs'; 
import * as jpeg from 'jpeg-js'

export interface rgba {
  r: number,
  g: number,
  b: number,
  a?: number
}

export class PreparedImgData {
  public w: number;
  public h: number;
  public ext: string;
  public raw?: Uint8ClampedArray;

  public constructor(ext: string, w: number, h: number) {
    this.w = w;
    this.h = h;
    this.ext = ext;
  }

  public addRaw(buf: Buffer): PreparedImgData {
    this.raw = new Uint8ClampedArray(buf);
    return this;
  }

  public pixel(x: number, y: number): rgba | null {
    if (!this.raw || y < 0 || x < 0 || x > this.w || y > this.h) return null;
    var ix: number;

    switch (this.ext) {
      case 'png':
        ix = (this.w * y + x) << 2;
      break;
      case 'jpeg':
      case 'jpg':
        ix = (this.w * y + x) * 4;
      break;
      default: throw "Unsupported on post stage... wtf?";
    }

    return {
      r: this.raw[ix],
      g: this.raw[ix + 1],
      b: this.raw[ix + 2],
      a: this.raw[ix + 3]
    };
  }
}

async function parseImage(file_path: vsc.Uri) : Promise<PreparedImgData> {
    const content = await vsc.workspace.fs.readFile(file_path);
    const fpth_split = file_path.path.split(".");
    const ftype = fpth_split[fpth_split.length-1].toLowerCase();
    
    var pic: PreparedImgData;

    switch (ftype) {
      case 'png':
      {
        const data = pngjs.PNG.sync.read(Buffer.from(content));
        pic = new PreparedImgData(ftype, data.width, data.height).addRaw(data.data);
      }
      break;
      case 'jpeg':
      case 'jpg':
      {
        const data = jpeg.decode(Buffer.from(content));
        pic = new PreparedImgData(ftype, data.width, data.height).addRaw(data.data);
      }
      break;
      default: throw "Not supported"
    }
  

    return pic;
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
    // const imgData = await parseImage(vsc.Uri.file(selector[0].path));
    // vsc.window.showInformationMessage(`PX: ${imgData.pixel(100, 100)?.g}`);
}