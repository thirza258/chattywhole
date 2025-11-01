import { useState } from "react";
import services from "../services/services";
import type { Response } from "../interface";
import ReactMarkdown from "react-markdown";

const ExplainerPage: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string | object; user: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userInput = input;
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userInput, user: "me" },
    ]);
    setInput("");
    try {
      const response: Response = await services.postExplainer(userInput); 
      if (!response) throw new Error("No response received");

      if (typeof response.data === 'string' && response.data.charAt(0) === '{') {
        const parsedData = JSON.parse(response.data);
        if (parsedData.response) {
          response.data = parsedData.response;
        }
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: response.data, user: "bot" },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Sorry, I encountered an issue while trying to generate an explanation.",
          user: "bot",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-green-300/20 rounded-full blur-3xl -top-1/4 -right-1/4"></div>
        <div className="absolute w-[600px] h-[600px] bg-green-200/20 rounded-full blur-3xl bottom-0 -left-1/4"></div>

        {/* Center text appears when there are no messages */}
        {messages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-4xl font-bold text-gray-600 text-center">
              Need something explained?<br/>
              Just ask.
            </p>
          </div>
        )}
      </div>

      {/* Chat messages display area */}
      <div className="flex-grow overflow-y-auto p-4 relative">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${
              msg.user === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col">
              <div
                className={`max-w-md lg:max-w-2xl inline-block px-4 py-2 rounded-lg shadow ${
                  msg.user === "me"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                <div className="flex flex-col">
                  <ReactMarkdown>{msg.text as string}</ReactMarkdown>
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text as string)}
                    className={`self-end mt-1 px-2 py-1 text-xs ${msg.user === "me" ? "text-gray-200 hover:text-gray-100" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 flex p-4 bg-white border-t relative">
        <button
          onClick={() => navigator.clipboard.readText().then(text => setInput(text))}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-md text-gray-600 border-y border-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Paste
        </button>
        <input
          type="text"
          className="flex-grow border-y px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a topic, question, or concept to explain..."
        />
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={sendMessage}
        >
          Explain
        </button>
      </div>
    </div>
  );
}

export default ExplainerPage;