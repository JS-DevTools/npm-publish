Node.js TypeScript Template
===========================
This is a **template repo** for Node.js projects written in TypeScript. This template works for libraries and/or CLIs.



Step 1: Copy this repo
---------------------------------------------
Create a new git repo and copy the contents of this repo into it.



Step 2: Delete unneeded files
---------------------------------------------
If you **don't** need a CLI, then:
  - Delete the following files and directories:
    - `bin`
    - `src/cli`
    - `test/specs/cli.spec.js`
    - `test/utils/project-cli-name.js`
  - Delete the following fields in `package.json`:
    - `bin`
    - `files.bin`
    - `devDependencies.chai-exec`
    - `devDependencies.@types/command-line-args`
    - `dependencies.command-line-args`
  - Delete the `Run CLI` config from `.vscode/launch.json`



Step 3: Replace placeholders
---------------------------------------------
Replace all occurrences of the following placeholders in all files:

|Placeholder                        |Description
|:----------------------------------|:------------------------------------------------------------
|`project-package-name`             |This is the name of the NPM package. It should also match the GitHub repo name. It should be kebab-cased.
|`project-cli-name`                 |The name of the CLI program for this project, if any.
|`projectExportName`                |The name of the library's default export, if any.  This should be a valid JavaScript identifier name.
|`Friendly Project Name`            |This is the human friendly name of the project that is used in the ReadMe, descriptions, and docs pages
|`This is the project description`  |A short, human friendly description of the project that is used in the ReadMe and package.json



Step 4: TODOs
---------------------------------------------
Find all "TODO" notes in the code and follow their instructions.



Step 5: ReadMe
---------------------------------------------
Delete this file and replace it with `README_md`.
