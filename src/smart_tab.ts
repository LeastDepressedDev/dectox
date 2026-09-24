import * as vsc from 'vscode';

/**
 * Handler for smart tab command.
 */
export async function commandHandler() {
    const editor = vsc.window.activeTextEditor;
    if (!editor || !editor.selection) return;
    const current_l: number = editor.selection.active.line;
    if (current_l == 0) return;
    const prev_ln: vsc.TextLine = editor.document.lineAt(current_l-1);
    let i = editor.selection.active.character;
    let flag0 = prev_ln.text[i]!=' ' ? false : true;
    for (i; i < prev_ln.text.length; i++) {
        if (prev_ln.text[i] == ' ') flag0 = true;
        if (flag0 && prev_ln.text[i] != ' ') break;
    }
    const dif = i-editor.selection.active.character;
    
    editor.edit((qui) => {
        qui.insert(editor.selection.active, " ".repeat(dif));
    });
}