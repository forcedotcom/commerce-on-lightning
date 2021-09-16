import {LightningElement, api, track} from 'lwc';
const NAVIGATE_TO_PAGE_EVENT = 'navigatetopage';
const HORIZONTAL = 'horizontal';
const VERTICAL = 'vertical';
const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';
const ESC_KEY = 'Esc';
const NAVIGATION_LIST_CLOSED = 'navigationlistclosed';
const PARENT_MENU_ITEM_CLASS = 'dropDownListParent';
const NAVIGATION_LIST_REGISTER = 'navlistregister';
export default class VerticalNavigation extends LightningElement {
    @api
    listIsShown = false;

    @track
    state = {
        items: [],
        parent: undefined,
        orientation: HORIZONTAL,
        level: undefined,
        customStyles: undefined,
    };

    @api
    showMobileTrigger;

    initialRender = true;
    _orientation;

    // Keep track of states that can be used while drilling in and drilling out the nested levels
    stateStack = [];

    /**
     * @override This callback is used to focus the right element in the new list that is in
     * the current state.
     */
    renderedCallback() {
        if (this.initialRender) {
            const containerElement = this.template.querySelector('ul');
            if (containerElement) {
                const navlistregister = new CustomEvent(NAVIGATION_LIST_REGISTER, {
                    bubbles: true,
                    composed: false,
                    detail: {
                        contentId: containerElement.getAttribute('id'),
                    },
                });
                this.dispatchEvent(navlistregister);
            }
            this.initialRender = false;
        }
    }

    /**
     * Indicates if the component should be right aligned with parent or not.
     *
     * @type {Boolean}
     */
    @api
    isRightAligned;

    /**
     * The menuItems property for this component.
     *
     * @type {object}
     * @property {string} id
     * @property {string} label
     * @property {string} href
     * @property {Array.<this>} subMenu
     */
    @api get menuItems() {
        return this.state.items;
    }

    set menuItems(value) {
        this.state.items = value || [];
    }

    /**
     * This property is used to determine how the navigation menu items will be laid out. Orientation
     * defaults to 'horizontal' if the passed in value is empty or null or invalid. Valid values for this
     * property are: "vertical" and "horizontal".
     *
     * @type {String}
     */
    @api get orientation() {
        return this._orientation;
    }

    set orientation(value) {
        this._orientation = value;
        this.state.orientation = value === VERTICAL ? VERTICAL : HORIZONTAL;
    }

    /**
     * Determines if this component should be displayed or not.
     *
     * @type {Boolean}
     */
    get showNavigationList() {
        return this.state.items.length > 0;
    }

    /**
     * This method is executed when 'close trigger' is clicked.
     */
    handleCloseTriggerClicked() {
        this.fireCloseNavigationListEvent(true);
    }

    /**
     * Handle the click event on parent in the list.
     */
    handleBackButton(event) {
        // pop the last state from the stack
        event.__isHandledByVerticalNavigation = true;
        this.state = this.stateStack.pop();
    }

    /**
     * Handle the click event on list item in the list.
     */
    handleNavigationClicked(event) {
        event.preventDefault();
        const clickedItem = this.state.items.find((i) => i.id.toString() === event.currentTarget.dataset.id);
        event.__isHandledByVerticalNavigation = true;
        if (Array.isArray(clickedItem.subMenu) && clickedItem.subMenu.length) {
            this.stateStack.push({
                items: this.state.items,
                parent: this.state.parent,
                orientation: this.state.orientation,
            });

            this.state.parent = clickedItem;
            this.state.items = clickedItem.subMenu;
            this.state.level = this.state.level + 1;
        } else {
            this.fireNavigationEvent(event);
            this.fireCloseNavigationListEvent(true);
        }
    }

    /**
     * Handles the key down event on the menu items.
     */
    handleKeydownEvent(event) {
        switch (event.key) {
            case ENTER_KEY:
                if (event.currentTarget.classList.contains(PARENT_MENU_ITEM_CLASS)) {
                    this.handleBackButton(event);
                } else {
                    this.handleNavigationClicked(event);
                }
                event.preventDefault();
                break;
            case ESCAPE_KEY:
            case ESC_KEY:
                this.fireCloseNavigationListEvent(true);
                event.preventDefault();
                break;
            default:
                break;
        }
    }

    /**
     * Fires the 'navigationlistclosed' event.
     *
     * @param {Boolean} should the listener refocus on itself or not.
     */
    fireCloseNavigationListEvent(refocus) {
        this.dispatchEvent(
            new CustomEvent(NAVIGATION_LIST_CLOSED, {
                detail: {
                    refocus: refocus,
                },
            })
        );
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
     * Determines if this component instance being rendered in horizontal mode or not.
     */
    get isHorizontalOrientation() {
        return this.state.orientation === HORIZONTAL;
    }

    /**
     * This method returns the css class that should be used to vertically position this component.
     *
     * @type {String}
     */
    get verticalPositionClass() {
        if (this.isHorizontalOrientation) {
            return 'slds-is-absolute';
        }
        return this.showMobileTrigger ? 'verticalPositioning' : 'verticalPositioningWithExternalTrigger';
    }

    /**
     * Get a list of class to apply to the container. This method returns a list of classes by taking the
     * orientation into consideration.
     *
     * @type {String}
     */
    get containerClass() {
        let cssClasses = `slds-m-vertical_small ${this.verticalPositionClass}`;

        if (!this.listIsShown) {
            cssClasses += ' closed';
        }

        return cssClasses;
    }

    get showCloseButton() {
        return this.showMobileTrigger !== true;
    }
}