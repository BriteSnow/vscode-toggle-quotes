<img src="./icon.png" alt="logo" width="120" align="right" />

# Toggle Quotes VSCode Extension

`cmd '` (`ctrl '` on win/linux) will cycle the first quote pair found (from the start/end of the section) through the following sequence: 

- Typescript, JavaScript, Markdown: `"` to `'` to ` 
- Any other files: `"` to `'`
- Also available different start and end of wrap characters: `<`/`>`, `[`/`]`, `«`/`»` etc. (thanks to [@dirondin](https://github.com/dirondin) )

Customizable, see below.

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

- [@dirondin](https://github.com/dirondin) - for the start and end wrap characters support
- [@will-stone](https://github.com/will-stone) - for the icon

### Self-centered promotion

- [Big App, Small Team YouTube Channel](https://www.youtube.com/jeremychone). New dev channel about #**RuntimeFirst** code-design approaches (v.s., Framework centric approaches). Starting with some Native Web Components best practices (v.s., React, Angular), and will eventually cover full-stack development and DevOps with simple and scalable best practices for Node.js, docker, and Kubernetes. #SimpleScalesBetter (feedback welcome on YouTube videos or [Big App, Small Team, discord server](https://discord.com/channels/808391200309772339/808391200309772343))