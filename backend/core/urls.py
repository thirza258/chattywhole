from django.urls import path
from .views import PromptView, ProofreaderView, SummarizerView, TranslatorView, WriterView, RewriterView, ApiKeyCheckView, HistoryView
from .views import CopyWritingView, ImageGeneratorView, ExplainerView, PDFUploadRAGView, RAGChatView, EmailGeneratorView

urlpatterns = [
    path("prompt/", PromptView.as_view(), name="prompt"),
    path("proofreader/", ProofreaderView.as_view(), name="proofreader"),
    path("summarizer/", SummarizerView.as_view(), name="summarizer"),
    path("copywriting/", CopyWritingView.as_view(), name="copywriting"),
    path("translator/", TranslatorView.as_view(), name="translator"),
    path("writer/", WriterView.as_view(), name="writer"),
    path("rewriter/", RewriterView.as_view(), name="rewriter"),
    path("image/", ImageGeneratorView.as_view(), name="image"),
    path("explainer/", ExplainerView.as_view(), name="explainer"),
    path("pdf-upload/", PDFUploadRAGView.as_view(), name="pdf-upload"),
    path("rag-chat/", RAGChatView.as_view(), name="rag-chat"),
    path("api-key-check/", ApiKeyCheckView.as_view(), name="api-key-check"),
    path("history/", HistoryView.as_view(), name="history"),
    path("email/", EmailGeneratorView.as_view(), name="email"),
]
