import { getAppContext } from 'commerce/contextApi';

const API_VERSION = 'v54.0';
const CHECKOUT_SESSION_ID_PREFIX = '2z9';
const WEBSTORE_ID_PREFIX = '0ZE';

function buildPaymentRequestBody(requestData) {
    return JSON.stringify({
        requestType: 'ClientRequest',
        paymentsData: JSON.stringify(requestData),
    });
}

function validateWebstoreId(webstoreId) {
    if (typeof webstoreId !== 'string' || !webstoreId.startsWith(WEBSTORE_ID_PREFIX)) {
        throw new TypeError('A valid Webstore ID is required to execute this request.');
    }
}

function validateCheckoutSessionId(activeOrCheckoutSessionId) {
    if (
        typeof activeOrCheckoutSessionId !== 'string' ||
        (activeOrCheckoutSessionId !== 'active' && !activeOrCheckoutSessionId.startsWith(CHECKOUT_SESSION_ID_PREFIX))
    ) {
        throw new TypeError('A valid CheckoutSessionId is required to execute this request.');
    }
}

export function buildPaymentURL(webstoreId, activeOrCheckoutSessionId = 'active', apiVersion) {
    validateCheckoutSessionId(activeOrCheckoutSessionId);
    validateWebstoreId(webstoreId);

    return `/services/data/${apiVersion}/commerce/webstores/${webstoreId}/checkouts/${activeOrCheckoutSessionId}/payments`;
}

export async function executePayment(paymentData = {}, activeOrCheckoutSessionId = 'active') {
    const { webstoreId } = await getAppContext();

    const url = buildPaymentURL(webstoreId, activeOrCheckoutSessionId, API_VERSION);

    return fetch(url, { method: 'POST', body: buildPaymentRequestBody(paymentData) });
}
