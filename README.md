# md-compose

[![npm version](https://img.shields.io/npm/v/md-compose.svg)](https://www.npmjs.com/package/md-compose)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/fxxr/md-compose.svg?style=social)](https://github.com/fxxr/md-compose)

**md-compose** is a lightweight Node.js utility to include Markdown files 
inside other Markdown files using a simple `[[[path/to/file.md]]]` syntax.  
Perfect for building modular documentation, reusable templates, and large Markdown projects.

## 🚀 Features

- 🧩 Include one Markdown file into another
- ⚡ Works recursively — assemble complex documents easily
- 🧱 Keeps your docs modular and maintainable
- 🪶 Simple, dependency-free, and lightweight

## Installation

```bash
npm install md-compose
```

## Usage

Use the special `[[[ path/to/file.md ]]]` syntax inside a Markdown document to include another Markdown file.

#### header.md

```markdown
# Common Header for All Pages
```

#### footer.md

... and the second one in `footer.md`.

```markdown
Follow me on [Github](https://github.com/fxxr)
```

#### page.md

```markdown
[[[ header.md ]]]

...Page content...

[[[ footer.md ]]]
```

#### Code example

```javascript
// Async version
import processIncludes from 'md-compose'
const result = await processIncludes('page.md')
console.log(result)

// Sync version
import {processIncludesSync} from 'md-compose'
const resultSync = await processIncludesSync('page.md')
console.log(resultSync)
```

Output:

```markdown
# Common Header for All Pages

...Page content...

Follow me on [Github](https://github.com/fxxr)
```

## Use cases

- Combine multiple Markdown files into a single document
- Reuse common sections like headers, footers, or legal disclaimers
- Simplify large documentation or static site projects
- Automate assembling Markdown files before publishing

## Limitations

- Only Markdown files with `.md` extension are supported
- Only local relative paths are allowed 
- Paths are resolved relative to the current Markdown file
- Parent directory references (`..`) are disallowed for safety

## Contributing
Contributions, issues, and feature requests are welcome!  
Open an [issue](https://github.com/fxxr/md-compose/issues) or 
submit a pull request.


## License

[MIT](LICENSE) © [Anatoly Nechaev](https://github.com/fxxr)