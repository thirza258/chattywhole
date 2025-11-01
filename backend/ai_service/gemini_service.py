from google import genai
import base64
import mimetypes
from google.genai import types
import logging

logger = logging.getLogger(__name__)

def test_api_key(api_key: str):
    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents="test"
        )

        return response.text
    except Exception as e:
        logger.error(f"API key validation failed: {e}")
        return False

def generate_response(
    api_key: str,
    prompt: str,
    model: str = "gemini-2.5-flash-lite",
    system_instruction_string: str = "Answer this prompt make sure answer that",
    response_schema_param: list = ["response"],
    response_mime_type_param: str = "application/json",
) -> str:
        """
        Generates a response using the Gemini API.

        This method encapsulates the logic for interacting with the external
        Gemini API. It is designed to be called by the `post` method.
        """
        try:

            response_schema_properties = {
                param: genai.types.Schema(
                    type=genai.types.Type.STRING,
                )
                for param in response_schema_param
            }

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
                response_mime_type=response_mime_type_param,
                response_schema=genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    required=response_schema_param,
                    properties=response_schema_properties,
                ),
                system_instruction=[
                    genai.types.Part.from_text(text=system_instruction_string),
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