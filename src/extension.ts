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
		let [charsInfo, status] = getQuoteTypes(editor);
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
		const [startPos, startDelim] = getStartQuote(ast, sel);
		const [endPos, endDelim] = getEndQuote(ast, sel, numLines);
		
		if (startDelim === 'EOF' || endDelim === 'EOF') return;
		if (startPos.column ===	endPos.column && startPos.line ===	endPos.line) return;

		const charInfo = findChar(chars, startDelim, endDelim);

		if (charInfo) {
			const foundCharIdx = chars.indexOf(charInfo);
			const nextChar = chars[(foundCharIdx + 1) % chars.length];
			// console.log(`begin: Found ${startDelim} at line ${startPos.line} column ${startPos.column}\nend: Found ${endDelim} at line ${endPos.line} column ${endPos.column}\nwill change to :\n${JSON.stringify(nextChar, null, 2)}`);

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



function getQuoteTypes(editor: TextEditor): [Quotes[], string] {
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
function findChar(chars: Quotes[], startDelim: string, endDelim: string): Quotes {
	let foundQuotes: Quotes = null;
	foundQuotes = chars.find((quotes) => quotes.begin === startDelim);
	foundQuotes = chars.find((quotes) => quotes.end === endDelim);
	return foundQuotes;
}



function buildAST(text) {
	const ast = {};
	const lines = text.split(/\r?\n/g);

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


interface Pos {
	line: number,
	column: number,
}

type QuoteDataReturn = [Pos, string]

function getStartQuote(ast, sel): QuoteDataReturn {
	const pos: Pos = {
		line: sel.start.line,
		column: sel.start.character - 1,
	};

	if (pos.column <= 0) {
		pos.line -= 1;
		if (pos.line < 0) {
			return [
				{
					line: -1,
					column: -1,
				},
				'EOF'
			];
		}
		pos.column = ast[pos.line].length;
	}

	let delimiter;

	for (let i = pos.column; i >= 0; i--) {
		if (pos.line < 0 && pos.column < 0) {
			return [
				{
					line: -1,
					column: -1,
				},
				'EOF'
			];
		}

		const char = ast[pos.line].line[pos.column];
		let nextChar = ""
		if (pos.line >= 0 && pos.column - 1 >= 0) {
			nextChar = ast[pos.line].line[pos.column - 1]
		}
		
		// Eat escaped quote
		if (nextChar === '\\') {
			pos.column -= 1;
			continue;
		}

		switch (char) {
			case "'":
				// Eat apostrophes
				if (nextChar && !nextChar.match(/\w/)) {
					delimiter = char;
				}
				break;
			case '"':
				delimiter = char;
				break;
			case '`':
				delimiter = char;
				break;
		}

		if (delimiter) break;

		pos.column -= 1;

		if (pos.column < 0) {
			pos.line -= 1;
			if (pos.line < 0) {
				return [
					{
						line: -1,
						column: -1,
					},
					'EOF'
				];
			}
			pos.column = ast[pos.line].length;
			i = pos.column;
		}
	}
	return [pos, delimiter];
}



function getEndQuote(ast, sel, numLines): QuoteDataReturn {
	const pos: Pos = {
		line: sel.start.line,
		column: sel.start.character,
	};

	if (pos.column >= ast[pos.line].length) {
		pos.line += 1;
		pos.column = 0;
		if (pos.line >= numLines) {
			return [
				{
					line: -1,
					column: -1,
				},
				'EOF'
			];
		}
	}

	let delimiter;

	for (let i = pos.column, j = 0; i >= 0; i++, j++) {
		if (pos.line > numLines && pos.column > ast[pos.line].length) {
			return [
				{
					line: -1,
					column: -1,
				},
				'EOF'
			];
		}

		const char = ast[pos.line].line[pos.column];
		const prevChar = ast[pos.line].line[pos.column - 1];
		const nextChar = ast[pos.line].line[pos.column + 1];
		
		if (prevChar === '\\') {
			pos.column += 1;
			continue;
		}

		switch (char) {
			case '\\':
				// Eat escaped quote
				pos.column += 1;
				break;
				case "'":
					// Eat apostrophes
					if (nextChar && !nextChar.match(/\w/)) {
					delimiter = char;
				}
				break;
			case '"':
				delimiter = char;
				break;
			case '`':
				delimiter = char;
				break;
		}

		if (delimiter) break;

		pos.column += 1;

		if (pos.column > ast[pos.line].length) {
			pos.line += 1;
			pos.column = 0;
			i = pos.column;
			if (pos.line > numLines) {
				return [
					{
						line: -1,
						column: -1,
					},
					'EOF'
				];
			}
		}
	}
	return [pos, delimiter];
}
