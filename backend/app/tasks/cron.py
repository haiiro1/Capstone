import logging
import os
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, and_, or_, cast, Date
from fastapi_mail import FastMail, MessageSchema, MessageType

from app.db.session import SessionLocal
from app.db.models import PurchaseOrder, Subscription, User
from app.core.config import settings
from app.api.routers.mail import conf

FRONTEND_URL = os.getenv("VITE_FRONTEND_URL")
logger = logging.getLogger("uvicorn")


async def send_email_notification(email: str, subject: str, html_body: str):
    try:
        fm = FastMail(conf)
        message = MessageSchema(
            subject=subject,
            recipients=[email],
            body=html_body,
            subtype=MessageType.html,
        )
        await fm.send_message(message)
    except Exception as e:
        logger.error(f"CRON EMAIL ERROR to {email}: {e}")


async def cleanup_pending_orders():
    """
    Scheduled cleanup of pending orders.
    """
    logger.info("CRON: Checking for stale pending orders...")
    now = datetime.now(timezone.utc)
    limit_time = now - timedelta(minutes=15)

    with SessionLocal() as db:
        stale_orders = (
            db.execute(
                select(PurchaseOrder).where(
                    and_(
                        PurchaseOrder.status == "pending",
                        or_(
                            PurchaseOrder.token_ts < limit_time,
                            and_(
                                PurchaseOrder.token_ts.is_(None),
                                PurchaseOrder.created_at < limit_time,
                            ),
                        ),
                    )
                )
            )
            .scalars()
            .all()
        )

        if stale_orders:
            for order in stale_orders:
                order.status = "expired"

            db.commit()
            logger.info(f"CRON: Marked {len(stale_orders)} orders as expired.")
        else:
            logger.info("CRON: No stale orders found.")


async def check_expired_subscriptions():
    """
    Checks if any of the existing active subscriptions are past the expiry_date,
    if so, they are set as inactive and a mail is sent.
    """
    logger.info("CRON: Checking for expired subscriptions...")
    today = datetime.now(timezone.utc).date()

    with SessionLocal() as db:
        expired_subs = (
            db.execute(
                select(Subscription).where(
                    and_(
                        Subscription.is_active == True,
                        cast(Subscription.expiry_date, Date) <= today,
                    )
                )
            )
            .scalars()
            .all()
        )

        count = 0
        for sub in expired_subs:
            user = db.get(User, sub.user_id)
            sub.is_active = False
            count += 1

            if user:
                html_content = f"""
                <div style="font-family:system-ui; margin:0px auto;max-width:600px;">
                    <h1 style="text-align:center">
                        <a href="https://capstone-nu-cyan.vercel.app/" target="_blank" style="text-decoration:none; color: #15c;">🌱 PlantGuard</a>
                    </h1>
                    <h2>Hola, {user.first_name}!</h2>
                    <p>Tu suscripción a <strong>PlantGuard Premium</strong> ha expirado hoy.</p>
                    <p>Muchas gracias por subscribirte a nuestro servicio, tu cuenta ha vuelto al plan gratuito.</p>
                    <p>Si deseas reactivar tus beneficios, puedes hacerlo aquí:</p>
                    <a href="{FRONTEND_URL}/membresia" target="_blank" style="text-decoration:none; margin-left:2em; color: #15c;">
                        <span class="il"><span class="il">Renueva</span></span> tu suscripción!
                    </a>
                    <p style="color: #9192a7; font-size: 12px; font-style: italic;">
                    Has recibido este correo porque tu suscripción ha expirado.
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
                await send_email_notification(
                    email=user.email,
                    subject="Tu suscripción ha finalizado",
                    html_body=html_content,
                )

        if count > 0:
            db.commit()
            logger.info(f"CRON: Deactivated {count} expired subscriptions.")

        else:
            logger.info("CRON: No expired subscriptions found.")
