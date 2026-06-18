from database import SessionLocal
from models import AnalysisHistory

db = SessionLocal()

history = db.query(AnalysisHistory).all()

for item in history:
    print(
        item.id,
        item.filename,
        item.analysis_type
    )