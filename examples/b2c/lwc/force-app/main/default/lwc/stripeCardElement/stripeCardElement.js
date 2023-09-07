import { LightningElement, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';

import { paymentClientRequest } from 'commerce/checkoutApi';

import locale from '@salesforce/i18n/locale';

const cardStyle = {
    base: {
        color: '#888888',
    },
};

const IS_PRODUCTION = true; // TODO: detect mode
const NO_ERROR = '\u200b';

/**
 * Sample Stripe client-side component, copy of the sfdx-stripe component, included here for:
 * - to allow trying client-side in off-core mode
 * - used in-core until webruntime allows unused dynamic imports of non-existing components
 */
export default class StripeCardElement extends LightningElement {
    stripe;
    card;
    _billingAddress;

    error = NO_ERROR;

    _initialized;
    _isValid = false;
    _card_confirmed_status = ['succeeded', 'requires_capture'];

    @api
    async initialize(clientConfiguration, webstoreId) {
        this.webstoreId = webstoreId;
        // webstoreId is not set in renderedCallback, get clientConfig here instead
        this.clientConfiguration = clientConfiguration;

        await loadScript(this, 'https://js.stripe.com/v3/');

        // eslint-disable-next-line no-undef
        this.stripe = Stripe(this.clientConfiguration.publishableAPIKey, {
            locale,
        });
        await this.setupCardElement();
        this._initialized = true;
    }

    setupCardElement() {
        const elements = this.stripe.elements();

        // create+mount card element
        const cardElement = this.template.querySelector('.stripe-card-element');
        this.card = elements.create('card', { style: cardStyle, hidePostalCode: true });
        this.card.mount(cardElement);

        // show card validation errors
        this.card.on('change', (event) => {
            this.error = event.error ? event.error.message : NO_ERROR;
            this._isValid = !event.error;
        });
    }

    @api
    async completePayment(billingAddress) {
        const paymentIntent = await paymentClientRequest();

        if (this._card_confirmed_status.includes(paymentIntent.paymentData.status)) {
            return {
                responseCode: paymentIntent.paymentData.id,
            };
        }

        // https://stripe.com/docs/js/payment_intents/confirm_card_payment
        const request = {
            payment_method: {
                card: this.card,
                billing_details: {
                    address: {
                        country: billingAddress.country,
                        city: billingAddress.city,
                        state: billingAddress.region,
                        postal_code: billingAddress.postalCode,
                        line1: billingAddress.street,
                    },
                },
            },
        };
        if (billingAddress.name) {
            request.payment_method.billing_details.name = billingAddress.name;
        }

        const result = await this.stripe.confirmCardPayment(paymentIntent.paymentData.client_secret, request);

        if (result.error) {
            console.error('payment failed', result.error);
            return {
                error: {
                    code: result.error.decline_code ? result.error.decline_code : result.error.code,
                    message: result.error.message,
                },
            };
        }

        return {
            responseCode: result.paymentIntent.id,
        };
    }

    @api
    reportValidity() {
        return this._isValid;
    }

    @api
    focus() {
        if (this.card && this.card.focus) {
            this.card.focus();
        }
    }

    get showTestCards() {
        return !IS_PRODUCTION;
    }
}
