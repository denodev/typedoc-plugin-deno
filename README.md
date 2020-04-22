# typedoc-plugin-deno

[![Build Status](https://github.com/denodev/typedoc-plugin-deno/workflows/ci/badge.svg?branch=master)](https://github.com/denodev/typedoc-plugin-deno/actions)
[![license](https://img.shields.io/github/license/denodev/typedoc-plugin-deno)](https://github.com/denodev/typedoc-plugin-deno/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/typedoc-plugin-deno.svg)](https://www.npmjs.com/package/typedoc-plugin-deno)

This plugin is used by [Deno Api Simplified Chinese Site](https://github.com/denodev/typedoc).

This plugin allows specific typedoc `@*_i18n` to be processed as multi-language.

Example:

```ts
/** This comment _supports_ [Markdown](https://marked.js.org/).
 *
 * @i18n 这是一个中文注释，_支持_ [Markdown](https://marked.js.org/)。
 *
 * @param text  Comment for parameter ´text´.
 * @param_i18n text  参数 ´text´ 的中文注释。
 */
function doSomething(target: any, text: string): number;
```

By default, this plugin processes the following tags:

- [x] `@i18n`
- [x] `@param_i18n`
- [x] `@typeParam_i18n`
- [x] `@returns_i18n`
- [ ] `@event_i18n` need help

### Installing

Typedoc has the ability to discover and auto-load typedoc plugins found in node_modules.

```bash
npm install --save typedoc-plugin-deno
```

### License

typedoc-plugin-deno is released under the MIT License. See the bundled [LICENSE](./LICENSE) file for details.
