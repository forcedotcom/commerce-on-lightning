# commerce-on-lightning

[![Version](https://img.shields.io/npm/v/@salesforce/commerce.svg)](https://npmjs.org/package/@salesforce/commerce)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/forcedotcom/commerce-on-lightning?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/commerce-on-lightning/branch/master)
[![Codecov](https://codecov.io/gh/forcedotcom/commerce-on-lightning/branch/master/graph/badge.svg)](https://codecov.io/gh/forcedotcom/commerce-on-lightning)
[![Known Vulnerabilities](https://snyk.io/test/github/forcedotcom/commerce-on-lightning/badge.svg)](https://snyk.io/test/github/forcedotcom/commerce-on-lightning)
[![Downloads/week](https://img.shields.io/npm/dw/@salesforce/commerce.svg)](https://npmjs.org/package/@salesforce/commerce)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/forcedotcom/commerce-on-lightning/main/LICENSE.txt)

### Commerce commands for Salesforce CLI.

If you want a store, for test or any other purposes, then use this plugin to automate all steps required.
It has built in automation to help if any steps fail. This plugin is designed to be as hands off as possible.

This plugin is used to create and setup either a B2B or a B2C store with data with as little effort as possible.

**This plugin requires the** [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli)**. For more information on the CLI, read the** [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm).

We always recommend using the latest version of these commands, however, you can install a specific version or tag if needed.

-   [commerce-on-lightning](https://github.com/forcedotcom/commerce-on-lightning) - @salesforce/commerce <---- THIS PLUGIN

    -   create stores
    -   install command: `sfdx plugins:install @salesforce/commerce`
    -   install specific version:`sfdx plugins:install @salesforce/commerce@242.0.26`

    ==============

-   [Introduction](#introduction)
-   [Usage](#usage)
-   [Install](#install)
-   [Commands](#commands)
-   [Debugging your plugin](#debugging-your-plugin)
-   [Commerce Org and Store Setup Guide](docs/setup-guide.md)

## Introduction

This plugin is designed to setup a test store either B2B or B2C within a scratch org. It will add products and
users, a guest user, admin user and buyer user.
This plugin assumes your devhub and scratchorg are already setup.

This repo also contains example components for your store you can load after the fact.

For B2C examples components please see:
[B2B2C Advanced Reference Components](https://github.com/forcedotcom/commerce-on-lightning/tree/main/examples/b2c/lwc)

For B2B examples components please see:
[B2B Advanced Reference Components](https://github.com/forcedotcom/commerce-on-lightning/tree/main/examples/b2b/lwc)

### Usage

<!-- usage -->

```sh-session
$ npm install -g @salesforce/commerce
$ sf COMMAND
running command...
$ sf (-v|--version|version)
@salesforce/commerce/252.0.1 darwin-arm64 node-v18.20.1
$ sf --help [COMMAND]
USAGE
  $ sf COMMAND
...
```

<!-- usagestop -->

<!-- install -->

## Install

```bash
sf plugins:install @salesforce/commerce
```

<!-- installstop -->

## Issues

Please report any issues at https://github.com/forcedotcom/commerce-on-lightning/issues

## Contributing

Please see our [CONTRIBUTING](CONTRIBUTING.md) guide.

### Build

If you plan to help develop the plugin then these steps are for you.

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:forcedotcom/commerce-on-lightning.git

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/run` or `./bin/run.cmd` file. This is helpful for mostly debugging
purposes as you can add this command to an IDE.

```bash
# Run using local run file.
./bin/run commerce:store:create
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sf cli
sf plugins:link .
# To verify
sf plugins
```

## Commands

<!-- commands -->

-   [`sf commerce:examples:convert -f <filepath> -n <string> [-d <string>] [-p <string>] [-o <string>] [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commerceexamplesconvert--f-filepath--n-string--d-string--p-string--o-string--y---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:extension:map [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commerceextensionmap--r-string--n-string--i-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:extension:points:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commerceextensionpointslist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:extension:register [-r <string>] [-e <string>] [-a <string>] [-m <string>] [-d <string>] [--icon-uri <string>] [--is-application] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commerceextensionregister--r-string--e-string--a-string--m-string--d-string---icon-uri-string---is-application--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:extension:unmap [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commerceextensionunmap--r-string--n-string--i-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:files:copy [name=value...] --filestocopy <array> --dirstocopy <array> --copysourcepath <string> [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercefilescopy-namevalue---filestocopy-array---dirstocopy-array---copysourcepath-string--y---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:ordermanagement:quickstart:setup [-y] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commerceordermanagementquickstartsetup--y--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:payments:quickstart:setup -n <string> [-p <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercepaymentsquickstartsetup--n-string--p-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commerceproductsimport--n-string--c-string--f-filepath--o-string--y--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:scratchorg:create [-u <string>] [-a <string>] [-t <string>] [-w <number>] [-y] [-d <number>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercescratchorgcreate--u-string--a-string--t-string--w-number--y--d-number--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:search:start [-n <string> | -i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercesearchstart--n-string---i-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:store:create [name=value...] -n <string> [-t <string>] [-f <filepath>] [-o <string>] [-b <string>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercestorecreate-namevalue--n-string--t-string--f-filepath--o-string--b-string--y--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:store:display -n <string> [-b <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercestoredisplay--n-string--b-string--p-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:store:open -n <string> [--all] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercestoreopen--n-string---all--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:store:quickstart:create [name=value...] -n <string> [-t <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercestorequickstartcreate-namevalue--n-string--t-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sf commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-y] [-t <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sf-commercestorequickstartsetup-namevalue--n-string--f-filepath--y--t-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sf commerce:examples:convert -f <filepath> -n <string> [-d <string>] [-p <string>] [-o <string>] [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Convert repo examples to SFDX scratch org

```
USAGE
  $ sf commerce:examples:convert -f <filepath> -n <string> [-d <string>] [-p <string>] [-o <string>] [-y] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: ~/.commerc
                                                                                    e/force-app] Directory to output the
                                                                                    conversion

  -f, --definitionfile=definitionfile                                               (required) config file

  -n, --store-name=store-name                                                       (required) [default: 1commerce]
                                                                                    Store name

  -o, --type=b2c|b2b                                                                The type of store you want to create

  -p, --sourcepath=sourcepath                                                       Files to convert

  -y, --prompt                                                                      If there is a file difference
                                                                                    detected, prompt before overwriting
                                                                                    file

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sf commerce:examples:convert -f store-scratch-def.json
```

_See code: [src/commands/commerce/examples/convert.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/examples/convert.ts)_

## `sf commerce:extension:map [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Maps an extension to a specific webstore

```
USAGE
  $ sf commerce:extension:map [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json]
   [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --store-id=store-id                                                           Optional webstore ID flag

  -n, --store-name=store-name                                                       The name of the webstore to map the
                                                                                    extension

  -r, --registered-extension-name=registered-extension-name                         Unique name for extension

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  sf commerce:extension:map --registered-extension-name test-extension-name --store-name test-store-name
  sf commerce:extension:map --registered-extension-name test-extension-name --store-id test-store-id
```

_See code: [src/commands/commerce/extension/map.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/extension/map.ts)_

## `sf commerce:extension:points:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Lists all EPN values

```
USAGE
  $ sf commerce:extension:points:list [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sf commerce:extension:getEPN
```

_See code: [src/commands/commerce/extension/points/list.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/extension/points/list.ts)_

## `sf commerce:extension:register [-r <string>] [-e <string>] [-a <string>] [-m <string>] [-d <string>] [--icon-uri <string>] [--is-application] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Register an extension with one command

```
USAGE
  $ sf commerce:extension:register [-r <string>] [-e <string>] [-a <string>] [-m <string>] [-d <string>] [--icon-uri
  <string>] [--is-application] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --apex-class-name=apex-class-name
      Name of the Apex class that needs to be extended

  -d, --description=description
      A brief description of the extension

  -e, --extension-point-name=extension-point-name
      Means of identifying entry points within the domain code that are capable of being extended by partners.Takes the
      form domain_sub-domain_interface. E.g: checkout_summary_computeTax

  -m, --apex-namespace=apex-namespace
      Optional namespace for apex class

  -r, --registered-extension-name=registered-extension-name
      Unique name for extension

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --icon-uri=icon-uri
      Where to find the icon representing the extension in URI form.

  --is-application
      A boolean that indicates if the extension provider is contained within a managed package

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sf commerce:extension:register --registered-extension-name test-extension-name --extension-point-name test-epn
  --apex-class-name test-apex-class
```

_See code: [src/commands/commerce/extension/register.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/extension/register.ts)_

## `sf commerce:extension:unmap [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Unmaps an extension from a store

```
USAGE
  $ sf commerce:extension:unmap [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>]
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --store-id=store-id                                                           Optional webstore ID flag

  -n, --store-name=store-name                                                       The name of the webstore to map the
                                                                                    extension

  -r, --registered-extension-name=registered-extension-name                         Unique name for extension

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  sf commerce:extension:unmap --registered-extension-name test-extension-name --store-name test-store-name
  sf commerce:extension:unmap --registered-extension-name test-extension-name --store-id test-store-id
```

_See code: [src/commands/commerce/extension/unmap.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/extension/unmap.ts)_

## `sf commerce:files:copy [name=value...] --filestocopy <array> --dirstocopy <array> --copysourcepath <string> [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Copy files from source to destination folder ~/.commerce

```
USAGE
  $ sf commerce:files:copy [name=value...] --filestocopy <array> --dirstocopy <array> --copysourcepath <string> [-y]
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -y, --prompt                                                                      If there is a file difference
                                                                                    detected, prompt before overwriting
                                                                                    file

  --copysourcepath=copysourcepath                                                   (required) Base path for files and
                                                                                    directories to be copied from

  --dirstocopy=dirstocopy                                                           (required) Array of directories
                                                                                    (including their contents) located
                                                                                    in source directory to copy

  --filestocopy=filestocopy                                                         (required) Array of individual files
                                                                                    to copy located directly in source
                                                                                    directory

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  sf commerce:files:copy -y --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt"
  --dirstocopy "dir1,dir2,dir3"
  sf commerce:files:copy --prompt --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt"
  --dirstocopy "dir1,dir2,dir3"
  sf commerce:files:copy --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt" --dirstocopy
  "dir1,dir2,dir3"
```

_See code: [src/commands/commerce/files/copy.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/files/copy.ts)_

## `sf commerce:ordermanagement:quickstart:setup [-y] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Set up order management

```
USAGE
  $ sf commerce:ordermanagement:quickstart:setup [-y] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -y, --prompt                                                                      If there is a file difference
                                                                                    detected, prompt before overwriting
                                                                                    file

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sf commerce:ordermanagement:quickstart:setup
```

_See code: [src/commands/commerce/ordermanagement/quickstart/setup.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/ordermanagement/quickstart/setup.ts)_

## `sf commerce:payments:quickstart:setup -n <string> [-p <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Set up a new Payment Gateway

```
USAGE
  $ sf commerce:payments:quickstart:setup -n <string> [-p <string>] [-u <string>] [--apiversion <string>] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -p, --payment-adapter=payment-adapter                                             [default: Stripe] Payment Adapter

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sf commerce:payments:quickstart:setup -p Stripe -n 1commerce
```

_See code: [src/commands/commerce/payments/quickstart/setup.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/payments/quickstart/setup.ts)_

## `sf commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Prepare product data files for import

```
USAGE
  $ sf commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-y] [-v <string>] [-u
  <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --products-file-csv=products-file-csv                                         [default: ~/.commerc
                                                                                    e/examples/csv/Alpine-small.csv] The
                                                                                    csv file containing products to
                                                                                    import.  Pass in empty value to do
                                                                                    product-less import

  -f, --definitionfile=definitionfile                                               [default: ~/.commerc
                                                                                    e/config/store-scratch-def.json]
                                                                                    config file

  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -o, --type=b2c|b2b                                                                [default: b2c] The type of store you
                                                                                    want to create

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  -y, --prompt                                                                      If there is a file difference
                                                                                    detected, prompt before overwriting
                                                                                    file

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sf commerce:products:import --store-name test-store
```

_See code: [src/commands/commerce/products/import.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/products/import.ts)_

## `sf commerce:scratchorg:create [-u <string>] [-a <string>] [-t <string>] [-w <number>] [-y] [-d <number>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Create a scratch org

```
USAGE
  $ sf commerce:scratchorg:create [-u <string>] [-a <string>] [-t <string>] [-w <number>] [-y] [-d <number>] [-v
  <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --alias=alias                                                                 Alias name for this scratch org

  -d, --duration=duration                                                           [default: 30] Duration of the
                                                                                    scratch org (in days)

  -t, --type=type                                                                   [default: both] b2b, b2c or both

  -u, --username=username                                                           username of the admin to associate
                                                                                    with the scratch org.

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  -w, --wait=wait                                                                   [default: 15] The streaming client
                                                                                    socket timeout (in minutes)

  -y, --prompt                                                                      If there is a file difference
                                                                                    detected, prompt before overwriting
                                                                                    file

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sf commerce:scratchorg:create --username demo@1commerce.com --targetdevhubusername ceo@mydevhub.com
```

_See code: [src/commands/commerce/scratchorg/create.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/scratchorg/create.ts)_

## `sf commerce:search:start [-n <string> | -i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Start search indexing for a given webstore

```
USAGE
  $ sf commerce:search:start [-n <string> | -i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --store-id=store-id                                                           ID of webstore to index
  -n, --store-name=store-name                                                       name of webstore to index

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sf commerce:store:search:start -n storeName
          // Finds a store and indexes it
```

_See code: [src/commands/commerce/search/start.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/search/start.ts)_

## `sf commerce:store:create [name=value...] -n <string> [-t <string>] [-f <filepath>] [-o <string>] [-b <string>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Comprehensive create and set up a store. This will create your community/store push store sources, create buyer user, import products, create search index.

```
USAGE
  $ sf commerce:store:create [name=value...] -n <string> [-t <string>] [-f <filepath>] [-o <string>] [-b <string>]
  [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buyer-username=buyer-username
      [default: buyer@1commerce.com] buyer's username

  -f, --definitionfile=definitionfile
      The store config file. By default it will be either of ~/.commerce/config/b2c-store-scratch-def or
      ~/.commerce/config/b2b-store-scratch-def based on store type. Default store type is b2c.]

  -n, --store-name=store-name
      (required) [default: 1commerce] name of the site to create

  -o, --type=b2c|b2b
      [default: b2c] The type of store you want to create

  -t, --templatename=templatename
      Template to use to create a site. If not specified, the template is retrieved from the store config file based on
      the store type (b2b or b2c).

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername
      username or alias for the dev hub org; overrides default dev hub org

  -y, --prompt
      If there is a file difference detected, prompt before overwriting file

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sf commerce:store:create --store-name test-store
```

_See code: [src/commands/commerce/store/create.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/store/create.ts)_

## `sf commerce:store:display -n <string> [-b <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Display buyer info

```
USAGE
  $ sf commerce:store:display -n <string> [-b <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buyer-username=buyer-username                                               [default: buyer@1commerce.com]
                                                                                    buyer's username

  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -p, --urlpathprefix=urlpathprefix                                                 required if different from
                                                                                    store-name URL to append to the
                                                                                    domain created when Experiences was
                                                                                    enabled for this org

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sf commerce:store:display --store-name test-store
```

_See code: [src/commands/commerce/store/display.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/store/display.ts)_

## `sf commerce:store:open -n <string> [--all] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Open store(s)

```
USAGE
  $ sf commerce:store:open -n <string> [--all] [-v <string>] [-u <string>] [--apiversion <string>] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --all                                                                             View All stores using sf org open
                                                                                    _ui/networks/setup/SetupNetworksPage
                                                                                    page

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  sf commerce:store:open --store-name test-store
  sf commerce:store:open --all
```

_See code: [src/commands/commerce/store/open.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/store/open.ts)_

## `sf commerce:store:quickstart:create [name=value...] -n <string> [-t <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Use this command to just create a community. It will use sf community create until a community is created or failed.

```
USAGE
  $ sf commerce:store:quickstart:create [name=value...] -n <string> [-t <string>] [-u <string>] [--apiversion
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --store-name=store-name
      (required) [default: 1commerce] name of the site to create

  -t, --templatename=templatename
      [default: b2c-lite-storefront] Template to use to create a site. If not specified, the template is retrieved from
      the store config file based on the store type (b2b or b2c).

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sf commerce:store:quickstart:create --templatename 'b2c-lite-storefront'
```

_See code: [src/commands/commerce/store/quickstart/create.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/store/quickstart/create.ts)_

## `sf commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-y] [-t <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Set up a store

```
USAGE
  $ sf commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-y] [-t <string>] [-v <string>]
  [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --definitionfile=definitionfile
      [default: ~/.commerce/config/store-scratch-def.json] config file

  -n, --store-name=store-name
      (required) [default: 1commerce] name of the site to create

  -t, --templatename=templatename
      [default: b2c-lite-storefront] Template to use to create a site. If not specified, the template is retrieved from
      the store config file based on the store type (b2b or b2c).

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername
      username or alias for the dev hub org; overrides default dev hub org

  -y, --prompt
      If there is a file difference detected, prompt before overwriting file

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sf commerce:store:quickstart:setup --definitionfile store-scratch-def.json
```

_See code: [src/commands/commerce/store/quickstart/setup.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v250.1.0/src/commands/commerce/store/quickstart/setup.ts)_

<!-- commandsstop -->
<!-- debugging-your-plugin -->

# Debugging your plugin

Please see our [CONTRIBUTING](CONTRIBUTING.md#debugging) guide.
