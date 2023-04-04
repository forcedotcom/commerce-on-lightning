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

**This plugin requires the** [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli)**. For more information on the CLI, read the** [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands, however, you can install a specific version or tag if needed.

-   [commerce-on-lightning](https://github.com/forcedotcom/commerce-on-lightning) - @salesforce/commerce <---- THIS PLUGIN
    -   create stores
    -   install command: `sfdx plugins:install @salesforce/commerce`
    -   install specific version:`sfdx plugins:install @salesforce/commerce@242.0.26`

#### Plugin Dependencies

1. [shane-sfdx-plugins](https://github.com/mshanemc/shane-sfdx-plugins) - shane-sfdx-plugins
    - public plugin for imports
    - install command: `sfdx plugins:install shane-sfdx-plugins`

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
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
@salesforce/commerce/244.0.22 darwin-arm64 node-v16.17.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```

<!-- usagestop -->

<!-- install -->

## Install

```bash
sfdx plugins:install @salesforce/commerce

# install dependencies
sfdx plugins:install shane-sfdx-plugins
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
# Link your plugin to the sfdx cli
sfdx plugins:link .
# To verify
sfdx plugins
```

## Commands

<!-- commands -->

-   [`sfdx commerce:examples:convert -f <filepath> -n <string> [-d <string>] [-p <string>] [-o <string>] [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceexamplesconvert--f-filepath--n-string--d-string--p-string--o-string--y---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:extension:map [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceextensionmap--r-string--n-string--i-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:extension:points:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceextensionpointslist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:extension:register [-r <string>] [-e <string>] [-a <string>] [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceextensionregister--r-string--e-string--a-string--m-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:extension:unmap [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceextensionunmap--r-string--n-string--i-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:files:copy [name=value...] --filestocopy <array> --dirstocopy <array> --copysourcepath <string> [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercefilescopy-namevalue---filestocopy-array---dirstocopy-array---copysourcepath-string--y---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:ordermanagement:quickstart:setup [-y] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceordermanagementquickstartsetup--y--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:payments:quickstart:setup -n <string> [-p <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercepaymentsquickstartsetup--n-string--p-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceproductsimport--n-string--c-string--f-filepath--o-string--y--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:scratchorg:create [-u <string>] [-a <string>] [-t <string>] [-w <number>] [-y] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercescratchorgcreate--u-string--a-string--t-string--w-number--y--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:search:start [-n <string> | -i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercesearchstart--n-string---i-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:create [name=value...] -n <string> [-t <string>] [-f <filepath>] [-o <string>] [-b <string>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorecreate-namevalue--n-string--t-string--f-filepath--o-string--b-string--y--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:display -n <string> [-b <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestoredisplay--n-string--b-string--p-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:open -n <string> [--all] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestoreopen--n-string---all--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:quickstart:create [name=value...] -n <string> [-t <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorequickstartcreate-namevalue--n-string--t-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorequickstartsetup-namevalue--n-string--f-filepath--y--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx commerce:examples:convert -f <filepath> -n <string> [-d <string>] [-p <string>] [-o <string>] [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Convert repo examples to SFDX scratch org

```
USAGE
  $ sfdx commerce:examples:convert -f <filepath> -n <string> [-d <string>] [-p <string>] [-o <string>] [-y] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: ~/.commerce
                                                                                    /force-app] Directory to output the
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
  sfdx commerce:examples:convert -f store-scratch-def.json
```

_See code: [src/commands/commerce/examples/convert.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/examples/convert.ts)_

## `sfdx commerce:extension:map [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Maps an extension to a specific webstore

```
USAGE
  $ sfdx commerce:extension:map [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json]
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
  sfdx commerce:extension:map --registered-extension-name test-extension-name --store-name test-store-name
  sfdx commerce:extension:map --registered-extension-name test-extension-name --store-id test-store-id
```

_See code: [src/commands/commerce/extension/map.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/extension/map.ts)_

## `sfdx commerce:extension:points:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Lists all EPN values

```
USAGE
  $ sfdx commerce:extension:points:list [-u <string>] [--apiversion <string>] [--json] [--loglevel
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
  sfdx commerce:extension:getEPN
```

_See code: [src/commands/commerce/extension/points/list.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/extension/points/list.ts)_

## `sfdx commerce:extension:register [-r <string>] [-e <string>] [-a <string>] [-m <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Register an extension with one command

```
USAGE
  $ sfdx commerce:extension:register [-r <string>] [-e <string>] [-a <string>] [-m <string>] [-u <string>] [--apiversion
   <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --apex-class-name=apex-class-name
      Name of the Apex class that needs to be extended

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

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sfdx commerce:extension:register --registered-extension-name test-extension-name --extension-point-name test-epn
  --apex-class-name test-apex-class
```

_See code: [src/commands/commerce/extension/register.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/extension/register.ts)_

## `sfdx commerce:extension:unmap [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Unmaps an extension from a store

```
USAGE
  $ sfdx commerce:extension:unmap [-r <string>] [-n <string>] [-i <string>] [-u <string>] [--apiversion <string>]
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
  sfdx commerce:extension:unmap --registered-extension-name test-extension-name --store-name test-store-name
  sfdx commerce:extension:unmap --registered-extension-name test-extension-name --store-id test-store-id
```

_See code: [src/commands/commerce/extension/unmap.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/extension/unmap.ts)_

## `sfdx commerce:files:copy [name=value...] --filestocopy <array> --dirstocopy <array> --copysourcepath <string> [-y] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Copy files from source to destination folder ~/.commerce

```
USAGE
  $ sfdx commerce:files:copy [name=value...] --filestocopy <array> --dirstocopy <array> --copysourcepath <string> [-y]
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
  sfdx commerce:files:copy -y --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt"
  --dirstocopy "dir1,dir2,dir3"
  sfdx commerce:files:copy --prompt --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt"
  --dirstocopy "dir1,dir2,dir3"
  sfdx commerce:files:copy --copySourcePath "~/myexamplefilesdirectory" --filestocopy "file1.txt,file2.txt" --dirstocopy
   "dir1,dir2,dir3"
```

_See code: [src/commands/commerce/files/copy.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/files/copy.ts)_

## `sfdx commerce:ordermanagement:quickstart:setup [-y] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Set up order management

```
USAGE
  $ sfdx commerce:ordermanagement:quickstart:setup [-y] [-u <string>] [--apiversion <string>] [--json] [--loglevel
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
  sfdx commerce:ordermanagement:quickstart:setup
```

_See code: [src/commands/commerce/ordermanagement/quickstart/setup.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/ordermanagement/quickstart/setup.ts)_

## `sfdx commerce:payments:quickstart:setup -n <string> [-p <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Set up a new Payment Gateway

```
USAGE
  $ sfdx commerce:payments:quickstart:setup -n <string> [-p <string>] [-u <string>] [--apiversion <string>] [--json]
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
  sfdx commerce:payments:quickstart:setup -p Stripe -n 1commerce
```

_See code: [src/commands/commerce/payments/quickstart/setup.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/payments/quickstart/setup.ts)_

## `sfdx commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Prepare product data files for import

```
USAGE
  $ sfdx commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-y] [-v <string>] [-u
  <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --products-file-csv=products-file-csv                                         [default: ~/.commerce
                                                                                    /examples/csv/Alpine-small.csv] The
                                                                                    csv file containing products to
                                                                                    import.  Pass in empty value to do
                                                                                    product-less import

  -f, --definitionfile=definitionfile                                               [default: ~/.commerce
                                                                                    /config/store-scratch-def.json]
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
  sfdx commerce:products:import --store-name test-store
```

_See code: [src/commands/commerce/products/import.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/products/import.ts)_

## `sfdx commerce:scratchorg:create [-u <string>] [-a <string>] [-t <string>] [-w <number>] [-y] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Create a scratch org

```
USAGE
  $ sfdx commerce:scratchorg:create [-u <string>] [-a <string>] [-t <string>] [-w <number>] [-y] [-v <string>]
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --alias=alias                                                                 Alias name for this scratch org
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
  sfdx commerce:scratchorg:create --username demo@1commerce.com --targetdevhubusername ceo@mydevhub.com
```

_See code: [src/commands/commerce/scratchorg/create.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/scratchorg/create.ts)_

## `sfdx commerce:search:start [-n <string> | -i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Start search indexing for a given webstore

```
USAGE
  $ sfdx commerce:search:start [-n <string> | -i <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
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
  sfdx commerce:store:search:start -n storeName
          // Finds a store and indexes it
```

_See code: [src/commands/commerce/search/start.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/search/start.ts)_

## `sfdx commerce:store:create [name=value...] -n <string> [-t <string>] [-f <filepath>] [-o <string>] [-b <string>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Comprehensive create and set up a store. This will create your community/store push store sources, create buyer user, import products, create search index.

```
USAGE
  $ sfdx commerce:store:create [name=value...] -n <string> [-t <string>] [-f <filepath>] [-o <string>] [-b <string>]
  [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buyer-username=buyer-username                                               [default: buyer@1commerce.com]
                                                                                    buyer's username

  -f, --definitionfile=definitionfile                                               Store config file

  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -o, --type=b2c|b2b                                                                [default: b2c] The type of store you
                                                                                    want to create

  -t, --templatename=templatename                                                   template to use to create a site

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
  sfdx commerce:store:create --store-name test-store
```

_See code: [src/commands/commerce/store/create.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/store/create.ts)_

## `sfdx commerce:store:display -n <string> [-b <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Display buyer info

```
USAGE
  $ sfdx commerce:store:display -n <string> [-b <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion
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
  sfdx commerce:store:display --store-name test-store
```

_See code: [src/commands/commerce/store/display.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/store/display.ts)_

## `sfdx commerce:store:open -n <string> [--all] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Open store(s)

```
USAGE
  $ sfdx commerce:store:open -n <string> [--all] [-v <string>] [-u <string>] [--apiversion <string>] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --all                                                                             View All stores using sfdx
                                                                                    force:org:open
                                                                                    _ui/networks/setup/SetupNetworksPage
                                                                                    page

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  sfdx commerce:store:open --store-name test-store
  sfdx commerce:store:open --all
```

_See code: [src/commands/commerce/store/open.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/store/open.ts)_

## `sfdx commerce:store:quickstart:create [name=value...] -n <string> [-t <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Use this command to just create a community. It will use sfdx force:community:create until a community is created or failed.

```
USAGE
  $ sfdx commerce:store:quickstart:create [name=value...] -n <string> [-t <string>] [-u <string>] [--apiversion
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -t, --templatename=templatename                                                   [default: b2c-lite-storefront]
                                                                                    template to use to create a site

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sfdx commerce:store:quickstart:create --templatename 'b2c-lite-storefront'
```

_See code: [src/commands/commerce/store/quickstart/create.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/store/quickstart/create.ts)_

## `sfdx commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-y] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Set up a store

```
USAGE
  $ sfdx commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-y] [-v <string>] [-u <string>]
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --definitionfile=definitionfile                                               [default: ~/.commerce
                                                                                    /config/store-scratch-def.json]
                                                                                    config file

  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

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
  sfdx commerce:store:quickstart:setup --definitionfile store-scratch-def.json
```

_See code: [src/commands/commerce/store/quickstart/setup.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v244.0.22/src/commands/commerce/store/quickstart/setup.ts)_

<!-- commandsstop -->
<!-- debugging-your-plugin -->

# Debugging your plugin

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `commerce:store:create` command:

1. Start the inspector

If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch:

```sh-session
$ sfdx commerce:store:create -u myOrg@example.com --dev-suspend
```

Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run commerce:store:create -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program.
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
   <br><img src="https://github.com/forcedotcom/sfdx-plugin-generate/blob/main/templates/.images/vscodeScreenshot.png" width="480" height="278"><br>
   Congrats, you are debugging!
