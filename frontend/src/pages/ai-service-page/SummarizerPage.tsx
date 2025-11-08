import React, { useState } from 'react';
import services from '../../services/services';
import ReactMarkdown from 'react-markdown';

const SummarizerPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setInputText(text);
    setResultText(services.handleResponseData(text));
  };

  const handleSummarize = async () => {
    try {
      const response = await services.postSummarizer(inputText);
      setResultText(services.handleResponseData(response.data));
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Summarizer Page</h1>
          <p className="text-gray-600 mt-2">Enhance your writing with our AI-powered summarizer tool. Simply paste your text and let us help you summarize it.</p>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col">
        <div className="flex-grow grid grid-rows-2 gap-6">
          <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Input</h2>
              <button
                onClick={() => navigator.clipboard.readText().then(text => setInputText(text))}
                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
              >
                Paste
              </button>
            </div>
            <div className="flex flex-col h-full">
              <textarea
                className="w-full flex-grow p-4 rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your text here..."
                value={inputText}
                onChange={handleInputChange}
              />
              <div className="p-2 text-sm text-gray-500 border-t">
                Words: {inputText.trim().split(/\s+/).filter(word => word.length > 0).length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Result</h2>
              <button
                onClick={() => navigator.clipboard.writeText(resultText)}
                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
              >
                Copy
              </button>
            </div>
            <div className="w-full h-full p-4">
              <ReactMarkdown>{resultText}</ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSummarize}
          >
            Summarize
          </button>
        </div>
      </main>

     
    </div>
  );
};

export default SummarizerPage;