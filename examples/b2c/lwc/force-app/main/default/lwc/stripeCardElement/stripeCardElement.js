import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { executePayment } from './executePayment';

const cardStyle = {
    base: {
        color: '#888888',
    },
};

const IS_PRODUCTION = true; // TODO: detect mode
const NO_ERROR = '\u200b';

export function buildSalesforceGatewayLog(request, response, interactionType) {
    if (request && request.payment_method && request.payment_method.card) {
        delete request.payment_method.card;
    }

    const { paymentIntent, error } = response;
    const interactionStatus = error ? 'Failed' : 'Success';
    const description = error ? error.message : paymentIntent ? paymentIntent.message : '';

    return {
        description,
        ...(paymentIntent && { authorizationCode: paymentIntent.id }),
        ...(paymentIntent && { refNumber: paymentIntent.id }),
        interactionType: interactionType,
        interactionStatus,
        request,
        response,
    };
}

/**
 * Sample Stripe client-side component, copy of the sfdx-stripe component, included here for:
 * - to allow trying client-side in off-core mode
 * - used in-core until webruntime allows unused dynamic imports of non-existing components
 */
export default class StripeCardElement extends LightningElement {
    stripe;
    card;
    _billingAddress;

    @track error = NO_ERROR;

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
        this.stripe = Stripe(this.clientConfiguration.publishableAPIKey);
        await this.setupCardElement();
        this._initialized = true;
    }

    async setupCardElement() {
        const elements = this.stripe.elements();

        // create+mount card element
        const cardElement = this.template.querySelector('.stripe-card-element');
        this.card = elements.create('card', { style: cardStyle, hidePostalCode: true });
        this.card.mount(cardElement);

        // show card validation errors
        this.card.on('change', (event) => {
            this.error = event.error ? event.error.message : NO_ERROR;
            this._isValid = !event.error && event.complete;
        });
    }

    @api
    async completePayment(billingAddress) {
        const params = {};
        const paymentIntent = await executePayment(params);

        const gatewaylogs = [buildSalesforceGatewayLog(params, paymentIntent, 'PaymentIntent')];
        if (this._card_confirmed_status.includes(paymentIntent.paymentData.status)) {
            return {
                responseCode: paymentIntent.paymentData.id,
                logs: gatewaylogs,
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

        gatewaylogs.push(buildSalesforceGatewayLog(request, result, 'ConfirmIntent'));

        if (result.error) {
            console.error('payment failed', result.error);
            return {
                error: {
                    code: result.error.decline_code ? result.error.decline_code : result.error.code,
                    message: result.error.message,
                },
                logs: gatewaylogs,
            };
        }

        return {
            responseCode: result.paymentIntent.id,
            logs: gatewaylogs,
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
