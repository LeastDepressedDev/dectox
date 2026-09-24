import * as vsc from 'vscode';

/**
 * Interface for storing RedGreenBlueAlpha colors.
 */
export interface rgba {
  r: number,
  g: number,
  b: number,
  a?: number
}

/**
 * Class that provides essential functional for working with raw image data.
 * 
 * Provides methods for compact calls of specific pixel or calculating it's index. I know, it is kinda stupid to comment things like this
 * but we are forced to do so...
 */
export class PreparedImgData {
  
  /**
   * Width of the image. Initialised on constructore call.
   */
  public readonly w: number;

  /**
   * Height of the image. Initialised on constructore call.
   */
  public readonly h: number;

  /**
   * Raw image byte data. Initialised on constructore call.
   */
  public readonly raw: Uint8ClampedArray;

  /**
   * Default constructor for {@link PreparedImgData}
   * 
   * @param w Width of the imported byte data array.
   * @param h Height of the imported byte data array.
   * @param raw Raw pixel data byte array.
   */
  public constructor(w: number, h: number, raw: Uint8ClampedArray) {
    this.w = w;
    this.h = h;
    this.raw = raw;
  }

  /**
   * Calculated 1D index of the specific pixel. 
   * 
   * @param x Horizontal coordinate.
   * @param y Vertical coordinate.
   * @returns 1D array pixel's coordinate if it exists. If it doesn't - returns null.
   */
  public index(x: number, y: number): number | null {
    if (y < 0 || x < 0 || x > this.w || y > this.h) return null;
    return 4*(y*this.w+x);
  }

  /**
   * Obtains specific pixel as {@link rgba} implemented object.
   * 
   * @param x Horizontal coordinate.
   * @param y Vertical coordinate.
   * @returns implemented {@link rgba} object if pixel exists. If it doesn't - returns null.
   */
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

/**
 * Reads given file and creates {@link PreparedImgData} object of it. 
 * 
 * @param file_path {@link vsc.Uri} path to the image resource being imported.
 * @returns Promise for the created {@link PreparedImgData}.
 */
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