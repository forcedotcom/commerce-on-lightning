# commerce-on-lightning

[![Version](https://img.shields.io/npm/v/1commerce.svg)](https://npmjs.org/package/1commerce)
[![CircleCI](https://circleci.com/gh/1commerce/1commerce/tree/master.svg?style=shield)](https://circleci.com/gh/1commerce/1commerce/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/1commerce/1commerce?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/1commerce/branch/master)
[![Codecov](https://codecov.io/gh/1commerce/1commerce/branch/master/graph/badge.svg)](https://codecov.io/gh/1commerce/1commerce)
[![Greenkeeper](https://badges.greenkeeper.io/1commerce/1commerce.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/1commerce/1commerce/badge.svg)](https://snyk.io/test/github/1commerce/1commerce)
[![Downloads/week](https://img.shields.io/npm/dw/1commerce.svg)](https://npmjs.org/package/1commerce)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-auth/main/LICENSE.txt)

Commerce commands for Salesforce CLI

This plugin requires the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands, however, you can install a specific version or tag if needed.



-   [Install](#install)
-   [Post Install](#now-that-you-have-the-commerce-plugin-installed-please-see)
-   [Commands](#commands)
-   [Debugging your plugin](#debugging-your-plugin)
<!-- install -->

## Install


```bash
sfdx plugins:install commerce@x.y.z
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
* [`sfdx commerce:examples:convert [-f <filepath>] [-o <string>] [-e <string>] [-d <string>] [-s <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceexamplesconvert--f-filepath--o-string--e-string--d-string--s-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx commerce:payments:quickstart:setup [-p <string>] [-s <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercepaymentsquickstartsetup--p-string--s-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx commerce:products:import [-c <string>] [-f <filepath>] [-d <string>] [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commerceproductsimport--c-string--f-filepath--d-string--s-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx commerce:store:create [name=value...] [-f <filepath>] [-d <string>] [-t <string>] [-b <string>] [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorecreate-namevalue--f-filepath--d-string--t-string--b-string--s-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx commerce:store:quickstart:create [-t <string>] [-s <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorequickstartcreate--t-string--s-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx commerce:store:quickstart:setup [name=value...] [-f <filepath>] [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestorequickstartsetup-namevalue--f-filepath--s-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx commerce:store:view [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestoreview--s-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx commerce:store:view:all [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestoreviewall--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx commerce:store:view:info [-b <string>] [-s <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-commercestoreviewinfo--b-string--s-string--p-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx commerce:examples:convert [-f <filepath>] [-o <string>] [-e <string>] [-d <string>] [-s <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Convert Examples to SFDX

```
USAGE
  $ sfdx commerce:examples:convert [-f <filepath>] [-o <string>] [-e <string>] [-d <string>] [-s <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --type=b2c|b2b                                                                [default: b2c] The type of store you
                                                                                    want to create

  -e, --convert=convert                                                             Files to convert

  -f, --definitionfile=definitionfile                                               [default:
                                                                                    /Users/jarndt/.commerce/config/store
                                                                                    -scratch-def.json] config file

  -o, --outputdir=outputdir                                                         [default:
                                                                                    /Users/jarndt/.commerce/force-app]
                                                                                    Directory to output the conversion

  -s, --store-name=store-name                                                       [default: 1commerce] name of the
                                                                                    site to create

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sfdx commerce:examples:convert -f store-scratch-def.json
```

## `sfdx commerce:payments:quickstart:setup [-p <string>] [-s <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

This script will set up all the required parts for using a new Payment Gateway

```
USAGE
  $ sfdx commerce:payments:quickstart:setup [-p <string>] [-s <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -p, --payment-adapter=payment-adapter                                             [default: Stripe] Payment Adapter

  -s, --store-name=store-name                                                       [default: 1commerce] name of the
                                                                                    site to create

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  sfdx commerce:payments:quickstart:setup --configuration devhub-configuration.json
```

## `sfdx commerce:products:import [-c <string>] [-f <filepath>] [-d <string>] [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Amend files needed to fill out Product data and import Products and related data to make store functional

```
USAGE
  $ sfdx commerce:products:import [-c <string>] [-f <filepath>] [-d <string>] [-s <string>] [-v <string>] [-u <string>] 
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --products-file-csv=products-file-csv
      [default: /Users/jarndt/.commerce/examples/csv/Alpine-small.csv] The csv file containing products to import.  Pass 
      in empty value to do product-less import

  -d, --type=b2c|b2b
      [default: b2c] The type of store you want to create

  -f, --definitionfile=definitionfile
      [default: /Users/jarndt/.commerce/config/store-scratch-def.json] config file

  -s, --store-name=store-name
      [default: 1commerce] name of the site to create

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

## `sfdx commerce:store:create [name=value...] [-f <filepath>] [-d <string>] [-t <string>] [-b <string>] [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Create a store

```
USAGE
  $ sfdx commerce:store:create [name=value...] [-f <filepath>] [-d <string>] [-t <string>] [-b <string>] [-s <string>] 
  [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buyer-username=buyer-username                                               [default: buyer@1commerce.com]
                                                                                    buyer's username

  -d, --type=b2c|b2b                                                                [default: b2c] The type of store you
                                                                                    want to create

  -f, --definitionfile=definitionfile                                               [default:
                                                                                    /Users/jarndt/.commerce/config/store
                                                                                    -scratch-def.json] config file

  -s, --store-name=store-name                                                       [default: 1commerce] name of the
                                                                                    site to create

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
  sfdx commerce:store:create --configuration devhub-configuration.json
```

## `sfdx commerce:store:quickstart:create [-t <string>] [-s <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Quickstart various create store

```
USAGE
  $ sfdx commerce:store:quickstart:create [-t <string>] [-s <string>] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --store-name=store-name                                                       [default: 1commerce] name of the
                                                                                    site to create

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
  sfdx commerce:store:quickstart:create
```

## `sfdx commerce:store:quickstart:setup [name=value...] [-f <filepath>] [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Quickstart various store setup

```
USAGE
  $ sfdx commerce:store:quickstart:setup [name=value...] [-f <filepath>] [-s <string>] [-v <string>] [-u <string>] 
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --definitionfile=definitionfile                                               [default:
                                                                                    /Users/jarndt/.commerce/config/store
                                                                                    -scratch-def.json] config file

  -s, --store-name=store-name                                                       [default: 1commerce] name of the
                                                                                    site to create

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
  sfdx commerce:store:quickstart:setup --configuration devhub-configuration.json
```

## `sfdx commerce:store:view [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

View Store

```
USAGE
  $ sfdx commerce:store:view [-s <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --store-name=store-name                                                       [default: 1commerce] name of the
                                                                                    site to create

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
  sfdx commerce:store:view
```

## `sfdx commerce:store:view:all [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

View all stores

```
USAGE
  $ sfdx commerce:store:view:all [-u <string>] [--apiversion <string>] [--json] [--loglevel 
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
  sfdx commerce:store:view:all
```

## `sfdx commerce:store:view:info [-b <string>] [-s <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Get store view info

```
USAGE
  $ sfdx commerce:store:view:info [-b <string>] [-s <string>] [-p <string>] [-v <string>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buyer-username=buyer-username                                               [default: buyer@1commerce.com]
                                                                                    buyer's username

  -p, --urlpathprefix=urlpathprefix                                                 required if different from
                                                                                    store-name URL to append to the
                                                                                    domain created when Experiences was
                                                                                    enabled for this org

  -s, --store-name=store-name                                                       [default: 1commerce] name of the
                                                                                    site to create

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
  sfdx commerce:store:view:info --configuration devhub-configuration.json
```
<!-- commandsstop -->
<!-- debugging-your-plugin -->

# Debugging your plugin

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command:

1. Start the inspector

If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch:

```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```

Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program.
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
   <br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
   Congrats, you are debugging!
