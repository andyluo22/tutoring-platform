import os
import sys
import asyncio

# 1) Ensure your project root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

# 2) Import your MetaData and settings
from app.database import Base
import app.models      # noqa: F401  – ensures all models are registered
from app.config import settings

# 3) Tell Alembic which MetaData to diff against
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Emit SQL scripts (no DB connection)."""
    url = str(settings.DATABASE_URL)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """Sync function to run migrations via run_sync()."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against the live database using an async engine."""
    engine = create_async_engine(
        str(settings.DATABASE_URL),
        poolclass=pool.NullPool,
    )

    async def _runner():
        async with engine.connect() as conn:
            # run the sync migrations function in the async context
            await conn.run_sync(do_run_migrations)

    asyncio.run(_runner())


# 4) Choose offline vs online mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

