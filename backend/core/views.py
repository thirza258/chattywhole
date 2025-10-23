from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google import genai
from google.genai import types
import logging
from core.helper import strip_authentication_header, extract_text_from_pdf, save_file
from core.models import ChatRecord
from core.apps import rag_index
import base64
import mimetypes

logger = logging.getLogger(__name__)

class ApiKeyCheckView(APIView):
    def get(self, request):
        """
        Checks if the API key is valid.
        """
        api_key = request.headers.get('Authorization')
        if not api_key:
            return Response({
                "status": status.HTTP_401_UNAUTHORIZED,
                "message": "API key not provided",
                "data": False
            }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            client = genai.Client(api_key=api_key)

            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents="test"
            )

            return Response({
                "status": status.HTTP_200_OK,
                "message": "API key is valid",
                "data": True
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"API key validation failed: {e}")

            if "API key not valid" in str(e) or "API_KEY_INVALID" in str(e):
                return Response({
                    "status": status.HTTP_401_UNAUTHORIZED,
                    "message": "Invalid API key",
                    "data": False
                }, status=status.HTTP_401_UNAUTHORIZED)
            return Response({
                "status": status.HTTP_400_BAD_REQUEST,
                "message": f"Error: {str(e)}",
                "data": False
            }, status=status.HTTP_400_BAD_REQUEST)

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
            ChatRecord.objects.create(method='prompt', prompt=prompt, response=response_data, api_key=api_key)
            
            return Response({
                "status": 200,
                "message": "success", 
                "data": response_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred while processing your request. {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProofreaderView(APIView):
    def generate_response(self, prompt: str, api_key: str) -> str:
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
                    genai.types.Part.from_text(text="""You are a proofreader.
                     Your task is to proofread the given text and 
                     make sure it is grammatically correct and semantically correct. 
                     And make sure to proofread eventough the text is already perfect
                     """),
                ],
            )
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
            logger.error(f"An error occurred during Gemini API call in ProofreaderView: {e}")
            raise
    
    def post(self, request, *args, **kwargs):
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
            ChatRecord.objects.create(method='proofreader', prompt=prompt, response=response_data, api_key=api_key)
            return Response({
                "status": 200,
                "message": "success",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred while processing your request. {e}"},
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
            ChatRecord.objects.create(method='summarizer', prompt=prompt, response=response_data, api_key=api_key)
    
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
            ChatRecord.objects.create(method='translator', prompt=prompt, response=translation_text, api_key=api_key)
          
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
            ChatRecord.objects.create(method='writer', prompt=prompt, response=response_data, api_key=api_key)
       
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
            ChatRecord.objects.create(method='rewriter', prompt=prompt, response=response_data, api_key=api_key)
          
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

class CopyWritingView(APIView):
    """
    API View for generating copywriting based on the prompt.
    """
    def generate_response(self, prompt: str, api_key: str) -> str:
        """
        Generates copywriting based on the prompt using the Gemini API.
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
                    genai.types.Part.from_text(text="You are a skilled copywriter. Your task is to create engaging and persuasive copywriting based on the user's prompt."),
                ],
            )
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
            logger.error(f"An error occurred during Gemini API call in CopyWriting: {e}")
            raise
    
    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to generate copywriting.
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
            ChatRecord.objects.create(method='copywriting', prompt=prompt, response=response_data, api_key=api_key)
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

class ExplainerView(APIView):
    """
    API View for generating explainer based on the prompt.
    """
    def generate_response(self, prompt: str, api_key: str) -> str:
        """
        Generates explainer based on the prompt using the Gemini API.
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
                    genai.types.Part.from_text(text="You are a skilled explainer. Your task is to explain the given prompt in a way that is easy to understand."),
                ],
            )
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
            logger.error(f"An error occurred during Gemini API call in ExplainerView: {e}")
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to generate explainer.
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
            ChatRecord.objects.create(method='explainer', prompt=prompt, response=response_data, api_key=api_key)
            return Response({
                "status": 200,
                "message": "success",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": 500,
                "message": "error",
                "data": "An unexpected error occurred while processing your request." + str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PDFUploadRAGView(APIView):
    """
    API endpoint to upload a PDF, extract its text,
    and process it through the RAG service.
    """

    def post(self, request):
        pdf_file = request.FILES.get("file")

        if not pdf_file:
            return Response(
                {"error": "No PDF file provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            file_path = save_file(pdf_file)
        except Exception as e:
            return Response(
                {"error": f"Failed to save PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            text_content = extract_text_from_pdf(pdf_file)
            rag_index.add_document(pdf_file.name, text_content)
            if not text_content:
                return Response(
                    {"error": "No text could be extracted from PDF."},
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY
                )
        except Exception as e:
            return Response(
                {"error": f"Error extracting PDF text: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            result = rag_index.retrieve_documents(text_content, k=3)
        except Exception as e:
            return Response(
                {"error": f"RAG service failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            "message": "PDF processed successfully",
            "file_path": file_path,
            "rag_result": result
        }, status=status.HTTP_200_OK)

class RAGChatView(APIView):
    """
    API View for chatting with the RAG service.
    """
    def generate_response(self, prompt: str, api_key: str, chunks: list) -> str:
        try:
            client = genai.Client(api_key=api_key)
            model = "gemini-2.5-flash-lite"
            contents = [
                genai.types.Content(
                    role="user",
                    parts=[
                        genai.types.Part.from_text(text=f"User Question: {prompt}\nContext Information:\n" + "\n".join(f"Document {i+1}: {chunk}" for i, chunk in enumerate(chunks))),
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
                    genai.types.Part.from_text(text="You are a helpful assistant. Your task is to answer the user's question based on the given context."),
                ],
            )
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            
            return response.text
        except Exception as e:
            logger.error(f"An error occurred during Gemini API call in RAGChatView: {e}")
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to chat with the RAG service.
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
            chunks = rag_index.retrieve_documents(prompt, k=3)
            
            response_data = self.generate_response(prompt=prompt, api_key=api_key, chunks=chunks)
            ChatRecord.objects.create(method='rag_chat', prompt=prompt, response=response_data, api_key=api_key)
            return Response({
                "status": 200,
                "message": "success",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": 500,
                "message": "error",
                "data": "An unexpected error occurred while processing your request." + str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       

class ImageGeneratorView(APIView):
    """
    API View for generating an image from a text prompt using the Gemini API.
    """

    def generate_image(self, prompt: str, api_key: str):
        """
        Generates an image using Gemini's image model.
        """
        try:
            client = genai.Client(api_key=api_key)
            model = "gemini-2.5-flash-image"
            
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt)],
                )
            ]

            generate_content_config = types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            )

            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
            ):
                if (
                    chunk.candidates
                    and chunk.candidates[0].content
                    and chunk.candidates[0].content.parts
                ):
                    part = chunk.candidates[0].content.parts[0]
                    if hasattr(part, "inline_data") and part.inline_data and part.inline_data.data:
                        mime_type = part.inline_data.mime_type
                        image_data = part.inline_data.data
                        base64_str = base64.b64encode(image_data).decode("utf-8")
                        extension = mimetypes.guess_extension(mime_type) or ".png"
                        return {
                            "mime_type": mime_type,
                            "extension": extension,
                            "base64_image": base64_str,
                        }
            raise Exception("No image data returned from Gemini API.")
        except Exception as e:
            logger.error(f"Error during image generation: {e}")
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to generate an image.
        """
        prompt = request.data.get("prompt")
        api_key = request.headers.get("Authorization")
        api_key = strip_authentication_header(api_key)

        if not prompt:
            return Response(
                {"error": "A 'prompt' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not api_key:
            return Response(
                {"error": "Authorization header is required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            image_info = self.generate_image(prompt=prompt, api_key=api_key)
            ChatRecord.objects.create(
                method="image_generation",
                prompt=prompt,
                response=f"[Image generated: {image_info['extension']}]",
                api_key=api_key
            )

            return Response(
                {
                    "status": 200,
                    "message": "success",
                    "data": {
                        "mime_type": image_info["mime_type"],
                        "extension": image_info["extension"],
                        "image_base64": image_info["base64_image"],
                    },
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred while processing your request. {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class EmailGeneratorView(APIView):
    """
    API View for generating an email from a text prompt using the Gemini API.
    """
    def generate_response(self, prompt: str, api_key: str) -> str:
        """
        Generates an email from a text prompt using the Gemini API.
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
                    genai.types.Part.from_text(text="You are a skilled email generator. Your task is to generate an email from a text prompt."),
                ],
            )
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            return response.text
        except Exception as e:
            logger.error(f"An error occurred during Gemini API call in EmailGeneratorView: {e}")
            raise

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to generate an email.
        """
        context = request.data.get("context")
        recipients = request.data.get("recipients")
        sender = request.data.get("sender")
        prompt = request.data.get("prompt")

        api_key = request.headers.get("Authorization")
        api_key = strip_authentication_header(api_key)
        prompt = f"""
            You are a skilled email generator. Your task is to generate an email from a text prompt.
            The email should be generated based on the following context:
            {context}
            The recipients of the email are:
            {recipients}
            The sender of the email is:
            {sender}
            The email should be generated based on the following prompt:
            {prompt}
        """
        if not prompt:
            return Response(
                {"error": "A 'context' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not recipients:
            return Response(
                {"error": "A 'recipients' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not sender:
            return Response(
                {"error": "A 'sender' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not prompt:
            return Response(
                {"error": "A 'prompt' is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            response_data = self.generate_response(prompt=prompt, api_key=api_key)
            ChatRecord.objects.create(method='email_generation', prompt=prompt, response=response_data, api_key=api_key)
            return Response({
                "status": 200,
                "message": "success",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": 500,
                "message": "error",
                "data": "An unexpected error occurred while processing your request." + str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HistoryView(APIView):
    """
    API View for retrieving history of prompts.
    """
    def get(self, request):
        try:
            
            api_key = strip_authentication_header(request.headers.get('Authorization'))
            history = ChatRecord.objects.filter(api_key=api_key).order_by('-created_at')

            history_list = [
                {
                    "method": record.method,
                    "prompt": record.prompt[:100],
                    "response": record.response[:100],
                    "created_at": record.created_at,
                }
                for record in history
            ]
            return Response({
                "status": 200,
                "message": "success",
                "data": history_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": 500,
                "message": "error",
                "data": "An unexpected error occurred while processing your request." + str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            