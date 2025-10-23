from django.db import models
from django.db.models import JSONField


class ChatRecord(models.Model):

    METHOD_CHOICES = [
        ('prompt', 'Prompt'),
        ('proofreader', 'Proofreader'),
        ('summarizer', 'Summarizer'),
        ('translator', 'Translator'),
        ('writer', 'Writer'),
        ('rewriter', 'Rewriter'),
        ('explainer', 'Explainer'),
        ('copywriting', 'Copywriting'),
        ('document_ai', 'Document AI'),
        ('email_generator', 'Email Generator'),
        ('rag_chat', 'RAG Chat'),
    ]

    method = models.CharField(max_length=255, choices=METHOD_CHOICES, default='prompt')
    prompt = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    api_key = models.CharField(max_length=255, default='')

    def __str__(self):
        return self.method

class RagChunk(models.Model):
    source = models.CharField(max_length=255)       
    text = models.TextField()                       
    embedding = models.JSONField(default=list) 
    metadata = JSONField(default=dict, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chunk {self.id} ({self.source})"