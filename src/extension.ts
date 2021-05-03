'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, workspace, WorkspaceConfiguration, TextLine, Position, Selection, commands, ExtensionContext, TextEditor } from 'vscode';

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
	let chars: Quotes[] = [];

	try {
		// File extension specific delimiters (package.json contributes.configurationDefaults)
		let [charsInfo, status] = getChars(editor);
		// Early return for unsupported file types
		if (status === 'UNSUPPORTED_FILE_TYPE') return;
		chars = charsInfo;
	} catch (e) {
		window.showErrorMessage(e.message);
		return;
	}

	const changes: { char: string, selection: Selection }[] = [];

	for (const sel of editor.selections) {
		const text = editor.document.getText();
		const [ast, numLines] = buildAST(text);
		const [startPos, startDelimiter] = getStartQuote(ast, sel);
		const [endPos, endDelimiter] = getEndQuote(ast, sel, numLines);

		if (startPos === 'EOF' || endPos === 'EOF') return;

		const charInfo = findChar(chars, startDelimiter, endDelimiter);

		if (charInfo) {
			const foundCharIdx = chars.indexOf(charInfo);
			const nextChar = chars[(foundCharIdx + 1) % chars.length];
			// console.log(`begin: Found ${startDelimiter} at line ${startPos.line} column ${startPos.column}\nend: Found ${endDelimiter} at line ${endPos.line} column ${endPos.column}\nwill change to :\n${JSON.stringify(nextChar, null, 2)}`);

			const first = new Position(startPos.line, startPos.column);
			const firstSelection = new Selection(first, new Position(first.line, first.character + 1));
			changes.push({ char: nextChar.begin, selection: firstSelection });

			const second = new Position(endPos.line, endPos.column);
			const secondSelection = new Selection(second, new Position(second.line, second.character + 1));
			changes.push({ char: nextChar.end, selection: secondSelection });
		}
	}

	editor.edit((edit) => {
		for (const change of changes) {
			edit.replace(change.selection, change.char);
		}
	});
}



function getChars(editor: TextEditor): [Quotes[], string] {
	const doc = editor.document;
	const langId = doc.languageId;

	let langProps = workspace.getConfiguration().get(`[${langId}]`);
	if (!!langProps === false) {
		return [[], 'UNSUPPORTED_FILE_TYPE'];
	}

	let chars = null;

	if (langProps) {
		chars = langProps['togglequotes.chars'];
	}

	chars = chars || workspace.getConfiguration('togglequotes').get('chars') || [];

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

	return [chars, ''];
}



/** Find the .start and .end of a char (from the chars list) or null if any side is not found */
function findChar(chars: Quotes[], startDelimiter: string, endDelimiter: string): Quotes {
	let foundQuotes: Quotes = null;

	foundQuotes = chars.find((quotes) => quotes.begin === startDelimiter);
	foundQuotes = chars.find((quotes) => quotes.end === endDelimiter);

	return foundQuotes;
}



function buildAST(text) {
	const ast = {};
	const lines = text.split(/(?<=\r?\n)/g);

	let numLines = 0;

	lines.forEach((l, i) => {
		ast[i] = {
			line: l,
			length: l.length,
		};
		numLines = i;
	});
	return [ast, numLines];
}



function getStartQuote(ast, sel) {
	const initial = {
		line: sel.start.line,
		column: sel.start.character,
	};
	const pos = { ...initial };
	let delimiter;
	let skipDlCheck = false;

	for (let i = initial.column, j = 0; i >= 0; i--, j++) {
		if (pos.line <= 0 && pos.column <= 0) {
			return 'EOF';
		}

		const char = ast[pos.line].line[pos.column];

		// Eat escaped quote
		if (ast[pos.line].line[pos.column - 1] === '\\') {
			pos.column -= 1;
			skipDlCheck = true;
		}

		if (!skipDlCheck) {
			if (char === "'" || char === '"' || char === '`') {
					delimiter = char;
					break;
			}
		}
		skipDlCheck = false;

		pos.column -= 1;

		if (pos.column < 0) {
			pos.line -= 1;
			pos.column = ast[pos.line].length;
			i = pos.column + 1;
			if (pos.line < 0) {
				return ['EOF', ''];
			}
		}
	}
	return [pos, delimiter];
}



function getEndQuote(ast, sel, numLines) {
	const initial = {
		line: sel.start.line,
		column: sel.start.character,
	};
	const pos = { ...initial };
	let delimiter;
	let skipDlCheck = false;

	for (let i = initial.column, j = 0; i >= 0; i++, j++) {
		const char = ast[pos.line].line[pos.column];

		// Eat escaped quote
		if (char === '\\') {
			pos.column += 1;
			skipDlCheck = true;
		}

		if (!skipDlCheck) {
			if (char === "'" || char === '"' || char === '`') {
				delimiter = char;
				break;
			}
		}
		skipDlCheck = false;

		pos.column += 1;

		if (pos.column > ast[pos.line].length) {
			pos.line += 1;
			pos.column = 0;
			i = pos.column;
			if (pos.line > numLines) {
				return ['EOF', ''];
			}
		}
	}
	return [pos, delimiter];
}
