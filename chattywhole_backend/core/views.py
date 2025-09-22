from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import google.generativeai as genai
from google.generativeai import types

GEMINI_API_KEY = settings.GEMINI_API_KEY
genai.configure(api_key=GEMINI_API_KEY)

class PromptView(APIView):
    def generate_response(self, prompt):
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = "gemini-2.5-pro"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            thinking_config = types.ThinkingConfig(
                thinking_budget=-1,
            ),
            response_mime_type="application/json", 
            response_schema=genai.types.Schema(
                type = genai.types.Type.OBJECT,
                required = ["response"],
                properties = {
                    "response": genai.types.Schema(
                        type = genai.types.Type.STRING,
                    ),
                },
            ),
            system_instruction=[
                types.Part.from_text(text="Answer this prompt make sure answer that"),
            ],
        )

        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )
        return response.text

    def post(self, request):
        prompt = request.data.get("prompt")
        response = generate_response(prompt)
        return Response(response, status=status.HTTP_200_OK)

class SummarizerView(APIView):
    """
    API View for summarizing complex information into clear insights.
    """
    def generate_response(self, prompt):
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = "gemini-2.5-pro" 
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            system_instruction=[
                types.Part.from_text(text="You are a highly skilled summarizer. Your task is to distill complex information into clear and concise insights."),
            ],
        )

        response = client.models.generate_content(
            model=model,
            contents=contents,
            generation_config=generate_content_config,
        )
        return response.text

    def post(self, request):
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        response_text = self.generate_response(prompt)
        return Response({"summary": response_text}, status=status.HTTP_200_OK)


class TranslatorView(APIView):
    """
    API View for translating text into a preferred language.
    """
    def generate_response(self, prompt, target_language="English"):
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = "gemini-2.5-pro"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            system_instruction=[
                types.Part.from_text(text=f"You are a professional translator. Translate the given text into {target_language}."),
            ],
        )

        response = client.models.generate_content(
            model=model,
            contents=contents,
            generation_config=generate_content_config,
        )
        return response.text

    def post(self, request):
        prompt = request.data.get("prompt")
        target_language = request.data.get("target_language", "English")

        if not prompt:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        response_text = self.generate_response(prompt, target_language)
        return Response({"translation": response_text}, status=status.HTTP_200_OK)

class WriterView(APIView):
    """
    API View for creating original and engaging text.
    """
    def generate_response(self, prompt):
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = "gemini-2.5-pro"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            system_instruction=[
                types.Part.from_text(text="You are an expert writer. Your goal is to create original, engaging, and high-quality text based on the user's prompt."),
            ],
        )

        response = client.models.generate_content(
            model=model,
            contents=contents,
            generation_config=generate_content_config,
        )
        return response.text

    def post(self, request):
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        response_text = self.generate_response(prompt)
        return Response({"written_text": response_text}, status=status.HTTP_200_OK)

class RewriterView(APIView):
    """
    API View for improving content with alternative options.
    """
    def generate_response(self, prompt):
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = "gemini-2.5-pro"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            system_instruction=[
                types.Part.from_text(text="You are a skilled rewriter. Your task is to improve the given content by providing alternative options, enhancing clarity, and refining the language."),
            ],
        )

        response = client.models.generate_content(
            model=model,
            contents=contents,
            generation_config=generate_content_config,
        )
        return response.text

    def post(self, request):
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        response_text = self.generate_response(prompt)
        return Response({"rewritten_text": response_text}, status=status.HTTP_200_OK)