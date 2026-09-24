import * as vsc from 'vscode';
import * as gbs from './globals'

import * as pictureworks from './pictureworks'

/**
 * Calculates `depth` for the given color in {@link pictureworks.rgba} format.
 * 
 * @param col Pixel's color.
 * @returns depth (Grayscale value).
 */
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

/**
 * Emplaces picture into the active editor.
 * 
 * @param path Uri of the image
 */
export async function placePicture(path: vsc.Uri) {
  const imgData = await pictureworks.parseImage(path);
  const config = gbs.configs();
  if (!config) throw "Config is null";

  let tw = config.get<number>("PicWidth");
  let th = config.get<number>("PicHeight");
  if (!tw || !th) throw "Config part is null";

  const blockW = imgData.w/tw;
  const blockH = imgData.h/th;
  let mn = Infinity;
  let mx = 0;

  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      var pxl = imgData.pixel(Math.floor(x*blockW), Math.floor(y*blockH));
      if (!pxl) continue;
      const depth = calcDepth(pxl);
      mx = Math.max(mx, depth);
      mn = Math.min(mn, depth);
    }
  }

  let strBuild: string = "";
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      var pxl = imgData.pixel(Math.floor(x*blockW), Math.floor(y*blockH));
      if (!pxl) pxl = {r: 0, g: 0, b: 0, a: 0};
      const depth = calcDepth(pxl);
      strBuild += signFromDepth(mn, mx, depth);
    }
    strBuild+="\n";
  }
  const editor = vsc.window.activeTextEditor;
  if (!editor) throw "Attempted to write in non existant editor."
  editor.edit((qui) => {
    qui.insert(editor.selection.active, getCommentSign()+strBuild.replaceAll("\n", `\n${getCommentSign()}`));
  });
}

/**
 * Handles *Choose picture to place* command.
 */
export async function commandHandler() {
    if (gbs.emg_cutoff) {
        gbs.msgCutoff(); return;
    }
    const selector = await vsc.window.showOpenDialog({
        title: "Choose picture to upload",
        filters: {
            "Image": ["bmp", "jpg", "png", "jpeg"]
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

    await placePicture(vsc.Uri.file(selector[0].path));
}

/**
 * Obtain ASCII string which to be used for image conversion. Uses `dectox.ASCIILayers` setting to determine which to use.
 * 
 * @returns ascii order string.
 */
export function asciiOrder(): string {
  const config = gbs.configs()?.get<string>("ASCIILayers");
  if (!config) throw "Null ascii config error";
  switch(config) {
    case '10': return "@%#*+=-:. ";
    case '13': return "@#%&*+=~-:,. ";
    default:
    case '14': return "@$#%&*+=~-:,. ";
    case '20': return "@%#W&8oahkbdpqwmZO0Q";
    case '70': return "@%#WMB&8$oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
    case '71': return "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
  }
}

/**
 * Obtain symbols responsible for commenting code relative to the opened files language id.
 * 
 * @returns sign(s) string. If there is no active editor return `null`.
 */
export function getCommentSign(): string|null {
  //TODO: Make it supproted for more languages or auto detect comment sign
  const editor = vsc.window.activeTextEditor;
  if (!editor) return null;
  let sign = '';
  if (!gbs.configs()?.get<boolean>("DisableCommentSigns")) {
    switch (editor.document.languageId) {
      case 'plain':
        sign = '';
        break;
      case 'lua':
        sign = '--';
        break;
      case "shellscript":
      case "python":
        sign = '#';
        break;
      default:
        sign = "//";
        break;
    }
    if (gbs.isDebug()) console.log(`[DECTOX DEBUG] Comment sign for recent operation: ${editor.document.languageId}(${sign})`);
  }
  return sign;
}

/**
 * Obtain an ascii symbol for the specific color.
 * 
 * @param min minimal depth over the image.
 * @param max maximal depth over the image.
 * @param depth current color's depth calculated via {@link calcDepth}.
 * @returns ascii symbol from {@link asciiOrder} created order string.
 */
export function signFromDepth(min: number, max: number, depth: number): string {
  const order = asciiOrder();
  return order[Math.floor((depth-min)/(max-min)*(order.length-1))];
}