import * as vsc from 'vscode';

export interface rgba {
  r: number,
  g: number,
  b: number,
  a?: number
}

export class PreparedImgData {
  public readonly w: number;
  public readonly h: number;
  public readonly raw: Uint8ClampedArray;

  public constructor(w: number, h: number, raw: Uint8ClampedArray) {
    this.w = w;
    this.h = h;
    this.raw = raw;
  }

  public index(x: number, y: number): number | null {
    if (y < 0 || x < 0 || x > this.w || y > this.h) return null;
    return 4*(y*this.w+x);
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
    const safi = await import("safi-image"); // Dynamic import because of JavaScript bieng dorky again
    const jpeg = await import("jpeg-js");

    const content = await vsc.workspace.fs.readFile(file_path);
    const fpth_split = file_path.path.split(".");
    const ftype = fpth_split[fpth_split.length-1].toLowerCase();

    if (ftype == "jpg" || ftype == "jpeg") { // While main library does not support progressives
      const img = await jpeg.decode(content);
      return new PreparedImgData(img.width, img.height, new Uint8ClampedArray(img.data));
    } else {
      const img = await safi.decode(content);
      return new PreparedImgData(img.width, img.height, img.data);
    }
}