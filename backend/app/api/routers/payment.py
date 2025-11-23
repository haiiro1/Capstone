import os
import sqlalchemy as sa
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, Query, Request
from fastapi_mail import FastMail, MessageSchema, MessageType
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.routers.mail import conf
from app.schemas.payment import PurchaseInitResponse
from app.db.models import PurchaseOrder, User, Subscription
from app.api.routers.auth import get_current_user, get_db
from app.api.services.tbk import create_tx, update_status
from app.utils.utils import activate_subscription


FRONTEND_URL = os.getenv("VITE_FRONTEND_URL")

router = APIRouter(prefix="/transaction", tags=["payment"])


async def send_welcome_email(email: str, name: str, expiry_date: str):
    try:
        html = f"""
        <div style="font-family:system-ui; margin:0px auto;max-width:600px;">
            <h1 style="text-align:center">
                <a href="https://capstone-nu-cyan.vercel.app/" target="_blank" style="text-decoration:none; color: #15c;">🌱 PlantGuard</a>
            </h1>
            <h2>Hola, {name}!</h2>
            <p>Bienvenid@ a PlantGuard Premium!</p>
            <p>Muchas gracias por subscribirte a nuestro servicio, recuerda que tu plan te permite utilizar nuestro modelo PlantSafe de manera ilimitada!</p>
            <p style="font-size: 12px;">Tu plan expirara el {expiry_date}</p>
            <p style="color: #9192a7; font-size: 12px; font-style: italic;">
            Has recibido este correo porque te has suscrito a PlantGuard Premium.
            </p>
            <div style="text-align:center">
                <hr>
                <p style="font-size:12px; color: #15c;">
                    <a href="https://capstone-nu-cyan.vercel.app/" style="text-decoration:none;" target="_blank">🌱</a>
                    <a href="https://capstone-nu-cyan.vercel.app/" target="_blank">PlantGuard</a> /
                    <a href="https://capstone-nu-cyan.vercel.app/privacidad" target="_blank">Privacidad</a> /
                    <a href="https://capstone-nu-cyan.vercel.app/help" target="_blank">Contacto</a>
                </p>
            </div>
        </div>
        """
        fm = FastMail(conf)
        message = MessageSchema(
            subject="Bienvenido a PlantGuard Premium",
            recipients=[email],
            body=html,
            subtype=MessageType.html,
        )
        await fm.send_message(message)
    except Exception as e:
        print(f"Error sending email: {e}")


@router.post("/start", response_model=PurchaseInitResponse)
async def create_transaction(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    existing_sub = (
        db.execute(sa.select(Subscription).where(Subscription.user_id == user.id))
        .scalars()
        .first()
    )

    if existing_sub and existing_sub.is_active:
        if existing_sub.expiry_date > now:
            raise HTTPException(status_code=400, detail="active_subscription_exists")

    pending_order = (
        db.execute(
            sa.select(PurchaseOrder).where(
                sa.and_(
                    PurchaseOrder.user_id == user.id, PurchaseOrder.status == "pending"
                )
            )
        )
        .scalars()
        .first()
    )
    if pending_order:
        pending_order.status = "expired"
        db.add(pending_order)
        db.flush()

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
    background_tasks: BackgroundTasks,
    token_ws: str | None = Query(None),
    tbk_token: str | None = Query(None, alias="TBK_TOKEN"),
    tbk_orden_compra: str | None = Query(None, alias="TBK_ORDEN_COMPRA"),
    tbk_id_sesion: str | None = Query(None, alias="TBK_ID_SESION"),
    db: Session = Depends(get_db),
):
    order = db.get(PurchaseOrder, order_id)
    if not order:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/membresia/estado?status=failed", status_code=303
        )

    if tbk_token and not token_ws:
        order.status = "failed"
        db.commit()
        return RedirectResponse(
            url=f"{FRONTEND_URL}/membresia/estado?status=failed&order_id={order.id}",
            status_code=303,
        )

    if token_ws:
        if order.status not in ("pending", "processing"):
            return RedirectResponse(
                url=f"{FRONTEND_URL}/membresia/estado?status={order.status}&order_id={order.id}",
                status_code=303,
            )
        try:
            result = update_status(token_ws)
            if not result:
                return RedirectResponse(
                    url=f"{FRONTEND_URL}/membresia/estado?status=failed",
                    status_code=303,
                )

            order.tbk_metadata = result
            order.token = token_ws
            if (
                result.get("response_code") == 0
                and result.get("status") == "AUTHORIZED"
            ):
                order.status = "paid"
                activate_subscription(order.user_id, order, db)
                user = db.get(User, order.user_id)
                sub = (
                    db.execute(
                        sa.select(Subscription).where(
                            Subscription.user_id == order.user_id
                        )
                    )
                    .scalars()
                    .first()
                )

                if user and sub:
                    clean_date = sub.expiry_date.strftime("%Y-%m-%d")
                    background_tasks.add_task(
                        send_welcome_email,
                        user.email,
                        user.first_name,
                        clean_date,
                    )
            else:
                order.status = "failed"

            db.commit()
            db.refresh(order)

        except Exception as e:
            print(f"CRITICAL PAYMENT ERROR: {e}")
            order.status = "failed"
            db.commit()
            return RedirectResponse(
                url=f"{FRONTEND_URL}/membresia/estado?status=failed", status_code=303
            )

        return RedirectResponse(
            url=f"{FRONTEND_URL}/membresia/estado?status={order.status}&order_id={order.id}",
            status_code=303,
        )

    return RedirectResponse(
        url=f"{FRONTEND_URL}/membresia/estado?status=failed", status_code=303
    )


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

