
Markdown API follows semantic versioning.

Markdown API still being in [version 0](https://semver.org/#spec-item-4), contributions are yet limited to bug fix and implementing features listed in the [readme](./README.md#todo).

Please PR against the master branch and name your commit using one of the following template:

- `feat(<name>) <message>`: to add a meaningfull work step on a feature
- `fix(<file>) <message>`: to fix a single issue
- `doc(<file>) <message>`: to add/fix/remove documentation (code comments are documentation)

`<file>` should be the main file impacted by the commit, ie. the file with the highest level of abstraction / the closest from the interface input.
`<file>` could be `*` when referencing a commit involving a global change like a coding style rule.
`<message>` should be around max. 50 characters.
