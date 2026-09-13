import * as vsc from 'vscode';
import * as gb from '../globals';

export class OptionsProvider implements vsc.WebviewViewProvider {

    public readonly htmlPath: vsc.Uri;
    private html?: string;

    public constructor(context: vsc.ExtensionContext) {
        this.htmlPath = vsc.Uri.joinPath(context.extensionUri, "build/assets/OptionsProvider.html");
    }

    async resetHtml() {
        const content = await vsc.workspace.fs.readFile(this.htmlPath);
        this.html = new TextDecoder("utf-8").decode(content);
    }

    resolveWebviewView(webviewView: vsc.WebviewView, context: vsc.WebviewViewResolveContext, token: vsc.CancellationToken): Thenable<void> | void {
        if (!this.html) throw "Html was not defined";
        webviewView.webview.html = this.html;
        webviewView.webview.onDidReceiveMessage((msg) => {
            if (gb.isDebug()) {
                console.log("Got message from OptionsProvider webivew:");
                console.log(msg);
            }
        })
    }
}

export async function registerOptionsProvider(context: vsc.ExtensionContext){
    const base = new OptionsProvider(context);
    await base.resetHtml();
    vsc.window.registerWebviewViewProvider("dectoxOptions", base);
}