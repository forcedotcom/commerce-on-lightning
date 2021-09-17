import { LightningElement, api, wire } from 'lwc';
import communityId from '@salesforce/community/Id';
import { NavigationMixin } from 'lightning/navigation';

// The Apex method will allow us to retrieve the items
import getNavItems from '@salesforce/apex/NavigationItemsService.getConnectNavigationItems';

const STANDARD_WEBPAGE = 'standard__webPage';
const INTERNAL_LINK = 'InternalLink';
export default class LinksList extends NavigationMixin(LightningElement) {
    @api
    navigationLinkSetDevName;

    _menuItemsMap = {};

    @api
    menuHeader;

    items;

    @wire(getNavItems, {
        communityId: communityId,
        navigationLinkSetDeveloperName: '$navigationLinkSetDevName',
        showHomeLink: false,
    })
    wiredNavigationItems({ error, data }) {
        if (data && data.menuItems) {
            // Create a copy of the data to modify it
            this.items = data.menuItems.reduce((menuItems, menuItem, index) => {
                let currItem = {
                    ...menuItem,
                    id: index,
                    isExternal: menuItem.actionType !== INTERNAL_LINK,
                };
                // Remove any submenus.
                delete currItem.subMenu;

                // We only want parents with valid routes.
                if (null != currItem.actionValue) {
                    menuItems.push(currItem);
                }

                if (!currItem.isExternal) {
                    this._menuItemsMap[currItem.id] = currItem;
                }
                return menuItems;
            }, []);
        }
    }

    handleNavigateToPage(event) {
        event.preventDefault();
        let menuItemId = event.currentTarget.dataset.id;
        let menuItem = this._menuItemsMap[menuItemId];
        if (!menuItem) {
            return;
        }

        this.pageReference = {
            type: STANDARD_WEBPAGE,
            attributes: {
                url: menuItem.actionValue,
            },
        };
        // use the NavigationMixin from lightning/navigation to navigate to the page reference.
        if (this.pageReference) {
            this[NavigationMixin.Navigate](this.pageReference);
        }
    }
}
