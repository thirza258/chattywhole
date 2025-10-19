import PyPDF2
import io
from typing import Optional
import os
from nevatal_settings import settings
from core.apps import rag_index

def strip_authentication_header(header: str) -> str:
    try:
        if header.startswith("Bearer "):
            return header[7:]
        return header
    except Exception as e:
        return header

def extract_text_from_pdf(pdf_file) -> Optional[str]:
    """
    Extract text content from a PDF file.

    Args:
        pdf_file: Django UploadedFile or file-like object

    Returns:
        str: Extracted text from PDF, or None if extraction fails
    """
    try:
        pdf_file.seek(0)
        rag_index.delete_all_chunks()

        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file.read()))

        text = ""
        for page in pdf_reader.pages:
            extracted = page.extract_text() or ""
            text += extracted

        text = text.strip()
        if not text:
            print("⚠️ No text extracted — PDF may be scanned or image-based.")
            return None

        print("✅ Text extracted successfully.")
        return text

    except Exception as e:
        print(f"❌ Error extracting text from PDF: {e}")
        return None

def save_file(file) -> Optional[str]:
    """
    Save a file to the media directory.
    """
    try:
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

        file_path = os.path.join(settings.MEDIA_ROOT, file.name)
        with open(file_path, "wb") as f:
            for chunk in file.chunks() if hasattr(file, "chunks") else [file.read()]:
                f.write(chunk)
        return file_path
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        return None