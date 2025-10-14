import React, { useState } from 'react';
import services from '../services/services';
const SummarizerPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setInputText(text);
    // You can add your logic here to process the input and set the result
    setResultText(`Processed: ${text}`);
    setResultText(services.handleResponseData(text));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Two Row Layout</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col">
        {/* Two Rows */}
        <div className="flex-grow grid grid-rows-2 gap-6">
          {/* Top Row (Input) */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 p-4 border-b">Input</h2>
            <textarea
              className="w-full h-full p-4 rounded-b-lg resize-none focus:outline-none"
              placeholder="Enter your text here..."
              value={inputText}
              onChange={handleInputChange}
            />
          </div>

          {/* Bottom Row (Result) */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 p-4 border-b">Result</h2>
            <div className="w-full h-full p-4">
              <pre className="whitespace-pre-wrap break-words">{resultText as string}</pre>
            </div>
          </div>
        </div>
      </main>

     
    </div>
  );
};

export default SummarizerPage;