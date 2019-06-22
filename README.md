# kylecutler-com-static

[![Netlify Status](https://api.netlify.com/api/v1/badges/58f8b070-a1e5-4663-af0a-bf59f2aaef29/deploy-status)](https://app.netlify.com/sites/kc-static/deploys)

Static files for my personal website.

https://www.kylecutler.com/

## Get Started
To build the project, execute the following commands from the root project directory:

```
npm install
npm run build
```

This will trigger a production build of the contents in the `src/` directory, and output the resulting static files to the `public/` directory where they can be served with any static file server.

In addition, the following commands are also available:
* `npm run gulp` : Starts a development build, including watch tasks, linting, and `browser-sync` integration for live reloading of changes.
* `npm run lint` : Runs linting on all `.js` and `.ts` files within the `src/content` and `src/scripts` directories.
* `npm run typecheck` : Runs TypeScript type-checking on all `.ts` files within the `src/content` and `src/scripts` directories.
* `npm run verify` : Alias for `npm run typecheck && npm run lint`.

## Project Structure

This project uses the following libraries for source file compilation:

| Output Format | Tools Used |
|---------------|------------|
| HTML | [Pug](https://pugjs.org), [htmlmin](https://www.npmjs.com/package/htmlmin) |
| CSS | [Sass](https://sass-lang.com), [autoprefixer](https://www.npmjs.com/package/autoprefixer), [clean-css](https://github.com/jakubpawlowicz/clean-css) |
| JS | [Rollup](https://rollupjs.org), [TypeScript](http://typescriptlang.org) |

All source files reside within the `src/` directory, separated into the following directories:

### `assets/`:

Static content. All content within this directory is directly copied to the output folder with no processing.

### `content/`:

Contains Pug, Javascript / TypeScript, and SASS sources.

All Pug files are the entry points when compiling, and used to determine what scripts and stylesheets should be compiled. This works by first compiling the Pug into HTML and then scanning the HTML for script / stylesheet tags (resolved relative to the Pug source file, or to the `content/` root folder for absolute paths). The HTML is then output to the target directory.

Scripts are compiled using [Rollup](https://rollupjs.org), and support a combination of Javascript and TypeScript sources, as well as JSX / TSX compilation. In addition, the name `__DEBUG__` can be used to determine whether the code was compiled in a development or production environment. It can be used to allow conditional compilation of code, when used in the following way:

```javascript
if (__DEBUG__) {
  // print debug info, etc.
}
```

The `__DEBUG__` token will be replaced with `true` when running a development build, and `false` when running a production build. When processed with a minifier, the `if` statement will be optimized away, either leaving the code within or removing it entirely.

Styles are compiled using [Sass](https://sass-lang.com) and [autoprefixer](https://www.npmjs.com/package/autoprefixer).

### `templates/`:

Pug templates. These templates will not be compiled to the output. Instead, they are used for importing by the Pug templates within the `content/` directory.

### `utils/`:

Contains reusable scripts used throughout the site. This folder is installed as a package in the root package.json so that compiled scripts can simply import from `utils` without worrying about relative paths.

## Polyfills

The majority of polyfills are included via [polyfill.io](https://cdn.polyfill.io). This way, modern browsers need not load as many polyfills, and browsers can leverage caching to reduce overall load times across pages. There are a few ES6+ polyfills injected by the TypeScript compiler, and any additional polyfills needed can be included by requiring their NPM packages in the appropriate source file.

## Development vs. Production Builds

There are a couple of differences between the development and production builds, namely source maps and minification.

In development builds, Sass and JS / TS files will include sourcemaps to allow for easier debugging. They will also not undergo minification, mostly to reduce build time.

In production builds, HTML, CSS, and JS files will all undergo minification in order to reduce the output bundle size.
