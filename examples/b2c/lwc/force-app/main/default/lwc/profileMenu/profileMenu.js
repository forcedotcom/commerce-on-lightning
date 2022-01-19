import { LightningElement, wire, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getSessionContext, getAppContext } from 'commerce/contextApi';
import communityId from '@salesforce/community/Id';
import basePath from '@salesforce/community/basePath';

// The Apex method will allow us to retrieve the items
import getNavItems from '@salesforce/apex/NavigationItemsService.getConnectNavigationItems';

const STANDARD_WEBPAGE = 'standard__webPage';
const LOGIN_URL_PATH = '/login';

import USER_FULL_NAME_FIELD from '@salesforce/schema/User.Name';
import USER_FIRST_NAME_FIELD from '@salesforce/schema/User.FirstName';
import USER_LAST_NAME_FIELD from '@salesforce/schema/User.LastName';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';

export default class ProfileMenu extends NavigationMixin(LightningElement) {
    @api
    navigationLinkSetDevName;

    @api
    loggedInUserIconName = 'action:user';

    @api
    guestUserIconName = 'action:user';

    @api
    guestUserLoginPrompt = 'Login';

    @api
    showFirstName;

    @api
    showLastName;

    @track
    state = {
        menuItems: [],
    };

    @track
    sessionContext;

    @track
    appContext;

    _menuItemsMap = {};
    pageReference;

    connectedCallback() {
        getSessionContext()
            .then((context) => {
                this.sessionContext = context;
            })
            .catch((error) => {
                console.log(error);
            });

        getAppContext()
            .then((context) => {
                this.appContext = context;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    @wire(getRecord, {
        recordId: '$sessionContext.userId',
        fields: [USER_FULL_NAME_FIELD, USER_FIRST_NAME_FIELD, USER_LAST_NAME_FIELD],
    })
    userRecord;

    @wire(getNavItems, {
        communityId: communityId,
        navigationLinkSetDeveloperName: '$navigationLinkSetDevName',
        showHomeLink: false,
    })
    wiredNavigationItems({ error, data }) {
        if (data && data.menuItems) {
            // Create a copy of the data to modify it
            this.state.menuItems = data.menuItems.reduce((menuItems, menuItem, index) => {
                let currItem = {
                    ...menuItem,
                    id: index,
                };
                // Remove any submenus.
                delete currItem.subMenu;
                menuItems.push(currItem);
                this._menuItemsMap[currItem.id] = currItem;
                return menuItems;
            }, []);
        }
    }
    get userName() {
        if (this.showFirstName && this.showLastName) {
            return getFieldValue(this.userRecord.data, USER_FULL_NAME_FIELD);
        } else if (this.showFirstName) {
            return getFieldValue(this.userRecord.data, USER_FIRST_NAME_FIELD);
        } else if (this.showLastName) {
            return getFieldValue(this.userRecord.data, USER_LAST_NAME_FIELD);
        }
    }

    navigateToRoute(event) {
        let menuItemId = event.detail.value;
        let menuItem = this._menuItemsMap[menuItemId];
        if (!menuItem) {
            return;
        }

        let actionType = menuItem.actionType;

        if (actionType === 'Event' && menuItem.actionValue === 'force:logout') {
            window.location.href = this.appContext.baseUrl + this.appContext.logoutUrl.replace('/', '');
        } else {
            this.pageReference = {
                type: STANDARD_WEBPAGE,
                attributes: {
                    url: menuItem.actionValue,
                },
            };
        }
        // use the NavigationMixin from lightning/navigation to navigate to the page reference.
        if (this.pageReference) {
            this[NavigationMixin.Navigate](this.pageReference);
        }
    }

    navigateToLogin() {
        this.pageReference = {
            type: STANDARD_WEBPAGE,
            attributes: {
                url: basePath + LOGIN_URL_PATH,
            },
        };
        if (this.pageReference) {
            this[NavigationMixin.Navigate](this.pageReference);
        }
    }
}
