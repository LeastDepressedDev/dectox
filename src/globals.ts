import * as vsc from 'vscode';

/**
 * Interface for building local exceptions.
 */
export interface LocalException {
    msg: string,
    code?: number,
    cutoff?: boolean
}

/**
 * Disables most of the functional when true. Becomes true on critical errors.
 */
export var emg_cutoff: boolean = false;

/**
 * @deprecated Only called by system function when {@link emg_cutoff} is true.
 */
export function msgCutoff() {vsc.window.showErrorMessage("Action disabled due to emergancy cutoff.\nTry fixing the issue and reload extension.")}

/**
 * Processes local exception.
 * 
 * @param exception {@link LocalException} object.
 * @throws exception: {@link LocalException}
 */
export function throwLocalException(exception: LocalException) {
    vsc.window.showErrorMessage(`Local Runtime exception raised by dectox${exception.code ? `(code: ${exception.code})` : ''}: \n${exception.msg}`);
    if (exception.cutoff) emg_cutoff = true;
    throw exception;
}

/**
 * Sleep function to make async coroutine hold for a bit.
 * 
 * @param ms Delay in milliseconds.
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Global vscode extension context.
 */
export var context: vsc.ExtensionContext;

/**
 * @deprecated only called in `activate` function of extension to push global extension context in {@link context}.
 */
export function setContext(ctx: vsc.ExtensionContext) {
    context = ctx;
}

/**
 * Technically a macros. Returns path to extension's global storage
 * 
 * @returns path to the directory {@link vsc.Uri}
 */
export function getExtLocalStorageUri(): vsc.Uri | undefined {
    return context.globalStorageUri;
}

/**
 * Obtains extension configs.
 * 
 * @returns configs. {@link vsc.WorkspaceConfiguration} if everything exists and {@link emg_cutoff} was not engaged. Otherwise returns `null`.
 */
export function configs(): vsc.WorkspaceConfiguration | null {
    if (emg_cutoff) return null;
    const val = vsc.workspace.getConfiguration("dectox");
    if (!val) {
        throwLocalException({msg: "For some reason configs for dectox are not present", cutoff: true});
    }
    return val;
}

/**
 * Macros for Debug variable.
 * 
 * @returns isDebugModeEnabled if everything is fine. Otherwise returns `null`.
 */
export function isDebug(): boolean | null {
    if (emg_cutoff) return null;
    const val = configs()?.get<boolean>("Debug");
    if (!val) {
        throwLocalException({msg: "Debug value are not present in config", cutoff: true});
        return null;
    }
    return val;
}

/**
 * Macros for normal debug message handling.
 * 
 * @param msg Message to be printed in notifications.
 */
export function debugMessage(msg: string) {vsc.window.showInformationMessage(msg);}