<img src="./icon.png" alt="logo" width="120" align="right" />

# Toggle Quotes VSCode Extension

`cmd '` (`ctrl '` on win/linux) will cycle the first quote pair found (from the start/end of the section) through the following sequence: 

- Typescript, JavaScript, Markdown, Go, Svelte: `"` to `'` to ` 
- Any other files: `"` to `'`
- Also available different start and end of wrap characters: `<`/`>`, `[`/`]`, `«`/`»` etc. (thanks to [@dirondin](https://github.com/dirondin) )
- Customizable, see below.

**IMPORTANT**: By design, what is selected will be ignored by the toggle logic, and the quote match will be from the start and end of the selection. This allows dead-simple code and maximum user flexibility to select what needs to be excluded. So the `toggle` will start to find the matching from the start and end of the selection.

For example, assuming `[` is start of selection and `]` end of selection.

```
example "with s[ome other] text" and more
            <--           -->
```

The quote match will happen from start selection going left and end selection going right. Toggle Quotes support multiple selections applying the same rule for each.

### Features

- Typescript, JavaScript, Markdown, JSX (since 0.3.2, thanks to @evaera) toggles: `"` to `'` to ` 
- Any other file type toggles: `"` to `'`
- Works with multi-select.
- Text in selection will be ignored.
- Per languageId Customization (_new in 0.2.0_)
```json
"configurationDefaults": {          
  "[csharp]": {
    "togglequotes.chars": ["\"","'","`"]
  },
  "[freemarker]": {
    "togglequotes.chars": [["<",">"],["[","]"]]
  }
}
```
- [Ignore escaped quotes](https://github.com/BriteSnow/vscode-toggle-quotes/issues/4) (_new in 0.3.0_)


### Upcoming

- [Add a command "Toggle Quotes: Within", allow to change default (#22)](https://github.com/BriteSnow/vscode-toggle-quotes/issues/22)
- [Multiline support (#5)](https://github.com/BriteSnow/vscode-toggle-quotes/issues/5)
- Not sure if suitable: [Escape apostrophes if present (#3)](https://github.com/BriteSnow/vscode-toggle-quotes/issues/3)

### Credits

- [@Kerigard](https://github.com/Kerigard) - backtick in vue.js
- [@bmalehorn](https://github.com/bmalehorn) - remote dev support
- [@awmottaz](https://github.com/awmottaz) - improving settings interface (and package.json cleanup)
- [@dirondin](https://github.com/dirondin) - for the start and end wrap characters support
- [@will-stone](https://github.com/will-stone) - for the cool icon.
- [@jameygleason](https://github.com/jameygleason) - for Go and Svelte backtick support
- [@bmalehorn](https://github.com/bmalehorn) - for Run automatically in remote dev

### Self-centered promotion

- https://www.youtube.com/jeremychone - **Rust Development YouTube channel** (RustLang Tutorials & Courses, Fun Coding Sessions, Game Dev Fun, Prod Cloud Apps dev)

