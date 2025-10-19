from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        from rag_service.rag_service import RAGIndex
        from django.db.utils import OperationalError, ProgrammingError

        try:
            global rag_index
            rag_index = RAGIndex()
        except (OperationalError, ProgrammingError):
            print("⚠️ Database not ready, RAG index will initialize later.")
