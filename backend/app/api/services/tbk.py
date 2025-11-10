from fastapi import Request
from transbank.common.integration_api_keys import IntegrationApiKeys
from transbank.common.integration_commerce_codes import IntegrationCommerceCodes
from transbank.common.integration_type import IntegrationType
from transbank.webpay.webpay_plus.transaction import Transaction, WebpayOptions

from app.db.models import PurchaseOrder

ORDER_CODE_PREFIX_DEV = 'pgt-int-'
ORDER_CODE_PREFIX_PROD = 'pgt-order-'

# currently, we will be using the testing commerce code and api key of tbk, until we move into prod.
options = WebpayOptions(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    IntegrationType.TEST,
)

def create_tx(order: PurchaseOrder, request: Request):
    tx = Transaction(options)
    return_url = str(request.url_for('transaction_return', order_id=order.id))
    order_code = f'{ORDER_CODE_PREFIX_DEV}{order.id}'
    session_key = request.cookies.get('session_key', 'default-session-key')
    return tx.create(order_code, session_key, order.amount, return_url)


def update_status(token: str):
    tx = Transaction(options)
    return tx.commit(token)


def get_status(token: str):
    tx = Transaction(options)
    return tx.status(token)
