[![CircleCI](https://circleci.com/gh/creativewave/markdown-api.svg?style=svg)](https://circleci.com/gh/creativewave/markdown-api)

# Markdown API

1. [About](#about)
2. [How it works](#how-it-works)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)

## About

Markdown API is a JavaScript command line interface to build and manage (JSON) API endpoints using JavaScript and Markdown files to describe resource contents.

It provides a *developer experience* in content management using an advanced editor and/or the command line interface, as an alternative to the *CMS experience* using the browser and a WYSIWYG editor, and bound to multiple dependencies like PHP or Ruby, MySQL or MongoDB, etc...

It also provides:

- [x] endpoints for resources lists (indexes)
- [x] a low level JavaScript API to create, read, update, and delete endpoints (headless CMS)
- [x] a small build time, by writing or removing only what needs to be created, updated, or removed
- [x] (opt-in) long term caching of endpoints via a hash in endpoints filenames
- [ ] (opt-in) defining fields, relations, and files contents using schemas for each resource type
- [ ] (opt-in) batching CRUD operations, to avoid building after each individual operation

## How it works?

Each resource entry should be contained in its own directory (its name will act as its identifier), contained itself in a directory named after the resource type, eg. `posts`.

Each resource entry requires 3 mandatory files:

- `content.md`: the main content
- `excerpt.md`: the content used in indexes
- `index.js`: the meta data (also used in indexes)

Static files referenced in those contents may be stored in an optional `static` folder. All static files will be copied into the dist folder, and optionally processed by an image optimizer (default to `imagemin` and `imagemin-webp`).

`index.js`:

```js
module.exports = {
  date: Number,      // Note: format should be YYYYMMDD
  draft: Boolean,    // Note: if `true`, the corresponding endpoint will not be built
  categories: Array, // Note: values will be slugified in indexes endpoints paths
  slug: String,      // Note: not used yet (cf. TODO)
  title: String,
}
```

The resource will be indexed in resources lists named after the specified `categories`.

**Note:** later, loading schema-s (see [TODO](##todo) and [lib/schema.js](lib/schema.js)) via the CLI `--schema` option or the `schemas` property in the [optional configuration file](#configuration), will provide a way to define relations for each resource type with other resource type, as well as its fields and their association to specific file names.

**With the following source files tree...**

```
src
  └── posts
    └── entry-1
      └── content.md
      └── excerpt.md
      └── index.js
      └── static
        └── img.jpg
    └── entry-2
        ...
```

**... the `api build` command will create the following distribution files tree:**

```
dist
  └── api
    └── categories
      └── posts
        └── all
          └── 1/index.json  // List of n first posts
          └── 2/index.json  // List of 2n first posts
        └── category-1
          └── 1/index.json  // List of n first posts from "category-1"
          └── 2/index.json  // List of 2n first posts from "category-1"
        └── index.json      // List of categories
    └── posts
      └── entry-1/index.json
      └── entry-2/index.json
  └── static
    └── posts
      └── entry-1
        └── img.jpg
        └── img.webp
```

## Installation

```shell
  npm i @cdoublev/markdown-api
```

Markdown API has been developped and used in production with NodeJS >= 10. Tests and support of previous versions may come later.

## Configuration

An optional configuration file named `api.config.js` can be used to define default values for all command options values, except the `--name, -n` and `--type, -t` options which are required to update or remove a resource entry.

The path to `api.config.js` will be resolved to the directory where the command is run from. Each configuration value might be a function returning the expected value.

```js
module.exports = {
  categories: Array,
  content: String,
  date: Number, // YYYYMMDD
  dist: String,
  entitiesPerPage: Number,
  excerpt: String,
  src: String,
  title: String,
}
```

## Usage

```shell
  node_modules/.bin/api -h
```

- [`api add`](#api-add)
- [`api set`](#api-set)
- [`api remove`](#api-remove)
- [`api get`](#api-get)
- [`api build`](#api-build)
- [`api stats`](#api-stats)

### `api add`

`api add` scaffolds a new resource entry.

Parameters:

```
  -t, --type <type>              type for the new entry (required)
  -s, --src <src>                path to sources directory (required) (default: "./src/api")
  -T, --title <title>            title for the new entry (required) (default: "New post")
  -c, --content [content]        content for the new entry (default: "Introduction\n\n## Chapter 1\n\n## Chapter 2\n\n## Chapter 3\n\n## Conclusion")
  -e, --excerpt [excerpt]        excerpt for the new entry (default: "TODO: excerpt.")
  -C, --categories [categories]  categories for the new entry (default: [])
  -D, --date [date]              date for the new entry (default: today with format yyyddmm)
```

Example: `api add -t posts -T "My new post title" -C announcements,general -d 20190101`

### `api set`

`api set` sets the title, excerpt, content, categories, and/or the date of a resource entry.

Parameters:

```
  -t, --type <type>              type of the entry to set (required)
  -s, --src <src>                path to sources directory (required) (default: "./src/api")
  -n, --name <name>              name of the directory containing the sources files (required)
  -t, --title [title]            new title for the entry
  -c, --content [content]        new content for the entry
  -e, --excerpt [excerpt]        new excerpt for the entry
  -C, --categories [categories]  new categories for the entry
  -D, --date [date]              date for the new entry
```

Example: `api set -t posts -n my-new-blog -T "My new blog post"`

### `api remove`

`api remove` remove a resource entry.

Parameters:

```
  -t, --type <type>  type of the entry to remove (required)
  -s, --src <src>    path to sources directory (required) (default: "./src/api")
  -d, --dist <dist>  path to distribution directory (required) (default: "./dist/api")
  -n, --name <name>  name of the directory containing the sources files (required)
```

Example: `api remove -t posts -n my-new-blog`

### `api get`

(TODO) `api get` outputs either raw or processed contents of a single or multiple resource entries, optionally using filters.

It's a kind of search interface on top of a low level JavaScript API made to handle client requests for reading a specific resources.

### `api build`

`api build` creates/removes/updates endpoints of new/removed/updated resources.

Parameters:

```
  -s, --src <src>    path to sources directory (required) (default: "./src/api")
  -d, --dist <dist>  path to distribution directory (required) (default: "./dist/api")
  -f, --force        build without checking if sources have been updated
  -p, --pp           entities per (index) page (default: 10)
  -w, --watch        automatically build on change
```

### `api stats`

(TODO) `api stats` outputs some resources statistics.

## TODO

- Feature: endpoints long term caching using hash
- Feature: `api get` (define and implement behavior)
- Feature: `api stats` (define and implement behavior)
- Feature: `-t, --type` option for `api build` (to only build endpoints of the corresponding resources type(s))
- Feature: `--no-index` option for `api-build` to opt-out from building indexes (and just let entities be consumed by an aggregator like GraphQL)
- Feature: define resource endpoints paths using its `slug` instead of its `name`
- Feature: schema data type and command line option to define resources types, files, fields, and relations
- Feature: hook to process content with any Markdown flavor (default to marked)
- Feature: hook to process static files (default to imagemin and imagemin-webp for jpg|png)
- Feature: batch operations
