import * as vsc from 'vscode';
import * as gbs from './globals'

import * as pictureworks from './pictureworks'

export function calcDepth(col: pictureworks.rgba): number {
  const _method = gbs.configs()?.get<string>("DepthMethod");
  switch (_method) {
    default:
    case 'rgb/3':
      return (col.r + col.g + col.b)/3*(col.a ? col.a/255 : 1.0);
    case "Vec3^2 method":
      return Math.sqrt(col.r*col.r + col.g*col.g + col.b*col.b)*(col.a ? col.a/255 : 1.0);
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

export const DEF_SYB = "@$#%&*+=~-:,. " ;
export function signFromDepth(min: number, max: number, depth: number): string {
  return DEF_SYB[Math.floor((depth-min)/(max-min)*(DEF_SYB.length-1))];
}

export async function test(path: vsc.Uri) {
  vsc.window.showInformationMessage("Testing img");
  const trans = await pictureworks.parseImage(path);

  const config = gbs.configs();
  if (!config) throw "Config is null";
  let tw = config.get<number>("PicWidth");
  let th = config.get<number>("PicHeight");
  if (!tw || !th) throw "Config part is null";

  const blockW = trans.w/tw;
  const blockH = trans.h/th;

  vsc.window.showInformationMessage(`${trans.bpp} ${trans.w} ${trans.h} ${blockW} ${blockH}`);
 
  let mn = Infinity;
  let mx = 0;
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      var pxl = trans.pixel(Math.floor(x*blockW), Math.floor(y*blockH));
      if (!pxl) pxl = {r: 0, g: 0, b: 0, a: 0};
      const depth = calcDepth(pxl);
      mx = Math.max(mx, depth);
      mn = Math.min(mn, depth);
    }
  }

  let strBuild: string = "";
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      var pxl = trans.pixel(Math.floor(x*blockW), Math.floor(y*blockH));
      if (!pxl) pxl = {r: 0, g: 0, b: 0, a: 0};
      const depth = calcDepth(pxl);
      strBuild += signFromDepth(mn, mx, depth);
    }
    strBuild+="\n";
  }

  console.log(strBuild);

  // let mid = 0;
  // let mn = Infinity;
  // let mx = 0;
  // for (let i = 0; i < trans._depthArray.length; i++) {
  //   let depth = trans._depthArray[i];
  //   mid += depth;
  //   mx = Math.max(mx, depth);
  //   mn = Math.min(mn, depth);
  // }
  // mid /= trans._depthArray.length;

  // vsc.window.showInformationMessage(`${mn} ${mx}: ${mid}`);


}