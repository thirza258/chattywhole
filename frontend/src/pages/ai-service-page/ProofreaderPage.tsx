import { useState } from "react";
import services from "../../services/services";
import type { Response } from "../../interface";

import PageLayout from "../../components/PageLayout";
import ResultDisplay from "../../components/ResultDisplay";
import TwoColumnLayout from "../../components/TwoColumnLayout";

const ProofreaderPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClear = () => {
    setInputText('');
    setResultText('');
  };

  const handleProofread = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResultText('');
    try {
      const response: Response = await services.postProofreader(inputText);
      setResultText(services.handleResponseData(response.data));
    } catch (error) {
      console.error("Error fetching response:", error);
      setResultText("Sorry, there was an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // The unique Input component for this page
  const InputPanel = (
    <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800">
      <div className="flex justify-between items-center p-2 border-b">
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
          className="w-full flex-grow p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
        />
        <div className="p-2 text-sm text-gray-500 border-t">
          Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Proofreader"
      description="Enhance your writing with our AI-powered proofreading tool. Simply paste your text and let us help you catch errors and improve clarity."
      onClear={handleClear}
    >
      <TwoColumnLayout
        inputComponent={InputPanel}
        resultComponent={<ResultDisplay isLoading={isLoading} resultText={resultText} />}
      />
      <div className="flex justify-center mt-4">
        <button
          className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          onClick={handleProofread}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? "Proofreading..." : "Proofread"}
        </button>
      </div>
    </PageLayout>
  );
};

export default ProofreaderPage;