from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from fastapi import FastAPI, HTTPException
from passlib.context import CryptContext
from schemas import RegisterRequest, LoginRequest
import json
from models import AnalysisHistory
from database import SessionLocal

from database import SessionLocal
from models import User
from schemas import RegisterRequest
import os

from fastapi.responses import FileResponse
from fpdf import FPDF
from fastapi import HTTPException
from fpdf import FPDF
from fastapi.responses import FileResponse

# IMPORT AI FILES
from ai.resume_review_ai import analyze_resume_review
from ai.job_match_ai import analyze_job_match

app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# HOME
# =========================
@app.get("/")
def home():
    return {"message": "Backend running"}

# =========================
# PDF TEXT EXTRACTOR
# =========================
def extract_pdf_text(file: UploadFile):

    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as f:
        f.write(file.file.read())

    extracted_text = ""

    with pdfplumber.open(temp_path) as pdf:
        for page in pdf.pages:
            extracted_text += page.extract_text() or ""

    os.remove(temp_path)

    return extracted_text

# =========================
# UPLOAD PDF ONLY
# =========================
@app.post("/upload")
async def upload_resume(
    file: UploadFile = File(...)
):

    extracted_text = extract_pdf_text(file)

    return {
        "filename": file.filename,
        "text": extracted_text[:3000]
    }

# =========================
# RESUME REVIEW
# =========================

@app.post("/resume-review")
async def resume_review(
    file: UploadFile = File(...)
):

    extracted_text = extract_pdf_text(file)

    analysis = analyze_resume_review(
        extracted_text
    )

    db = SessionLocal()

    try:
        history = AnalysisHistory(
            user_id=1,  # sementara hardcode dulu
            analysis_type="resume_review",
            filename=file.filename,
            result=json.dumps(analysis)
        )

        db.add(history)
        db.commit()

    finally:
        db.close()

    return {
        "analysis": analysis
    }

# =========================
# JOB ANALYSIS
# =========================
import json

@app.post("/job-analysis")
async def job_analysis(
    file: UploadFile = File(...),
    role: str = Form("")
):
    extracted_text = extract_pdf_text(file)

    analysis = analyze_job_match(
        extracted_text,
        role
    )

    db = SessionLocal()

    try:
        history = AnalysisHistory(
            user_id=1,  # sementara hardcode dulu
            analysis_type="job_analysis",
            filename=file.filename,
            result=json.dumps(analysis)
        )

        db.add(history)
        db.commit()

        # ambil ID yang baru dibuat
        db.refresh(history)

        return {
            "analysis": analysis,
            "analysis_id": history.id
        }

    finally:
        db.close()

# User registration and authentication
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


@app.post("/register")
def register(data: RegisterRequest):

    # VALIDASI FIELD KOSONG
    if not data.username.strip():
        raise HTTPException(
            status_code=400,
            detail="Username is required"
        )

    if not data.email.strip():
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    if not data.password.strip():
        raise HTTPException(
            status_code=400,
            detail="Password is required"
        )

    db = SessionLocal()

    try:

        existing_user = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        existing_username = (
            db.query(User)
            .filter(User.username == data.username)
            .first()
        )

        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        hashed_password = pwd_context.hash(
            data.password
        )

        user = User(
            username=data.username,
            email=data.email,
            password_hash=hashed_password
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "User registered successfully",
            "user_id": user.id
        }

    finally:
        db.close()
# Login endpoint
@app.post("/login")
def login(data: LoginRequest):

    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        valid_password = pwd_context.verify(
            data.password,
            user.password_hash
        )

        if not valid_password:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        return {
            "message": "Login success",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }

    finally:
        db.close()
 
  # endpoint to get analysis history for a user   
@app.get("/history/{user_id}")
def get_history(user_id: int):

    db = SessionLocal()

    try:
        history = (
            db.query(AnalysisHistory)
            .filter(AnalysisHistory.user_id == user_id)
            .all()
        )

        result = []

        for item in history:
            result.append({
                "id": item.id,
                "filename": item.filename,
                "analysis_type": item.analysis_type
            })

        return result

    finally:
        db.close()
        
# endpoint detail analysis history by analysis_id

@app.get("/history/detail/{analysis_id}")
def get_history_detail(analysis_id: int):

    db = SessionLocal()

    try:
        history = (
            db.query(AnalysisHistory)
            .filter(AnalysisHistory.id == analysis_id)
            .first()
        )

        if not history:
            raise HTTPException(
                status_code=404,
                detail="History not found"
            )

        return {
            "id": history.id,
            "filename": history.filename,
            "analysis_type": history.analysis_type,
            "result": json.loads(history.result)
        }

    finally:
        db.close()

# endpoint to download analysis result as PDF


@app.get("/download/{analysis_id}")
def download_pdf(analysis_id: int):

    db = SessionLocal()

    try:
        history = (
            db.query(AnalysisHistory)
            .filter(AnalysisHistory.id == analysis_id)
            .first()
        )

        if not history:
            raise HTTPException(
                status_code=404,
                detail="History not found"
            )

        pdf = FPDF()
        pdf.add_page()

        pdf.set_font("Helvetica", size=12)

        # Judul
        pdf.cell(
            190,
            10,
            "AI Resume Analyzer Report",
            new_x="LMARGIN",
            new_y="NEXT"
        )

        pdf.ln(5)

        # Informasi file
        pdf.multi_cell(
            190,
            8,
            f"Filename: {history.filename}"
        )

        pdf.multi_cell(
            190,
            8,
            f"Analysis Type: {history.analysis_type}"
        )

        pdf.ln(5)

        # Format hasil analisis agar rapi
        try:
            result_text = json.dumps(
                json.loads(history.result),
                indent=2,
                ensure_ascii=False
            )
        except:
            result_text = str(history.result)

        # Tulis hasil analisis ke PDF
        pdf.multi_cell(
            190,
            8,
            result_text[:5000]
        )

        filename = f"analysis_{analysis_id}.pdf"

        pdf.output(filename)

        return FileResponse(
            path=filename,
            media_type="application/pdf",
            filename=filename
        )

    finally:
        db.close()