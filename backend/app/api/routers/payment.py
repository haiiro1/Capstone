import sqlalchemy as sa
from datetime import datetime, timezone
from decimal import Decimal
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from starlette.responses import JSONResponse
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from sqlalchemy.orm import Session

from app.api.routers.mail import conf
from app.schemas.payment import PurchaseCreateResponse, PurchaseInitResponse
from app.db.models import PurchaseOrder, User, Subscription
from app.api.routers.auth import get_current_user, get_db
from app.api.services.tbk import create_tx, update_status
from app.utils.utils import activate_subscription

router = APIRouter(prefix="/transaction", tags=["payment"])


@router.post("/start", response_model=PurchaseInitResponse)
async def create_transaction(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = PurchaseOrder(
        user_id=user.id,
        amount=Decimal("9990.00"),
        token_ts=datetime.now(timezone.utc),
    )
    db.add(order)
    db.flush()
    result = create_tx(order, request)
    if not result or "url" not in result:
        raise HTTPException(status_code=500, detail="webpay_resp_missing")
    order.payment_url = result['url']
    order.token = result['token']
    db.commit()
    db.refresh(order)
    return {"payment_url": order.payment_url, "token": order.token}


@router.get("/return/{order_id}", name="transaction_return")
async def transaction_return(
    order_id: int,
    token_ws: str,
    db: Session = Depends(get_db),
):
    order = db.get(PurchaseOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="order_not_found")

    if order.status not in ("pending", "processing"):
        return {"message": f"La orden ya fue procesada ({order.status})."}

    try:
        result = update_status(token_ws)
        if not result:
            raise HTTPException(status_code=400, detail="tbk_result_missing")

        order.tbk_metadata = result
        order.token = token_ws
        if (
            result.get("response_code") == 0
            and result.get("status") == "AUTHORIZED"
        ):
            order.status = "paid"
            activate_subscription(db, order.user_id, order)
            message = "Tu suscripción ha sido activada."

        elif result.get("status") == "FAILED":
            order.status = "failed"
            message = "La transacción no fue autorizada."

        elif result.get("status") == "REVERSED":
            order.status = "refunded"
            message = "La transacción fue reversada."

        else:
            order.status = "failed"
            message = "La transacción no fue autorizada."

        db.refresh(order)
        if order.status == "paid":
            user = db.get(User, order.user_id)
            sub = db.execute(
                sa.select(Subscription).where(Subscription.user_id == order.user_id)
            )
            sub = sub.scalar_one_or_none()

            if user and sub:
                html = f"""
                    <div style="font-family:system-ui; margin:0px auto;max-width:600px;">
                        <h1 style="text-align:center">
                            <a href="https://capstone-git-main-haiiro1s-projects.vercel.app/" target="_blank" style="text-decoration:none; color: #15c;">🌱 PlantGuard</a>
                        </h1>
                        <h2>Hola, {user.first_name}!</h2>
                        <p>Bienvenid@ a PlantGuard Premium!</p>
                        <p>Muchas gracias por subscribirte a nuestro servicio, recuerda que tu plan te permite utilizar nuestro modelo PlantSafe de manera ilimitada!</p>
                        <p style="font-size: 12px;">Tu plan expirara el {sub.expiry_date}</p>
                        <p style="color: #9192a7; font-size: 12px; font-style: italic;">
                        Has recibido este correo porque te has suscrito a PlantGuard Premium.
                        </p>
                        <div style="text-align:center">
                            <hr>
                            <p style="font-size:12px; color: #15c;">
                                <a href="https://capstone-git-main-haiiro1s-projects.vercel.app/" style="text-decoration:none;" target="_blank">🌱</a>
                                <a href="https://capstone-git-main-haiiro1s-projects.vercel.app/" target="_blank">PlantGuard</a> /
                                <a href="https://capstone-git-main-haiiro1s-projects.vercel.app/privacidad" target="_blank">Privacidad</a> /
                                <a href="https://capstone-git-main-haiiro1s-projects.vercel.app/help" target="_blank">Contacto</a>
                            </p>
                        </div>
                    </div>
                """
                fm = FastMail(conf)
                message = MessageSchema(
                    subject="Bienvenido a PlantGuard Premium",
                    recipients=[user.email],
                    body=html,
                    subtype=MessageType.html,
                )
                await fm.send_message(message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el pago: {e}")

    db.refresh(order)

    return {
        "message": message,
        "status": order.status,
        "order_id": str(order.id),
        "metadata": order.tbk_metadata,
    }


@router.get("/status/{order_id}")
async def get_transaction_status(order_id: int, db: Session = Depends(get_db)):
    order = db.query(PurchaseOrder).filter_by(id=order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="order_not_found")

    if order.can_update_payment():
        order.update_status(order.token, as_get=True)
        db.commit()

    return {
        "status": order.status,
        "metadata": order.tbk_metadata,
    }
