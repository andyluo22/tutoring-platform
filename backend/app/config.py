# app/config.py
from pydantic import PostgresDsn, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: PostgresDsn 
    FRONTEND_URL: str
    STRIPE_API_KEY: str
    STRIPE_WEBHOOK_SECRET: str

    model_config = ConfigDict(env_file=".env")
    
settings = Settings()