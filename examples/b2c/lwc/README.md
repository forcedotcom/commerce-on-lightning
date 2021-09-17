# B2B2C Advanced Reference Components

We provide this collection of Lightning Web Components (LWCs) as examples of configured B2B2C core components. Use these structures and behaviors to guide your own creation of custom B2B2C components that leverage existing platform features and APIs.

This repository is an SFDX project that you can deploy directly to an org and modify.

## Getting Started

### SFDX Setup

1. Before continuing with the steps below, see [Salesforce DX Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm) to setup SFDX.

## Setup

1. If you haven't already, clone this repository.
1. If you haven't already, create a B2B2C Commerce org.
   Optional: Use the included [project-scratch-def.json](config/project-scratch-def.json), e.g. `sfdx force:org:create -f ./config/project-scratch-def.json`
1. Push the source code in this repository to the new org, e.g. `sfdx force:source:push -u <org username>`.
1. Grant permissions to the APEX class (do this only once):

    1. Login to the org, e.g., `sfdx force:org:open -u <org username>`.
    1. Go to Setup -> Custom Code -> APEX Classes.
    1. On the `NavigationItemsService` class, click "Security".
    1. Assign the buyer user profile(s) or other user profiles that will use your components.
    1. Click Save.

## Usage

1. Create a B2C Commerce store.
1. Go to the Commerce app, and select the store.
1. Open Experience Builder.
1. Open the Home page's settings by clicking on the gear Icon in the top nav bar.
1. Scroll down under the Properties window and check the `Override the default theme layout for this page.`.
1. Choose `Custom Commerce Layout` from the `Theme Layout` dropdown list.
1. Open the Builder component palette and add the `Custom Commerce Header` and `Custom Commerce Footer` to the page.
1. Drag and drop the relevant components into the different slots of the custom header and footer components.
1. Publish the store.
