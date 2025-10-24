# Nevatal - AI Functions Hub

Nevatal is a comprehensive AI application that combines multiple AI functionalities into a single, easy-to-use platform. The application consists of a frontend running on Vue.js and a Django backend that integrates various AI capabilities.

## Features

- Prompt-based interactions
- Proofreading assistance
- Text summarization
- Translation services
- Content writing and rewriting
- AI-powered explanations
- Copywriting assistance
- Document AI processing
- RAG (Retrieval Augmented Generation) chat functionality
- Nano Banana Image Generation
- Email Builder AI

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/thirza258/nevatal.git
   cd nevatal
   ```

2. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000

### Development Setup

For local development without Docker:

1. Frontend setup:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Backend setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
