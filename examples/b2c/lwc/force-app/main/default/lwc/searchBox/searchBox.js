import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';

const ENTER_KEY = 'Enter';
const STANDARD_WEBPAGE = 'standard__webPage';
const SEARCH_ICON_PATH = '/_slds/icons/utility-sprite/svg/symbols.svg?#search';
const SEARCH_ENDPOINT = basePath + '/global-search/';
export default class SearchBox extends NavigationMixin(LightningElement) {
    @api
    placeHolderText = 'Default';

    _searchText;
    _pageReference;

    get searchIconPath() {
        return SEARCH_ICON_PATH;
    }

    /**
     * Handles the input text change.
     */
    handleInputChange(event) {
        this._searchText = event.target.value;
    }

    /**
     * Handles search button click.
     */
    handleSearchButtonClick() {
        if (this._searchText && this._searchText.trim().length > 0) {
            this._pageReference = {
                type: STANDARD_WEBPAGE,
                attributes: {
                    url: SEARCH_ENDPOINT + this._searchText,
                },
            };
            this[NavigationMixin.Navigate](this._pageReference);
        }
    }

    /**
     * Handles enter key press on the search button.
     */
    handleSearchButtonKeyDown(event) {
        switch (event.key) {
            case ENTER_KEY:
                // call preventDefault to make sure that the Enter key's default behavior is not executed
                event.preventDefault();
                this.handleSearchButtonClick(event);
                break;
            default:
                break;
        }
    }
}
