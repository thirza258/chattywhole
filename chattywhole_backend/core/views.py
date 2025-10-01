from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google import genai
from google.genai import types
import logging
from core.helper import strip_authentication_header

logger = logging.getLogger(__name__)

class ApiKeyCheckView(APIView):
    """
    API View for validating the Gemini API key.
    """
    def get(self, request):
        try:
            api_key = request.headers.get('Authorization')
            if not api_key:
                return Response({
                    "status": status.HTTP_401_UNAUTHORIZED,
                    "message": "API key not provided",
                    "data": "false"
                })

            client = genai.Client(api_key=api_key)
            
            model = client.get_model("gemini-2.5-flash-lite")
            model.count_tokens("test")
            
            return Response({
                "status": status.HTTP_200_OK,
                "message": "API key is valid", 
                "data": "true"
            })
            
        except Exception as e:
            logger.error(f"API key validation failed: {e}")
            return Response({
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "Invalid API key",
                "data": "false"
            })

class PromptView(APIView):
    """
    API View for generating a response to a prompt.
    """

    def generate_response(self, prompt: str, api_key: str) -> str:
        """
        Generates a response using the Gemini API.

        This method encapsulates the logic for interacting with the external
        Gemini API. It is designed to be called by the `post` method.
        """
        try:
            client = genai.Client(api_key=api_key)
            model = "gemini-2.5-flash-lite"
            contents = [
                genai.types.Content(
                    role="user",
                    parts=[
                        genai.types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            generate_content_config = genai.types.GenerateContentConfig(
                thinking_config=genai.types.ThinkingConfig(
                    thinking_budget=-1,
                ),
                response_mime_type="application/json",
                response_schema=genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    required=["response"],
                    properties={
                        "response": genai.types.Schema(
                            type=genai.types.Type.STRING,
                        ),
                    },
                ),
                system_instruction=[
                    genai.types.Part.from_text(text="Answer this prompt make sure answer that"),
                ],
            )

            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
            logger.error(f"An error occurred during Gemini API call: {e}")
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to generate a response from a prompt.

        This method is responsible for request handling, validation, and
        returning an appropriate HTTP response.
        """
        prompt = request.data.get("prompt")
        api_key = request.headers.get('Authorization')
        api_key = strip_authentication_header(api_key)
        if not prompt:
            return Response(
                {"error": "A 'prompt' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not api_key:
            return Response(
                {"error": "Authorization header is required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            response_data = self.generate_response(prompt=prompt, api_key=api_key)
            return Response({
                "status": 200,
                "message": "success", 
                "data": response_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred while processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SummarizerView(APIView):
    """
    API View for summarizing complex information into clear insights.
    This view now leverages the robust error handling and response structure
    from the PromptView class.
    """

    def generate_response(self, prompt: str, api_key: str) -> str:
        """
        Generates a summarized response using the Gemini API.

        This method encapsulates the logic for interacting with the external
        Gemini API. It is designed to be called by the `post` method and
        includes specific system instructions for summarization.
        """
        try:
            client = genai.Client(api_key=api_key)
            model = "gemini-2.5-flash-lite"
            contents = [
                genai.types.Content(
                    role="user",
                    parts=[
                        genai.types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            generate_content_config = genai.types.GenerateContentConfig(
                thinking_config=genai.types.ThinkingConfig(
                    thinking_budget=-1,
                ),
                response_mime_type="application/json",
                response_schema=genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    required=["response"],
                    properties={
                        "response": genai.types.Schema(
                            type=genai.types.Type.STRING,
                        ),
                    },
                ),
                system_instruction=[
                    genai.types.Part.from_text(text="You are a highly skilled summarizer. Your task is to distill complex information into clear and concise insights."),
                ],
            )

            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
            logger.error(f"An error occurred during Gemini API call in SummarizerView: {e}")
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to generate a summary from a prompt.

        This method is responsible for request handling, validation, and
        returning a consistent API response format.
        """
        prompt = request.data.get("prompt")
        api_key = request.headers.get('Authorization')  
        api_key = strip_authentication_header(api_key)
        if not api_key:
            return Response(
                {"error": "Authorization header is required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not prompt:
            return Response(
                {"error": "A 'prompt' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response_data = self.generate_response(prompt=prompt, api_key=api_key)
            return Response({
                "status": 200,
                "message": "success",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred while processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TranslatorView(APIView):
    """
    API View for translating text into a preferred language.
    This view now follows the response structure and error handling pattern
    of the provided SummarizerView.
    """

    def generate_response(self, prompt: str, source_language: str = "English", target_language: str = "English", api_key: str = "") -> str:
        """
        Generates a translated response using the Gemini API.

        This method encapsulates the logic for interacting with the external
        Gemini API, including specific system instructions for translation.
        """
        try:
            client = genai.Client(api_key=api_key)
            model = "gemini-2.5-flash-lite"
            contents = [
                genai.types.Content(
                    role="user",
                    parts=[
                        genai.types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            generate_content_config = genai.types.GenerateContentConfig(
                thinking_config=genai.types.ThinkingConfig(
                    thinking_budget=-1,
                ),
                response_mime_type="application/json",
                response_schema=genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    required=["response"],
                    properties={
                        "response": genai.types.Schema(
                            type=genai.types.Type.STRING,
                        ),
                    },
                ),
                system_instruction=[
                    genai.types.Part.from_text(text=f"You are a professional translator. Translate the given text into {target_language} from {source_language}."),
                ],
            )

            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
            logger.error(f"An error occurred during Gemini API call in TranslatorView: {e}")
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to translate text.

        Validates input, calls the translation logic, and returns a standardized API response.
        """
        prompt = request.data.get("prompt")
        target_language = request.data.get("target_language", "English")
        source_language = request.data.get("source_language", "English")
        api_key = request.headers.get('Authorization')
        api_key = strip_authentication_header(api_key)
        
        if not prompt:
            return Response(
                {"error": "Prompt is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            translation_text = self.generate_response(prompt=prompt, target_language=target_language, source_language=source_language)
            
            return Response({
                "status": 200,
                "message": "success",
                "data": translation_text
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred while processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WriterView(APIView):
    """
    API View for creating original and engaging text.
    This view now leverages robust error handling and a consistent response structure.
    """

    def generate_response(self, prompt: str, api_key: str) -> str:
        """
        Generates original text based on the prompt using the Gemini API.

        This method encapsulates the interaction with the Gemini API, including
        specific system instructions for writing.
        """
        try:
            client = genai.Client(api_key=api_key)
            model = "gemini-2.5-flash-lite"
            contents = [
                genai.types.Content(
                    role="user",
                    parts=[
                        genai.types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            generate_content_config = genai.types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(
                    thinking_budget=-1,
                ),
                response_mime_type="application/json",
                response_schema=genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    required=["response"],
                    properties={
                        "response": genai.types.Schema(
                            type=genai.types.Type.STRING,
                        ),
                    },
                ),
                system_instruction=[
                    genai.types.Part.from_text(text="You are an expert writer. Your goal is to create original, engaging, and high-quality text based on the user's prompt."),
                ],
            )

            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
           
            logger.error(f"An error occurred during Gemini API call in WriterView: {e}")
           
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to generate written text.

        This method is responsible for request handling, validation, and
        returning a consistent API response format.
        """
        prompt = request.data.get("prompt")
        api_key = request.headers.get('Authorization')
        api_key = strip_authentication_header(api_key)
        
        if not prompt:
           
            return Response(
                {"error": "A 'prompt' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response_data = self.generate_response(prompt=prompt, api_key=api_key)
           
            return Response({
                "status": 200,
                "message": "success",
                "data": {"written_text": response_data}
            }, status=status.HTTP_200_OK)
        except Exception as e:
           
            return Response(
                {"error": "An unexpected error occurred while processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )   

class RewriterView(APIView):
    """
    API View for improving content with alternative options.
    This view now leverages robust error handling and a consistent response structure.
    """

    def generate_response(self, prompt: str, api_key: str) -> str:
        """
        Generates rewritten content based on the prompt using the Gemini API.

        This method encapsulates the interaction with the Gemini API, including
        specific system instructions for rewriting.
        """
        try:
            client = genai.Client(api_key=api_key)
            model = "gemini-2.5-flash-lite"
            contents = [
                genai.types.Content(
                    role="user",
                    parts=[
                        genai.types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            generate_content_config = genai.types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(
                    thinking_budget=-1,
                ),
                response_mime_type="application/json",
                response_schema=genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    required=["response"],
                    properties={
                        "response": genai.types.Schema(
                            type=genai.types.Type.STRING,
                        ),
                    },
                ),
                system_instruction=[
                    genai.types.Part.from_text(text="You are a skilled rewriter. Your task is to improve the given content by providing alternative options, enhancing clarity, and refining the language."),
                ],
            )

            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
           
            logger.error(f"An error occurred during Gemini API call in RewriterView: {e}")
           
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to generate rewritten text.

        This method is responsible for request handling, validation, and
        returning a consistent API response format.
        """
        prompt = request.data.get("prompt")
        api_key = request.headers.get('Authorization')
        api_key = strip_authentication_header(api_key)
        
        if not prompt:
           
            return Response(
                {"error": "A 'prompt' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response_data = self.generate_response(prompt=prompt, api_key=api_key   )
           
            return Response({
                "status": 200,
                "message": "success",
                "data": {"rewritten_text": response_data}
            }, status=status.HTTP_200_OK)
        except Exception as e:
           
            return Response(
                {"error": "An unexpected error occurred while processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )