# Syntax Highlighting and BNFC Extensions

This extension provides a project-based interface for creating syntax highlighting through TextMate
grammars. While this extension is built around creating syntax highlighting for languages defined
through BNFC grammars, it is more than capable of creating syntax highlighting for any language.
So far, the capabilities of this extension are limited in pattern matching flexibility, but it serves
as a good starting point for creating syntax highlighting for any language.

## Quick Start

1. Open up the context menu by right clicking the folder which you want to create a Project in.
2. Click on `Create Config File`. 

![createConfigFile](https://user-images.githubusercontent.com/39172404/208337028-f2974af4-b7dc-429b-8d92-4c6f34edd525.gif)

3. Fill in the prompts with the appropriate information. It will first ask you to select a BNFC grammar file, if you choose to select one, it will be used to create default grammar in the config file based on the parsed grammar file. If none are found, you can pick none. It will then ask you for the name of the project and the main file extension of the language. This file extension should be in the form of `.ext` and not `ext`. The extension will be used to determine which files to apply the syntax highlighting to.
![createConfigFilePrompts](https://user-images.githubusercontent.com/39172404/208337104-e6edfb2b-a1b1-4f5b-bf76-881f3ea99e3c.gif)

4. After completing the prompts, a new `config.bnfc.json` file will be created in the root of the project where the context menu was opened. This file contains the base information that was provided in the prompts.
![Screenshot 2022-12-18 at 6 40 28 PM](https://user-images.githubusercontent.com/39172404/208337175-00538073-1e54-4da0-aa75-3067112d22c3.png)

5. Inside the config file, update the grammar to create syntax highlighting for the language it defines.
![Screenshot 2022-12-18 at 6 41 42 PM](https://user-images.githubusercontent.com/39172404/208337311-6cbf378b-fe1a-42e0-bc08-fc7c062cba6f.png)

6. After updating the grammar in the config file and saving it, restart VSCode. If when you restart, an error pops up in the bottom right saying that "Extensions have been modified on disk", and prompts you to reload - click reload window.

### Config File

The config file is a JSON file that contains the base information for the project. It contains the
following information:

- `mainGrammarPath`: The path to the main BNFC grammar file used for this project.
- `languageName`: The name of the language that is being defined.
- `fileExtensions`: The file extensions that this project will apply syntax highlighting to.
- `grammar`: The grammar information for the project. This will be used to generate the TextMate grammar file and the syntax highlighting.
- `options`: These are additional options that can be used to customize the syntax highlighting. These options are not required and will be ignored if they are not provided.
  - `highlightCharacters`: A boolean value that determines whether or not characters (within single quotes) should be highlighted. Defaults to `false`.
  - `highlightNumbers`: A boolean value that determines whether or not numbers should be highlighted. Defaults to `false`.
  - `highlightStrings`: A boolean value that determines whether or not strings (within double quotes) should be highlighted. Defaults to `false`.

### Grammar

The grammar is the most important part of the config file. It contains the information that will be
used to generate the TextMate grammar file and the syntax highlighting. It is a list of objects
that contain the following information:

- `type`: The type of the grammar. This can be one of the following:
  - `blockComment`: A block (or multiline) comment in the language. Rather than having a `values` property, this type has a `start` and `end` property. The `start` property is the text that starts the block comment and the `end` property is the text that ends the block comment.
  - `comment`: A single line comment in the language.
  - `constant`: A constant in the language. Examples include `true`, `false`, `null`, etc.
  - `function`: A built-in function in the language. Examples include `print`, `println`, etc.
  - `keyword`: A keyword in the language. Examples include `if`, `else`, `while`, etc.
  - `operator`: An operator in the language. Examples include `+`, `-`, `*`, etc.
  - `type`: A type in the language. Examples include `int`, `float`, `string`, etc.
  - `separator`: A separator in the language, used to separate multiple values but is not applied at the end of the last one. The most common example of this is a comma.
  - `terminator`: A terminator in the language. This is typically used to terminate a statement and is applied at the end of every statement. The most common example of this is a semicolon.
- `values`: A list of strings that represent the text that will be highlighted according to the type.

