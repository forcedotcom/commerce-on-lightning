import { LightningElement, track, api } from 'lwc';

const NAVIGATE_TO_PAGE_EVENT = 'navigatetopage';
const RESIZE_EVENT = 'resize';
const CLICK_EVENT = 'click';
const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';
const ESC_KEY = 'Esc';
const ARIA_CONTROLS = 'aria-controls';

export default class HorizontalNavigation extends LightningElement {
    _overflowMenuItemWidth = 0;
    _isOverflowComputed = false;
    _menuItems;

    @track
    state = {
        items: [], // expected to be always present
    };

    /**
     * A dummy menu item which represents overflow menu item.
     */
    @track
    moreMenuItem = {
        label: 'More',
        href: null,
        subMenu: [],
        id: 20001,
    };

    constructor() {
        super();
        this.onResize = () => {
            this.state.items = this._menuItems.map((i) => this.mapMenuItem(i));
            this._isOverflowComputed = false;
        };

        this.onClick = (event) => {
            // if the event is already handled by this component then do nothing
            if (event.__isHandledByVerticalNavigation) {
                return;
            }
            this.closeSubmenus();
        };
    }

    /**
     * @override This callback is used to compute 'overflow' and see if 'More' option should
     * be shown or not. It is needed to do it here because we are looking at the width occupied
     * by the rendered elements.
     */
    renderedCallback() {
        if (this._isOverflowComputed) {
            return;
        }
        if (!this.isMoreWidthCalculated) {
            this._overflowMenuItemWidth = this.computeMoreMenuItemWidth();
        } else {
            this.handleOverflowIfNeeded();
        }
    }

    connectedCallback() {
        window.addEventListener(RESIZE_EVENT, this.onResize);
        window.addEventListener(CLICK_EVENT, this.onClick);
    }

    disconnectedCallback() {
        window.removeEventListener(RESIZE_EVENT, this.onResize);
        window.removeEventListener(CLICK_EVENT, this.onClick);
    }

    /**
     * Set menuItems for this navigation bar. Following fields are expected in menu items:
     * label, href, subMenu, id.
     */
    @api
    get menuItems() {
        return this._menuItems;
    }

    set menuItems(value) {
        this._menuItems = value; // we do not use _menuItems but we store it to return it from the getter method
        this.state.items = (value || []).map((i) => this.mapMenuItem(i));
    }

    mapMenuItem(item) {
        return {
            label: item.label,
            href: item.actionValue,
            subMenu: item.subMenu || [],
            id: item.id,
            isListShown: false,
            active: item.active,
        };
    }

    /**
     * Determines if this component should be displayed or not.
     *
     * @type {Boolean}
     */
    get showNavigation() {
        return this.state.items.length > 0;
    }

    /**
     * Determines if the width of overflow menu item is calculated or not.
     *
     * @type {Boolean}
     */
    get isMoreWidthCalculated() {
        return this._overflowMenuItemWidth !== 0;
    }

    /**
     * Handle the close submenu event called on the menu item's container element.
     */
    handleCloseSubmenus(event) {
        if (event.detail.refocus) {
            event.currentTarget.querySelector('button').focus();
        }
        this.closeSubmenus();
        event.stopPropagation();
    }

    /**
     * Handles when nav list register event is fired to provide this component with the correct aria control ID
     */
    handleNavListRegister(event) {
        const item = event.detail;
        event.stopPropagation();
        const navButton = event.currentTarget.querySelector('button');
        if (navButton) {
            navButton.setAttribute(ARIA_CONTROLS, item.contentId);
        }
    }

    /**
     * Handle the click event when one of the top level navigation menu items
     * is clicked.
     */
    handleNavigationClicked(event) {
        event.preventDefault();
        const item = this.state.items.find((i) => i.id.toString() === event.currentTarget.dataset.id);
        const isListShownOldValue = item.isListShown;
        if (!Array.isArray(item.subMenu) || item.subMenu.length === 0) {
            this.fireNavigationEvent(event);
        } else {
            this.closeSubmenus(); // hide all the menu list
            item.isListShown = !isListShownOldValue; // show the menu list for the selected item
            event.stopPropagation();
        }
    }

