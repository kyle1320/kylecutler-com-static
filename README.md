# kylecutler-com-static

Static files for my personal website.

http://www.kylecutler.com/

## Get Started
To build the project, simply execute the following commands from the root project directory:

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

`index.js` contains exports for the location of the `public` directory, as well as the location of the 404 page.

## Project Structure

This project uses the following libraries for source file compilation:

| Output Format | Tools Used |
|---------------|------------|
| HTML | [Pug](https://pugjs.org), [Babel](https://babeljs.io), [htmlmin](https://www.npmjs.com/package/htmlmin) |
| CSS | [Sass](https://sass-lang.com), [autoprefixer](https://www.npmjs.com/package/autoprefixer), [clean-css](https://github.com/jakubpawlowicz/clean-css) |
| JS | [Babel](https://babeljs.io), [Browserify](http://browserify.org), [TypeScript](http://typescriptlang.org), [envify](https://www.npmjs.com/package/envify), [tinyify](https://www.npmjs.com/package/tinyify), [UglifyJS](https://www.npmjs.com/package/uglify-js) |

All source files reside within the `src/` directory, separated into the following directories:

### `assets/`:

Static content. All content within this directory is directly copied to the output folder with no processing.

### `content/`:

Mostly intended for HTML page templates, but also allows for Javascript files and static content.

All Pug templates will be converted into HTML files and added to the output directory.

All Javascript and TypeScript files will be transpiled to ES5 using Babel.

All other content will be copied directly to the output folder.

**Note:**
The `content/` folder eliminates the technical need for the `assets/` folder. The presence of the `assets/` folder is intended to reduce clutter within the `content/` folder by separating out non-compiled items like fonts and images. It also makes it possible to have static assets that use compiled extensions like `.js` or `.pug`. Non-compiled items can still be present within the `content/` folder, in order to make deeply-nested assets more manageable.

### `scripts/`:

Intended for more advanced scripts. Supports a mix of Javascript and TypeScript files that will be bundled together using Browserify.

The module entry points include `/site.js`, as well as any files matching the pattern `/standalone/*.js`. The idea behind this is that most pages on the site will include `site.js`. Any non-standard pages, like standalone apps or the résumé page, can have their own separate scripts bundle under the `standalone/` directory and include that file instead.

Each bundle will be transpiled to ES5, and automatically include polyfills according to the `browserslist` browser query in `package.json`.

In addition, the `envify` package is used to replace `process.env.*` expressions with string values. This essentially allows conditional compilation of Javascript code, when used in the following way:

```javascript
if (process.env.NODE_ENV === 'development') {
  // print debug info, etc.
}
```

The included Gulp tasks set the `NODE_ENV` environment variable to `development` when running a development build, and `production` when running a production build. When processed with `envify`, followed by a minifier, the `if` statement will be optimized away entirely, either leaving the code within or removing it entirely.

### `styles/`:

All site styles, compiled using Sass. Any files that don't start with an underscore will be compiled and added to the output directory.

This directory follows a similar structure to the `scripts/` directory -- the only files that will be compiled (currently) are `/main.scss` and a few standalone stylesheets within the `standalone/` directory. The reasoning behind this is the same as for having standalone bundles within the `scripts/` directory.

### `templates/`:

Pug templates. These templates will not be compiled to the output. Instead, they are used for importing by the Pug templates within the `content/` directory.

## Development vs. Production Builds

There are a couple of differences between the development and production builds, namely source maps and minification.

In development builds, Sass and JS / TS files will include sourcemaps to allow for easier debugging. They will also not undergo minification, mostly to reduce build time.

In production builds, HTML, CSS, and JS files will all undergo minification in order to reduce the output file size.