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

def classify_text(category: str):
    """Classifies the text into a given category."""
    return {"status": "success", "classification_result": f"The text has been classified under the category: {category}"}

def analyze_sentiment(sentiment: str, score: float):
    """Analyzes the sentiment of the text."""
    return {"status": "success", "sentiment_analysis": {"sentiment": sentiment, "confidence_score": score}}

def determine_topic(topic: str, keywords: list[str]):
    """Determines the main topic of the text and extracts key words."""
    return {"status": "success", "topic_analysis": {"main_topic": topic, "keywords": keywords}}


def process_text_with_function_calling_vertex(prompt: str, api_key: str):
    """
    Orchestrates the multi-turn conversation with Gemini for function calling
    using the Vertex AI SDK (google.genai).
    """
    client = genai.Client(api_key=api_key)

    tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="classify_text",
                    description="Use this function to classify text into a specific category like Technology, Finance, or Health.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "category": types.Schema(
                                type=types.Type.STRING,
                                description="The category to classify the text into.",
                                enum=["Technology", "Finance", "Health", "General"]
                            )
                        },
                        required=["category"]
                    )
                ),
                types.FunctionDeclaration(
                    name="analyze_sentiment",
                    description="Use this function to analyze the sentiment of a piece of text.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "sentiment": types.Schema(
                                type=types.Type.STRING,
                                description="The sentiment of the text.",
                                enum=["Positive", "Negative", "Neutral"]
                            ),
                            "score": types.Schema(
                                type=types.Type.NUMBER,
                                description="The confidence score of the sentiment analysis, from 0.0 to 1.0."
                            )
                        },
                        required=["sentiment", "score"]
                    )
                ),
                types.FunctionDeclaration(
                    name="determine_topic",
                    description="Use this function to find the main topic and important keywords in a text.",
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "topic": types.Schema(type=types.Type.STRING, description="The primary topic of the text."),
                            "keywords": types.Schema(
                                type=types.Type.ARRAY,
                                items=types.Schema(type=types.Type.STRING),
                                description="A list of 2-3 main keywords from the text."
                            )
                        },
                        required=["topic", "keywords"]
                    )
                )
            ]
        )
    ]

    available_functions = {
        "classify_text": classify_text,
        "analyze_sentiment": analyze_sentiment,
        "determine_topic": determine_topic,
    }

    model_name = "gemini-2.5-flash-lite"

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    
    config = types.GenerateContentConfig(tools=tools)

    response = client.models.generate_content(
        model=model_name,
        contents=contents,
        config=config,
    )

    try:
        function_call = response.candidates[0].content.parts[0].function_call
    except (IndexError, AttributeError):
        return {
            "natural_language_response": response.text,
            "function_data": None
        }

    function_name = function_call.name
    function_args = function_call.args

    if function_name in available_functions:
        function_to_call = available_functions[function_name]
        args_dict = {key: value for key, value in function_args.items()}
        function_response_data = function_to_call(**args_dict)

        function_response_part = types.Part.from_function_response(
            name=function_name,
            response={"result": function_response_data}
        )

        contents.append(response.candidates[0].content)
        contents.append(types.Content(parts=[function_response_part]))

        final_response = client.models.generate_content(
            model=model_name,
            contents=contents,
        )

        return {
            "natural_language_response": final_response.text,
            "function_data": function_response_data
        }
    else:
        logger.error(f"Model requested an unknown function: {function_name}")
        raise ValueError(f"Model requested an unknown function: {function_name}")