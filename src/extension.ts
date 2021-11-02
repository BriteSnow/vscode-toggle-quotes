'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, workspace, Position, Selection, commands, ExtensionContext, TextEditor } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let togglequotesCommand = commands.registerCommand('editor.togglequotes', () => {
		// The code you place here will be executed every time your command is executed
		toggle();
		// Display a message box to the user
		// window.showInformationMessage('toggle ran');
	});

	context.subscriptions.push(togglequotesCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

type Quotes = { begin: string, end: string };

// look at: https://github.com/dbankier/vscode-quick-select/blob/master/src/extension.ts
function toggle() {

	let editor = window.activeTextEditor;
	let doc = editor.document;

	let chars = [];

	try {
		chars = getChars(editor);
	} catch (e) {
		window.showErrorMessage(e.message);
		return;
	}

	const changes: { char: string, selection: Selection }[] = [];


	for (const sel of editor.selections) {
		const content = doc.lineAt(sel.start.line);
		const charInfo = findChar(chars, content.text, sel);

		if (charInfo) {
			const foundCharIdx = chars.indexOf(charInfo.foundQuotes);
			const nextChar = chars[(foundCharIdx + 1) % chars.length];
			// console.log(`found ${charInfo.start} - ${charInfo.end} will change to : ${nextChar}`);

			const first = new Position(sel.start.line, charInfo.start);
			const firstSelection = new Selection(first, new Position(first.line, first.character + 1));
			changes.push({ char: nextChar.begin, selection: firstSelection });

			const second = new Position(sel.start.line, charInfo.end);
			const secondSelection = new Selection(second, new Position(second.line, second.character + 1));
			changes.push({ char: nextChar.end, selection: secondSelection });
		}

		// for (const sel of newSelections){
		// 	editor
		// }
	}

	editor.edit((edit) => {
		for (const change of changes) {
			edit.replace(change.selection, change.char);
		}
	})
}




/** Find the .start and .end of a char (from the chars list) or null if any side is not found */
function findChar(chars: Quotes[], txt: string, sel: Selection): { start: number, end: number, foundQuotes: Quotes } | null {
	let start: number = -1;
	let end: number = -1;

	let foundQuotes: Quotes = null;

	// find the index of next char from end selection
	for (let i = sel.end.character; i < txt.length; i++) {
		const c = txt[i];
		const beforeC = (i > 0) ? txt[i - 1] : null; // the previous character (to see if it is '\')
		if (beforeC !== '\\') {
			foundQuotes = chars.find((quotes) => quotes.end === c);
			if (foundQuotes) {
				end = i;
				break;
			}
		}
	}

	// find the index of previous char (note at this point we should have the found char)
	for (let i = sel.start.character - 1; i > -1; i--) {
		const c = txt[i];
		const beforeC = (i > 0) ? txt[i - 1] : null; // the previous character (to see if it is '\')
		if (beforeC !== '\\') {
			if (foundQuotes.begin === c) {
				start = i;
				break;
			}
		}
	}

	if (start > -1 && end > -1) {
		return { start, end, foundQuotes };
	} else {
		return null;
	}


}


function getChars(editor: TextEditor): Quotes[] {
	const maybeChars = workspace.getConfiguration('togglequotes', editor.document).get('chars');
	const chars = Array.isArray(maybeChars) ? maybeChars : [];

	// Transform properties to begin/end pair
	chars.forEach((char: any, i: number, chars: any[]) => {
		if (typeof char === 'string') {
			chars[i] = { begin: char, end: char };
		} else if (typeof char === 'object') {
			if (Array.isArray(char)) {
				if (char.length !== 2 || !char.every(c => typeof c === 'string')) {
					throw Error('Wrong togglequotes.chars array quotes pair format. Use ["<", ">"]');
				}
				chars[i] = { begin: char[0], end: char[1] };
			} else if (!char.begin || !char.end) {
				throw Error('Wrong togglequotes.chars object quotes pair format. Use { "begin": "<", "end": ">" } ');
			}
		} else {
			throw Error('Wrong togglequotes.chars value type. Use string or [string, string] or { "begin": string, "end": string }');
		}
	});

	return chars;

}