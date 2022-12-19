# Snytax Highlighting and BNFC Extensions

This extension provides a project-based interface for creating syntax highlighting through TextMate
grammars. While this extension is built around creating syntax highlighting for languages defined
through BNFC grammars, it is more than capable of creating syntax highlighting for any language.
So far, the capabilities of this extension are limited in pattern matching flexibility, but it serves
as a good starting point for creating syntax highlighting for any language.

### Quick Start

1. Open up the context menu by right clicking the folder which you want to create a Project in.
2. Click on `Create Config File`.
3. Fill in the prompts with the appropriate information. It will first ask you to select a BNFC grammar file. If none are found, you can pick none. It will then ask you for the name of the project and the main file extension of the language. This file extension should be in the form of `.ext` and not `ext`. The extension will be used to determine which files to apply the syntax highlighting to.
4. After completing the prompts, a new `config.bnfc.json` file will be created in the root of the project where the context menu was opened. This file contains the base information that was provided in the prompts.

### Config File

The config file is a JSON file that contains the base information for the project. It contains the
following information:

- `mainGrammarPath`: The path to the main BNFC grammar file used for this project.
- `languageName`: The name of the language that is being defined.
- `fileExtensions`: The file extensions that this project will apply syntax highlighting to.
- `grammar`: The grammar information for the project. This will be used to generate the TextMate grammar file and the syntax highlighting.

### Grammar

The grammar is the most important part of the config file. It contains the information that will be
used to generate the TextMate grammar file and the syntax highlighting. It is a list of objects
that contain the following information:

- `type`: The type of the grammar. This can be one of the following:
  - `comment`: A single line comment in the language.
  - `constant`: A constant in the language. Examples include `true`, `false`, `null`, etc.
  - `function`: A built-in function in the language. Examples include `print`, `println`, etc.
  - `keyword`: A keyword in the language. Examples include `if`, `else`, `while`, etc.
  - `operator`: An operator in the language. Examples include `+`, `-`, `*`, etc.
- `values`: A list of strings that represent the text that will be highlighted according to the type.

