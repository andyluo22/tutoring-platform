# app/config.py
from pydantic import PostgresDsn, ConfigDict, BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: PostgresDsn 
    # Add other settings here (E.g SECRET_KEY)

    model_config = ConfigDict(env_file=".env")
    
settings = Settings()