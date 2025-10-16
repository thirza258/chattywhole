import PyPDF2
import io
from typing import Optional
import os
from chattywhole_settings import settings

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
        pdf_file: File object containing PDF data
        
    Returns:
        str: Extracted text from PDF, or None if extraction fails
    """
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file.read()))
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
            
        return text.strip()
        
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return None

def save_file(file) -> Optional[str]:
    """
    Save a file to the media directory.
    """
    try:
        file_path = os.path.join(settings.MEDIA_ROOT, file.name)
        with open(file_path, "wb") as f:
            f.write(file.read())
        return file_path
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        return None