    /**
     * Handles the keydown event on the menu items.
     */
    handleKeydownEvent(event) {
        switch (event.key) {
            case ENTER_KEY:
                // call preventDefault to make sure that the Enter key's default behavior is not executed
                event.preventDefault();
                this.handleNavigationClicked(event);
                break;
            case ESCAPE_KEY:
            case ESC_KEY:
                this.closeSubmenus();
                break;
            default:
                break;
        }
    }

    /**
     * Close all the opened sub menus.
     * @param {string} [excludedId] The optional id of the menu item whose submenu should not be changed.
     *
     * @private
     */
    closeSubmenus(excludedId) {
        this.state.items.forEach((i) => {
            if (!excludedId || excludedId !== i.id.toString()) {
                i.isListShown = false;
            }
        });
    }

    /**
     * Fires the 'navigatetopage' event with itemId as parameter
     */
    fireNavigationEvent(event) {
        const itemId = event.currentTarget.dataset.id;
        this.dispatchEvent(
            new CustomEvent(NAVIGATE_TO_PAGE_EVENT, {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: {
                    menuItemId: itemId,
                },
            })
        );
    }

    /**
     * Use this method to handle overflow, if needed.
     */
    handleOverflowIfNeeded() {
        const itemsBeforeOverflow = this.computeItemsBeforeOverflow();

        if (itemsBeforeOverflow < this.state.items.length) {
            // modify the menu items list such that the overflow items are treated as a submenu of 'More'
            // create a new menu item for 'More'
            const moreMenuItem = {
                label: 'More',
                href: null,
                subMenu: this.state.items.slice(itemsBeforeOverflow, this.state.items.length),
                id: 10001,
                isListShown: false,
                isRightAligned: true,
            };
            const newMenuItems = this.state.items.slice(0, itemsBeforeOverflow);
            newMenuItems.push(moreMenuItem);
            this.state.items = newMenuItems;
        }
        this._isOverflowComputed = true;
    }

    /**
     * Use this method to get the width of the overflow menu item. This method returns 0 if the
     * overflow menu item is not present.
     *
     * @returns {Number} width of the overflow menu item. Returns 0 if the overflow menu item is not present.
     */
    computeMoreMenuItemWidth() {
        return this.template.querySelector('li.dummyMoreItem')
            ? this.template.querySelector('li.dummyMoreItem').clientWidth
            : 0;
    }

    /**
     * Use this method to compute the number of menu items that can be shown in available width
     * without overflowing.
     *
     * @returns {Number} of elements that can be shown without overflowing.
     */
    computeItemsBeforeOverflow() {
        const maxWidth = this.template.querySelector('nav').getBoundingClientRect().width;
        const menuItemElements = this.template.querySelectorAll('li.textMenuItem');

        let sumOfMenuItemElementsWidth = 0;
        for (let i = 0; i < menuItemElements.length; i++) {
            let menuItemElement = menuItemElements[i];

            sumOfMenuItemElementsWidth += menuItemElement.clientWidth;
            if (sumOfMenuItemElementsWidth + this._overflowMenuItemWidth >= maxWidth) {
                const isMoreMenuItemNeeded =
                    i === menuItemElements.length - 1 ? sumOfMenuItemElementsWidth >= maxWidth : true;

                // if the last menu item's width is less than the overflowMenuItemWidth then we collapse
                // that menu item in overflow menu item as well.
                if (isMoreMenuItemNeeded) {
                    return menuItemElement.clientWidth < this._overflowMenuItemWidth && i > 0 ? i - 1 : i;
                }
                return i + 1;
            }
        }
        return menuItemElements.length;
    }
}
