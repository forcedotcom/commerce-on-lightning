import { LightningElement, wire, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import communityId from '@salesforce/community/Id';

// The Apex method will allow us to retrieve the items
import getNavItems from '@salesforce/apex/NavigationItemsService.getConnectNavigationItems';

const STANDARD_WEBPAGE = 'standard__webPage';
const HORIZONTAL = 'horizontal';
const VERTICAL = 'vertical';
const RESIZE = 'resize';
export const MAX_DEPTH = 3;
export default class NavigationMenu extends NavigationMixin(LightningElement) {
    _menuItemsMap = {};

    /**
     * the PageReference object used by lightning/navigation
     */
    pageReference;

    @api
    navigationLinkSetDevName;

    @api
    showHomeLink;

    renderedCallback() {
        this.computeOrientation();
        window.addEventListener(RESIZE, () => {
            this.handleResize();
        });
    }

    @track
    state = {
        orientation: HORIZONTAL,
        menuItems: [],
        isVerticalMenuShown: false,
    };

    /**
     * Determines if the navigation bar should be laid our horizontally or vertically.
     *
     * @type {Boolean}
     */
    get isHorizontalOrientation() {
        return this.state.orientation === HORIZONTAL;
    }

    handleResize() {
        this.computeOrientation();
    }

    computeOrientation() {
        const isDesktop = window.matchMedia('(min-width: 48rem)').matches;
        this.state.orientation = isDesktop ? HORIZONTAL : VERTICAL;
        this.state.showMobileTrigger = !isDesktop;
    }

    @wire(getNavItems, {
        communityId: communityId,
        navigationLinkSetDeveloperName: '$navigationLinkSetDevName',
        showHomeLink: '$showHomeLink',
    })
    wiredNavigationItems({ error, data }) {
        if (data && data.menuItems) {
            // Create a copy of the data to modify it
            this.state.menuItems = data.menuItems.reduce((menuItems, menuItem, index) => {
                let currItem = {
                    ...menuItem,
                    id: index,
                    level: 0,
                    subMenu:
                        menuItem.subMenu && menuItem.subMenu.length
                            ? this.expandSubMenu({
                                  ...menuItem,
                                  id: index,
                                  level: 0,
                              })
                            : [],
                };
                menuItems.push(currItem);
                this._menuItemsMap[currItem.id] = currItem;
                return menuItems;
            }, []);
        }
    }

    expandSubMenu(item) {
        const allCategoryMenuItem = {
            id: `${item.id}_0`,
            label: `All ${item.label}`,
            level: item.level + 1,
            actionType: item.actionType,
            actionValue: item.actionValue,
            href: item.actionValue,
            subMenu: [],
        };
        this._menuItemsMap[allCategoryMenuItem.id] = allCategoryMenuItem;

        item.subMenu = (item.subMenu || []).reduce(
            (result, entry, inx) => {
                const newEntry = {
                    ...entry,
                    id: `${item.id}_${inx + 1}`,
                    level: item.level + 1,
                    href: entry.actionValue,
                };

                // push item to the menuItems in tree structure and add it to menuItemsMap flat array
                result.push(newEntry);
                this._menuItemsMap[newEntry.id] = newEntry;

                if (newEntry.subMenu && newEntry.subMenu.length && item.level < MAX_DEPTH) {
                    this.expandSubMenu(newEntry);
                }

                return result;
            },
            [allCategoryMenuItem]
        );
        return item.subMenu;
    }

    /**
     * Determines if the mobile trigger to hide/show the navigation should be shown or not.
     *
     * @type {Boolean}
     */
    get shouldShowMobileTrigger() {
        return !this.isHorizontalOrientation;
    }

    /**
     * Handle the click event on list item in the list.
     */
    handleNavigationTriggerClicked() {
        this.state.isVerticalMenuShown = !this.state.isVerticalMenuShown;
    }

    /**
     * Handles when the navigation list is closed.
     */
    handleNavigationListClosed() {
        this.state.isVerticalMenuShown = false;
    }

    handleNavigateToPage(event) {
        let menuItemId = event.detail.menuItemId;
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
