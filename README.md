# Syntax Highlighting and BNF Extensions

Creating syntax highlighting for a language can be a tedious process, especially when you have to create an entire extension and learn how to use TextMate from scratch. BNF Extensions aims to make this process as simple as possible by providing a much more intuitive interface for creating syntax highlighting and removing the necessity of knowing how to use TextMate and apply regular expressions to scopes. This [VSCode extension](https://marketplace.visualstudio.com/items?itemName=alexvallone.bnf-extensions) provides a project-based interface for creating syntax highlighting through TextMate grammars. While this extension is built around creating syntax highlighting for languages defined through BNF grammars, it is more than capable of creating syntax highlighting for any language. So far, the capabilities of this extension are limited in pattern matching flexibility, but it serves as a good starting point for creating syntax highlighting for any language.



## Quick Start

1. Open up the context menu by right clicking the folder which you want to create a project in.
2. Click on `BNF Extensions: Create Config File in Current Directory`. 

![createConfigFile](https://github.com/amv146/BNFC-Extensions/assets/39172404/7c6caa38-096a-4ca0-9df4-85fbdd34486f)

4. Fill in the prompts with the appropriate information. It will first ask you to select a BNF grammar file, if you choose to select one, it will be used to create default grammar in the config file based on the parsed grammar file. If none are found, you can pick none. It will then ask you for the name of the project and the main file extension of the language. This file extension should be in the form of `.ext` and not `ext`. The extension will be used to determine which files to apply the syntax highlighting to.
![createConfigFilePrompts](https://user-images.githubusercontent.com/39172404/208337104-e6edfb2b-a1b1-4f5b-bf76-881f3ea99e3c.gif)

4. After completing the prompts, a new `config.bnf.json` file will be created in the root of the project where the context menu was opened. This file contains the base information that was provided in the prompts.
![Screenshot 2022-12-18 at 6 40 28 PM](https://user-images.githubusercontent.com/39172404/208337175-00538073-1e54-4da0-aa75-3067112d22c3.png)

5. Inside the config file, update the grammar to create syntax highlighting for the language it defines.
![Screenshot 2022-12-18 at 6 41 42 PM](https://user-images.githubusercontent.com/39172404/208337311-6cbf378b-fe1a-42e0-bc08-fc7c062cba6f.png)

6. After updating the grammar in the config file and saving it, **restart VSCode**. You can do this easily by opening up the command palette (Cmd + Shift + P) and selecting `Developer: Reload Window` If when you restart, an error pops up in the bottom right saying that "Extensions have been modified on disk", and prompts you to reload - click reload window.

## Config File

The config file is a JSON file that contains the base information for the project. It contains the
following information:

- `mainGrammarPath`: The path to the main BNF grammar file used for this project.
- `languageName`: The name of the language that is being defined.
- `fileExtensions`: The file extensions that this project will apply syntax highlighting to.
- `grammar`: The grammar information for the project. This will be used to generate the TextMate grammar file and the syntax highlighting.
- `options`: These are additional options that can be used to customize the syntax highlighting. These options are not required and will be ignored if they are not provided.
  - `createLanguageConfigurationFile`: A boolean value that determines whether or not a language configuration file should be created. Defaults to `false`.
  - `highlightNumbers`: A boolean value that determines whether or not numbers should be highlighted. Defaults to `false`.

## Grammar

The grammar is the most important part of the config file. It contains the information that will be used to generate the TextMate grammar file and the syntax highlighting. It is a list of objects that contain the following information:

- `type`: The type of the grammar. This can be one of the following:
  - `blockComment`: A block (or multiline) comment in the language. Rather than having a `values` property, this type has a `begin` and `end` property. The `begin` property is the text that starts the block comment and the `end` property is the text that ends the block comment.
  - `character`: A character in the language. This is typically used to define a value and is applied at the beginning and end of the value. The most common example of this is single quotes.
  - `comment`: A single line comment in the language.
  - `constant`: A constant in the language. Examples include `true`, `false`, `null`, etc.
  - `function`: A built-in function in the language. Examples include `print`, `println`, etc.
  - `keyword`: A keyword in the language. Examples include `if`, `else`, `while`, etc.
  - `operator`: An operator in the language. Examples include `+`, `-`, `*`, etc.
  - `punctuation`: Any punctuation in the language. Examples include `(`, `)`, `{`, `}`, etc.
  - `separator`: A separator in the language, used to separate multiple values but is not applied at the end of the last one. The most common example of this is a comma.
  - `string`: A string in the language. This is typically used to define a value and is applied at the beginning and end of the value. The most common example of this is double quotes.
  - `type`: A type in the language. Examples include `int`, `float`, `string`, etc.
  - `terminator`: A terminator in the language. This is typically used to terminate a statement and is applied at the end of every statement. The most common example of this is a semicolon.
- `values`: A list of strings that represent the text that will be highlighted according to the type.
- `begin`: Only used for block comments. The string that begins a block comment.
- `end`: Only used for block comments. The string that ends a block comment.

## Default Grammar Syntax Highlighting
Using a BNFC grammar file, the extension will automatically create a default grammar from the grammar file chosen when creating the config file. This default grammar is created through pre-defined rules that are based on the type of rule in the grammar file. The extension tries to match different patterns for rule inside the file, and infers grammar types based on the name of the values and the type of rule. There are currently four types of rules that are supported:

1. `Declarations`: These are statements used to define the types of values that can be used in the language. They are defined as follows:
    ```
    Identifier "." Identifier "::=" (Identifier | String)* ";"
    ```
    Currently, `Identifiers` are parsed but not used (although serve as the basis of how semantic highlighting might be implemented in the future). `Strings` are used to define the values that will be highlighted. They are constant throughout the language, and a predefined mapping is currently used to map them to the appropriate grammar type. The list of predefined mappings can be found [here](docs/predefinedTypes.md).
2. `Comments`: Rules that define comments in the language. They are defined as follows:
    ```c
    // For single line comments
    comment String ;

    // For block comments
    comment String String ;
    ```
    In a single line comment, `String` is the text that starts the comment. In a block comment, the first `String` is the text that starts the comment and the second `String` is the text that ends the comment.
3. `Terminators`: Rules that define terminators in the language. They are defined as follows:
    ```
    terminator Identifier String ;
    ```
    `String` is the text that will be highlighted as a terminator.
4. `Separators`: Rules that define separators in the language. They are defined as follows:
    ```
    separator Identifier String ;
    ```
    `String` is the text that will be highlighted as a separator.

## Language Configuration File
The extension can optionally create a [language configuration file](https://code.visualstudio.com/api/language-extensions/language-configuration-guide) for the language being defined. This file can be used to configure things like auto-closing brackets, auto-indentation, etc. The file is not created by default, but can be created by setting the `createLanguageConfigurationFile` option to `true` in the config file. Currently, the extension auto-infers all of the language configuration options based on the config file. For example, if the config file defines both `{` and `}` under the `punctuation` type, then the extension will automatically include the curly braces in the `autoClosingPairs` option and `brackets` option in the language configuration file. It additionally automatically adds defined comments to the `comments` option in the language configuration file.

## Testing
The extension has been tested numerous times by comparing syntax highlighting I made for BNF languages to ones generated by the extension. This includes both the default syntax highlighting and syntax highlighting generated directly from the config file. 

## Known Issues
1. Two languages being created with the same name will cause unexpected behavior when trying to select the language to use for a file extension.
2. There is not full support for moving config files from place to place. Moving a config file may or may not preserve the project.
3. It is necessary to restart VSCode after updating the config file for the changes to take effect. There is currently no foreseeable way to get around this.

## Future Work
1. Support for more grammar types. Additionally add support for higher type specificity (such as differentiating between types of keywords). This is as simple as adding more types to the `TokenType` enum and mapping them to the appropriate TextMate scopes.
2. Support for choosing colors for grammar types. This may or may not be possible, but there may be a way to do it through VSCode's `settings.json` file.
3. More advanced default grammar creation from grammar files. This can possibly be used to infer grammar types from more than just the name of the values and type of rule.
4. Continue working on language configuration file creation from the config file. This helps to make coding easier with things like auto closing pairs, bracket specification, and indenting after pressing enter. For the most part, this works well, but other options such as `surroundingPairs` need to be implemented. Additionally, the indentation rules will need to be modified to better account for the types of brackets supported by the language.
5. Semantic highlighting for highlighting things like variables, functions, etc. This may or may not be possible and is a stretch goal.
6. Extend for more BNFC specific tasks - i.e. building grammar, testing the languages

For the most part, most of what I aimed to accomplish with this extension has been done. The extension is currently in a usable state, but there are still some things that can be done to improve it. It is more than capable of creating syntax highlighting for simple languages and the default grammar creation works well for most languages. The extension is also very easy to use and can be used to create syntax highlighting for a language in a matter of minutes.
