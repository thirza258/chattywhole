import { useState } from "react";
import services from "../../services/services";
import { Response } from "../../interface"
import ReactMarkdown from "react-markdown";

function Chatbot({ selectedModel }: { selectedModel: string }) {
  const [messages, setMessages] = useState<{ text: string; user: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (input.trim() !== "") {
      setMessages((prevMessages) => [...prevMessages, { text: input, user: "me" }]);
      const userInput = input;
      setInput("");

      try {
        let response: Response;
        // Call the appropriate API based on the selected model
        switch (selectedModel) {
          case "GPT":
            response = await services.getGPTResponse(userInput);
            break;
          case "Gemini":
            response = await services.getGeminiResponse(userInput);
            break;
          case "Claude":
            response = await services.getClaudeResponse(userInput);
            break;
          case "Mistral":
            response = await services.getMistralResponse(userInput);
            break;
          default:
            throw new Error("Model not supported");
        }
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: response.data.response, user: "bot" },
        ]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Sorry, something went wrong.", user: "bot" },
        ]);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${msg.user === "me" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block px-4 py-2 rounded ${
                msg.user === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >

             <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0 flex p-4 bg-white shadow-md">
        <input
          type="text"
          className="flex-grow border rounded px-4 py-2 mr-4"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? sendMessage() : null)}
          placeholder="Type your message here"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
