from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
from sqlalchemy.orm import sessionmaker
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

try:
    with engine.connect() as conn:
        print("Database connected successfully!")
except Exception as e:
    print("Connection failed:", e)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)