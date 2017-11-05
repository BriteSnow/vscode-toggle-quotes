`cmd '` will cycle the first quote pair found (from the start/end of the section) through the following sequence: 

- Typescript, JavaScript, Markdown: `"` to `'` to ` 
- Any other files: `"` to `'`

Customizable, see below.

#### Features

- Works with multi-select.
- Can make a selection to ignore the text selected (this feature can be used to exclude escaped quotes).
- Per languageId Customization (_new in 0.2.0_)

```json
"configurationDefaults": {          
  "[csharp]": {
    "togglequotes.chars": ["\"","'","`"]
  }
}
```

#### Upcoming

- Ignore escaped quotes (e.g., `\"`)
