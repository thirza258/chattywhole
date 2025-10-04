from re import M
from django.db import models

# Create your models here.

class ChatRecord(models.Model):

    METHOD_CHOICES = [
        ('prompt', 'Prompt'),
        ('proofreader', 'Proofreader'),
        ('summarizer', 'Summarizer'),
        ('translator', 'Translator'),
        ('writer', 'Writer'),
        ('rewriter', 'Rewriter'),
    ]

    method = models.CharField(max_length=255, choices=METHOD_CHOICES, default='prompt')
    prompt = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    api_key = models.CharField(max_length=255, default='')

    def __str__(self):
        return self.method