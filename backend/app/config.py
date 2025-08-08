# app/config.py
from pydantic import PostgresDsn, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: PostgresDsn
    FRONTEND_URL: str
    STRIPE_API_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    PRICE_PER_HOUR_CENTS: int = 3000

    # for ad-hoc sessions created by the webhook
    DEFAULT_TUTOR_ID: int = 1
    DEFAULT_ZOOM_LINK: str | None = None
    DEFAULT_DISCORD_INVITE: str | None = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()