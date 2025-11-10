import { useState } from "react";
import services from "../../services/services";
import type { Response } from "../../interface";
import PageLayout from "../../components/PageLayout";
import ResultDisplay from "../../components/ResultDisplay";
import TwoColumnLayout from "../../components/TwoColumnLayout";

const SentimentPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClear = () => {
    setInputText('');
    setResultText('');
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResultText('');
    try {
      // Assuming you have a service function for this
      const response: Response = await services.analyzeSentiment(inputText);
      setResultText(services.handleResponseData(response.data));
    } catch (error) {
      console.error("Error fetching response:", error);
      setResultText("Sorry, there was an error analyzing the text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const InputPanel = (
    <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800">
      <div className="flex justify-between items-center p-2 border-b">
        <h2 className="text-lg font-semibold text-gray-700">Text to Analyze</h2>
        <button
          onClick={() => navigator.clipboard.readText().then(text => setInputText(text))}
          className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
        >
          Paste
        </button>
      </div>
      <textarea
        className="w-full flex-grow p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter text to analyze its sentiment..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isLoading}
      />
    </div>
  );

  return (
    <PageLayout
      title="Sentiment Analysis"
      description="Analyze the sentiment of any text. Discover if the tone is positive, negative, or neutral."
      onClear={handleClear}
    >
      <TwoColumnLayout
        inputComponent={InputPanel}
        resultComponent={
            <ResultDisplay 
                isLoading={isLoading} 
                resultText={resultText}
                placeholderText="The sentiment analysis will appear here..." 
            />
        }
      />
      <div className="flex justify-center mt-4">
        <button
          className="w-full bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300"
          onClick={handleAnalyze}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze Sentiment"}
        </button>
      </div>
    </PageLayout>
  );
};

export default SentimentPage;