import * as vsc from 'vscode';

import { bufpDir, getBufpPath } from '../catch_pin';

export class BufpNode extends vsc.TreeItem {
    public constructor(fileUri: vsc.Uri) {
        super(fileUri, vsc.TreeItemCollapsibleState.None);
    }
}

export class BufpTreeProvider implements vsc.TreeDataProvider<BufpNode> {

    private refreshEventEmitter = new vsc.EventEmitter<BufpNode | undefined | void>();
    onDidChangeTreeData = this.refreshEventEmitter.event;

    getTreeItem(element: BufpNode): vsc.TreeItem | Thenable<vsc.TreeItem> {
        return element;
    }

    refresh() {
        this.refreshEventEmitter.fire();
    }

    getChildren(element?: BufpNode | undefined): vsc.ProviderResult<BufpNode[]> {
        if (!element) {
            const rtrn: BufpNode[] = [];
            const bufpPth = getBufpPath();
            bufpDir.forEach((file) => {
                if (file[1] == vsc.FileType.File) {
                    const path = vsc.Uri.joinPath(bufpPth, file[0]);
                    const node = new BufpNode(path);
                    node.label = file[0].split(".")[0];
                    node.contextValue = "dectoxImgtp";
                    node.command = { command: 'vscode.open', title: 'Open', arguments: [path] };
                    rtrn.push(node)
                }
            });
            rtrn.sort((a, b) => {
                if (!a.label || !b.label) return 0;
                return Number.parseInt(a.label.toString())-Number.parseInt(b.label.toString());
            });
            return rtrn;
        } else {
            return null;
        }
    }
} 

export const INSTANCE = new BufpTreeProvider();