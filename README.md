# commerce-on-lightning

[![Version](https://img.shields.io/npm/v/@salesforce/commerce.svg)](https://npmjs.org/package/@salesforce/commerce)
[![CircleCI](https://circleci.com/gh/forcedotcom/commerce-on-lightning.svg?style=shield)](https://circleci.com/gh/forcedotcom/commerce-on-lightning)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/1commerce/1commerce?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/1commerce/branch/master)
[![Codecov](https://codecov.io/gh/1commerce/1commerce/branch/master/graph/badge.svg)](https://codecov.io/gh/1commerce/1commerce)
[![Greenkeeper](https://badges.greenkeeper.io/1commerce/1commerce.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/1commerce/1commerce/badge.svg)](https://snyk.io/test/github/1commerce/1commerce)
[![Downloads/week](https://img.shields.io/npm/dw/@salesforce/commerce.svg)](https://npmjs.org/package/@salesforce/commerce)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/forcedotcom/commerce-on-lightning/main/LICENSE.txt)

### Commerce commands for Salesforce CLI.

If you want a store, for test or any other purposes, then use this plugin to automate all steps required.
It has built in automation to help if any steps fail. This plugin is designed to be as hands off as possible.

This plugin is used to create and setup either a B2B or a B2C store with data with as little effort as possible.

**This plugin requires the** [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli)**. For more information on the CLI, read the** [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands, however, you can install a specific version or tag if needed.

[commerce-on-lightning-orchestration](https://forcedotcom/commerce-on-lightning/commerce-on-lightning-orchestration) - commerce-orchestration

-   scratchorgs

[commerce-on-lightning](https://forcedotcom/commerce-on-lightning/commerce-on-lightning-orchestration) - @salesforce/commerce <---- THIS PLUGIN

-   store

==============

## Introduction

-   [Usage](#usage)
-   [Install](#install)
-   [Post Install](#now-that-you-have-the-commerce-plugin-installed-please-see)
-   [Commands](#commands)
-   [Debugging your plugin](#debugging-your-plugin)
<!-- usage -->

```sh-session
$ npm install -g @salesforce/commerce
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
@salesforce/commerce/234.0.14 linux-x64 node-v12.22.9
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
```

<!-- installstop -->

## Issues

Please report any issues at https://github.com/forcedotcom/commerce-on-lightning/issues

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

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-auth

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/run` or `./bin/run.cmd` file.

```bash
# Run using local run file.
./bin/run auth
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

-   [`sfdx commerce:examples:convert -n <string> [-f <filepath>] [-d <string>] [-p <string>] [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceexamplesconvert--n-string--f-filepath--d-string--p-string--o-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:payments:quickstart:setup -n <string> [-p <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercepaymentsquickstartsetup--n-string--p-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceproductsimport--n-string--c-string--f-filepath--o-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:create [name=value...] -n <string> [-f <filepath>] [-o <string>] [-t <string>] [-b <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorecreate-namevalue--n-string--f-filepath--o-string--t-string--b-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:display -n <string> [-b <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestoredisplay--n-string--b-string--p-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:open -n <string> [--all] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestoreopen--n-string---all--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:quickstart:create [name=value...] -n <string> [-t <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorequickstartcreate-namevalue--n-string--t-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
-   [`sfdx commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorequickstartsetup-namevalue--n-string--f-filepath--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx commerce:examples:convert -n <string> [-f <filepath>] [-d <string>] [-p <string>] [-o <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Convert repo examples to SFDX scratch org

```
USAGE
  $ sfdx commerce:examples:convert -n <string> [-f <filepath>] [-d <string>] [-p <string>] [-o <string>] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default:
                                                                                    ~/.commerce/force-app]
                                                                                    Directory to output the conversion

  -f, --definitionfile=definitionfile                                               [default:
                                                                                    ~/.commerce/config/stor
                                                                                    e-scratch-def.json] config file

  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -o, --type=b2c|b2b                                                                [default: b2c] The type of store you
                                                                                    want to create

  -p, --sourcepath=sourcepath                                                       Files to convert

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sfdx commerce:examples:convert -f store-scratch-def.json
```

_See code: [src/commands/commerce/examples/convert.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v234.0.14/src/commands/commerce/examples/convert.ts)_

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
  sfdx commerce:payments:quickstart:setup -p Stripe
```

_See code: [src/commands/commerce/payments/quickstart/setup.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v234.0.14/src/commands/commerce/payments/quickstart/setup.ts)_

## `sfdx commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Prepare product data files for import

```
USAGE
  $ sfdx commerce:products:import -n <string> [-c <string>] [-f <filepath>] [-o <string>] [-v <string>] [-u <string>]
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --products-file-csv=products-file-csv
      [default: ~/.commerce/examples/csv/Alpine-small.csv] The csv file containing products to import.  Pass
      in empty value to do product-less import

  -f, --definitionfile=definitionfile
      [default: ~/.commerce/config/store-scratch-def.json] config file

  -n, --store-name=store-name
      (required) [default: 1commerce] name of the site to create

  -o, --type=b2c|b2b
      [default: b2c] The type of store you want to create

  -u, --targetusername=targetusername
      username or alias for the target org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername
      username or alias for the dev hub org; overrides default dev hub org

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

EXAMPLE
  sfdx commerce:products:import --store-name test-store
```

_See code: [src/commands/commerce/products/import.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v234.0.14/src/commands/commerce/products/import.ts)_

## `sfdx commerce:store:create [name=value...] -n <string> [-f <filepath>] [-o <string>] [-t <string>] [-b <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Comprehensive create and set up a store. This will create your community/store push store sources, create buyer user, import products, create search index.

```
USAGE
  $ sfdx commerce:store:create [name=value...] -n <string> [-f <filepath>] [-o <string>] [-t <string>] [-b <string>] [-v
  <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buyer-username=buyer-username                                               [default: buyer@1commerce.com]
                                                                                    buyer's username

  -f, --definitionfile=definitionfile                                               [default:
                                                                                    ~/.commerce/config/stor
                                                                                    e-scratch-def.json] config file

  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

  -o, --type=b2c|b2b                                                                [default: b2c] The type of store you
                                                                                    want to create

  -t, --templatename=templatename                                                   [default: b2c-lite-storefront]
                                                                                    template to use to create a site

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
  sfdx commerce:store:create --store-name test-store
```

_See code: [src/commands/commerce/store/create.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v234.0.14/src/commands/commerce/store/create.ts)_

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

_See code: [src/commands/commerce/store/display.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v234.0.14/src/commands/commerce/store/display.ts)_

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

_See code: [src/commands/commerce/store/open.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v234.0.14/src/commands/commerce/store/open.ts)_

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

_See code: [src/commands/commerce/store/quickstart/create.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v234.0.14/src/commands/commerce/store/quickstart/create.ts)_

## `sfdx commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Set up a store

```
USAGE
  $ sfdx commerce:store:quickstart:setup [name=value...] -n <string> [-f <filepath>] [-v <string>] [-u <string>]
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --definitionfile=definitionfile                                               [default:
                                                                                    ~/.commerce/config/stor
                                                                                    e-scratch-def.json] config file

  -n, --store-name=store-name                                                       (required) [default: 1commerce] name
                                                                                    of the site to create

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
  sfdx commerce:store:quickstart:setup --definitionfile store-scratch-def.json
```

_See code: [src/commands/commerce/store/quickstart/setup.ts](https://github.com/forcedotcom/commerce-on-lightning/blob/v234.0.14/src/commands/commerce/store/quickstart/setup.ts)_

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
   <br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
   Congrats, you are debugging!
