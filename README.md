`cmd '` (`ctrl '` on win/linux) will cycle the first quote pair found (from the start/end of the section) through the following sequence: 

- Typescript, JavaScript, Markdown: `"` to `'` to ` 
- Any other files: `"` to `'`

Customizable, see below.

#### Features

- Typescript, JavaScript, Markdown, JSX (since 0.3.2, thanks to @evaera) toggles: `"` to `'` to ` 
- Any other file type toggles: `"` to `'`
- Works with multi-select.
- Text in selection will be ignored.
- Per languageId Customization (_new in 0.2.0_)
```json
"configurationDefaults": {          
  "[csharp]": {
    "togglequotes.chars": ["\"","'","`"]
  }
}
```
- [Ignore escaped quotes](https://github.com/BriteSnow/vscode-toggle-quotes/issues/4) (_new in 0.3.0_)


#### Upcoming

- [Multiline support (#5)](https://github.com/BriteSnow/vscode-toggle-quotes/issues/5)
- Not sure if suitable: [Escape apostrophes if present (#3)](https://github.com/BriteSnow/vscode-toggle-quotes/issues/3)
