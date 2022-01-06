import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import { CartSummaryAdapter } from 'commerce/cartApi';

const STANDARD_WEBPAGE = 'standard__webPage';
const ENTER_KEY = 'Enter';
const CART_PAGE = '/cart';
const MAX_CART_ITEMS = 99;
const PLUS_SIGN = '+';
export default class CartBadge extends NavigationMixin(LightningElement) {
    iconAssistiveText = 'cart';
    badgeItemsCount = 0;
    pageReference;
    cartURL = basePath + CART_PAGE;

    @wire(CartSummaryAdapter)
    cartSummaryHandler(response) {
        if (response.data) {
            this.badgeItemsCount = parseInt(response.data.totalProductCount, 10);
            if (this.badgeItemsCount > MAX_CART_ITEMS) {
                this.badgeItemsCount = MAX_CART_ITEMS + PLUS_SIGN;
            }
        } else if (response.error) {
            this.badgeItemsCount = 0;
        }
    }

    navigateToCart(event) {
        event.preventDefault();
        this.pageReference = {
            type: STANDARD_WEBPAGE,
            attributes: {
                url: this.cartURL,
            },
        };
        if (this.pageReference) {
            this[NavigationMixin.Navigate](this.pageReference);
        }
    }

    navigateToCartKeyDown(event) {
        switch (event.key) {
            case ENTER_KEY:
                this.navigateToCart(event);
                break;
            default:
                break;
        }
    }
}
