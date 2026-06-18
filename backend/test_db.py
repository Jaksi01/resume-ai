from database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Connected:", result.scalar())
except Exception as e:
    print("Error:", e)

from database import SessionLocal
from models import User

db = SessionLocal()

users = db.query(User).all()

for user in users:
    print(user.id, user.username, user.email)

from sqlalchemy import text
from database import engine

with engine.connect() as conn:
    result = conn.execute(
        text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        """)
    )

    for row in result:
        print(row[0])