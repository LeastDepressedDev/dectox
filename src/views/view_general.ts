import * as vsc from 'vscode';

import * as gbs from '../globals';

export class GeneralNode extends vsc.TreeItem {
    public constructor() {
        super("[WIP] Incomplete", vsc.TreeItemCollapsibleState.None);
    }
}

export class GeneralTreeProvider implements vsc.TreeDataProvider<GeneralNode> {

    onDidChangeTreeData?: vsc.Event<void | GeneralNode | GeneralNode[] | null | undefined> | undefined;

    getTreeItem(element: GeneralNode): vsc.TreeItem | Thenable<vsc.TreeItem> {
        return element;
    }

    getChildren(element?: GeneralNode | undefined): vsc.ProviderResult<GeneralNode[]> {
        if (!element) {
            const button = new GeneralNode();
            button.contextValue = "button";
            return [
                button
            ]
        } else {
            return null;
        }
    }
}

