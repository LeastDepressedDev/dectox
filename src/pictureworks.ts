import * as vsc from 'vscode';

import * as bmp from 'bmp-ts'

export interface rgba {
  r: number,
  g: number,
  b: number,
  a?: number
}

export class PreparedImgData {
  public w: number;
  public h: number;
  public bpp: number;
  public raw: Buffer;

  public constructor(w: number, h: number, bpp: number, raw: Buffer) {
    this.w = w;
    this.h = h;
    this.bpp = bpp;
    this.raw = raw;
  }

  public index(x: number, y: number): number | null {
    if (y < 0 || x < 0 || x > this.w || y > this.h) return null;
    let shift: number;
    switch (this.bpp) {
      case 24:
      case 32:
      default:
        shift = 4;
      break;
    }
    return shift*(y*this.w+x);
  }

  public pixel(x: number, y: number): rgba | null {
    const ix = this.index(x, y);
    if (!ix || !this.raw) return null;

    switch (this.bpp) {
      default:
      case 24:
        return {
          b: this.raw[ix + 1],
          g: this.raw[ix + 2],
          r: this.raw[ix + 3]
        };
      case 32:
        return {
          a: this.raw[ix],
          b: this.raw[ix + 1],
          g: this.raw[ix + 2],
          r: this.raw[ix + 3]
        };
    }
  }
}

export async function parseImage(file_path: vsc.Uri) : Promise<PreparedImgData> {
    const content = await vsc.workspace.fs.readFile(file_path);
    const fpth_split = file_path.path.split(".");
    const ftype = fpth_split[fpth_split.length-1].toLowerCase();
    
    const cor: bmp.BmpImage = bmp.decode(Buffer.from(content.buffer));
    return new PreparedImgData(cor.width, cor.height, (cor.bitPP ? cor.bitPP : 1), cor.data);
}