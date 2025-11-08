import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ResultDisplayProps {
  resultText: string;
  isLoading: boolean;
  placeholderText?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  resultText, 
  isLoading, 
  placeholderText = "Your result will appear here..." 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800">
      <div className="flex justify-between items-center p-2 border-b">
        <h2 className="text-lg font-semibold text-gray-700">Result</h2>
        <button
          onClick={() => navigator.clipboard.writeText(resultText)}
          className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 disabled:opacity-50"
          disabled={!resultText || isLoading}
        >
          Copy
        </button>
      </div>
      <div className="w-full h-full p-4 rounded-b-lg prose overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading...</p> 
          </div>
        ) : (
          <ReactMarkdown>
            {resultText || placeholderText}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;