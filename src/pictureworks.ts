import * as vsc from 'vscode';
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

  public index(x: number, y: number): number | null {
    if (y < 0 || x < 0 || x > this.w || y > this.h) return null;
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
    return ix;
  }

  public pixel(x: number, y: number): rgba | null {
    const ix = this.index(x, y);
    if (!ix || !this.raw) return null;

    return {
      r: this.raw[ix],
      g: this.raw[ix + 1],
      b: this.raw[ix + 2],
      a: this.raw[ix + 3]
    };
  }
}

export async function parseImage(file_path: vsc.Uri) : Promise<PreparedImgData> {
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