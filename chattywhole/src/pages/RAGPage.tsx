import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import services from '../services/services';

const RAGPage: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; user: 'me' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userInput = input;
    setMessages((prevMessages) => [...prevMessages, { text: userInput, user: 'me' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await services.chatWithRAG(userInput);
      const botResponse = response.response || 'Sorry, I could not find an answer.';

      setMessages((prevMessages) => [...prevMessages, { text: botResponse, user: 'bot' }]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Sorry, something went wrong while connecting to the service.',
          user: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-blue-300/20 rounded-full blur-3xl -top-1/4 -right-1/4"></div>
        <div className="absolute w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl bottom-0 -left-1/4"></div>
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.user === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md lg:max-w-2xl inline-block px-4 py-2 rounded-lg shadow ${
                msg.user === 'me' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-md lg:max-w-2xl inline-block px-4 py-2 rounded-lg shadow bg-white text-gray-800">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex p-4 bg-white border-t relative">
        <input
          type="text"
          className="flex-grow border-y border-l rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the document"
          disabled={isLoading}
        />
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          onClick={sendMessage}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default RAGPage;