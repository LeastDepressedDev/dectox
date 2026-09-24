import * as vsc from 'vscode';

export interface LocalException {
    msg: string,
    code?: number,
    cutoff?: boolean
}

export var emg_cutoff: boolean = false;
export function msgCutoff() {vsc.window.showErrorMessage("Action disabled due to emergancy cutoff.\nTry fixing the issue and reload extension.")}
export function throwLocalException(exception: LocalException) {
    vsc.window.showErrorMessage(`Local Runtime exception raised by dectox${exception.code ? `(code: ${exception.code})` : ''}: \n${exception.msg}`);
    if (exception.cutoff) emg_cutoff = true;
    throw exception;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export var context: vsc.ExtensionContext;
export function setContext(ctx: vsc.ExtensionContext) {
    context = ctx;
}

export function getExtLocalStorageUri(): vsc.Uri | undefined {
    return context.globalStorageUri;
}

export function configs(): vsc.WorkspaceConfiguration | null {
    if (emg_cutoff) return null;
    const val = vsc.workspace.getConfiguration("dectox");
    if (!val) {
        throwLocalException({msg: "For some reason configs for dectox are not present", cutoff: true});
    }
    return val;
}


export function isDebug(): boolean | null {
    if (emg_cutoff) return null;
    const val = configs()?.get<boolean>("Debug");
    if (!val) {
        throwLocalException({msg: "Debug value are not present in config", cutoff: true});
        return null;
    }
    return val;
}

export function debugMessage(msg: string) {vsc.window.showInformationMessage(msg);}