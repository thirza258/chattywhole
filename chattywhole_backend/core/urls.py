from django.urls import path
from .views import PromptView, ProofreaderView, SummarizerView, TranslatorView, WriterView, RewriterView, ApiKeyCheckView, HistoryView, CopyWritingView

urlpatterns = [
    path("prompt/", PromptView.as_view(), name="prompt"),
    path("proofreader/", ProofreaderView.as_view(), name="proofreader"),
    path("summarizer/", SummarizerView.as_view(), name="summarizer"),
    path("copywriting/", CopyWritingView.as_view(), name="copywriting"),
    path("translator/", TranslatorView.as_view(), name="translator"),
    path("writer/", WriterView.as_view(), name="writer"),
    path("rewriter/", RewriterView.as_view(), name="rewriter"),
    path("api-key-check/", ApiKeyCheckView.as_view(), name="api-key-check"),
    path("history/", HistoryView.as_view(), name="history"),
]
