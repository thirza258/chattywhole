import { useState } from "react";
import services from "../../services/services";
import { Response } from "../../interface";
import ReactMarkdown from "react-markdown";

// The `selectedModel` prop has been removed as it's no longer necessary.
function PromptPage() {
  const [messages, setMessages] = useState<{ text: string; user: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (input.trim() === "") return; // Exit if input is empty

    const userInput = input;
    setMessages((prevMessages) => [...prevMessages, { text: userInput, user: "me" }]);
    setInput("");

    try {
      // Directly call the Gemini service. The switch statement has been removed.
      const response: Response = await services.getGeminiResponse(userInput);
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: response.data.response, user: "bot" },
      ]);
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Sorry, something went wrong while connecting to the service.", user: "bot" },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Messages display area */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.user === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md lg:max-w-2xl inline-block px-4 py-2 rounded-lg shadow ${
                msg.user === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              {/* Using ReactMarkdown to render the bot's response */}
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 flex p-4 bg-white border-t">
        <input
          type="text"
          className="flex-grow border rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here"
        />
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default PromptPage;