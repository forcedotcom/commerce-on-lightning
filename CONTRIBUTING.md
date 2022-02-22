## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

## Build

```
$ yarn install
$ yarn build
```

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to [https://cla.salesforce.com/sign-cla](https://cla.salesforce.com/sign-cla).

## Branches

-   We work in `develop`
-   Our released (aka _production_) branch is `main`
-   Our work happens in _topic_ branches (feature and/or bug-fix).
    -   feature as well as bug-fix branches are based on `develop`
    -   branches _should_ be kept up-to-date using `rebase`
    -   see below for further merge instructions

### Merging between branches

-   We try to limit merge commits as much as possible.

    -   They are usually only ok when done by our release automation.

-   _Topic_ branches are:

    -   based on `develop` and will be squash-merged into `develop`.

-   Hot-fix branches are an exception.
    -   Instead we aim for faster cycles and a generally stable `develop` branch.

## Pull Requests

-   Develop features and bug fixes in _topic_ branches.
-   _Topic_ branches can live in forks (external contributors) or within this repository (committers).
    \*\* When creating _topic_ branches in this repository please prefix with `<developer-name>/`.

### Merging Pull Requests

-   Pull request merging is restricted to squash & merge only.
