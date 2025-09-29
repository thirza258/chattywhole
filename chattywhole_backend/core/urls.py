from django.urls import path
from .views import PromptView, SummarizerView, TranslatorView, WriterView, RewriterView

urlpatterns = [
    path("prompt/", PromptView.as_view(), name="prompt"),
    path("summarizer/", SummarizerView.as_view(), name="summarizer"),
    path("translator/", TranslatorView.as_view(), name="translator"),
    path("writer/", WriterView.as_view(), name="writer"),
    path("rewriter/", RewriterView.as_view(), name="rewriter"),
]
