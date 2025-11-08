from django.urls import path
from .views import DirectExtractionView, AnalyzeTextView

urlpatterns = [
    path("direct-extraction/", DirectExtractionView.as_view(), name="direct-extraction"),
    path("analyze-text/", AnalyzeTextView.as_view(), name="analyze-text"),
]