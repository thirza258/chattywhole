import React, { useState } from 'react';
import services from '../services/services';

const RewriterPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
    setResultText(`Processed: ${event.target.value}`);
    setResultText(services.handleResponseData(event.target.value));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Two Column Layout</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col">
        {/* Sub Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Input</h2>
          <h2 className="text-lg font-semibold text-gray-700">Result</h2>
        </div>

        {/* Two Columns */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column (Text Area) */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <textarea
              className="w-full h-full p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your text here..."
              value={inputText}
              onChange={handleInputChange}
            />
          </div>

          {/* Right Column (Result) */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="w-full h-full p-4 rounded-lg">
              <pre className="whitespace-pre-wrap break-words">{resultText as string}</pre>
            </div>
          </div>
        </div>
      </main>

      
    </div>
  );
};

export default RewriterPage;