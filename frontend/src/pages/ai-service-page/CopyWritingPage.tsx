import { useState } from "react";
import services from "../../services/services";
import type { Response } from "../../interface";
import ReactMarkdown from "react-markdown";

const CopyWritingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    product: '',
    goals: '',
    audience: '',
    usp: '',
  });
  const [resultText, setResultText] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({
      product: '',
      goals: '',
      audience: '',
      usp: '',
    });
    setResultText('');
  };

  const handleGenerateCopy = async () => {
    try {
      const payload = `
        Product/Service: ${formData.product}
        Goals/Objectives: ${formData.goals}
        Target Audience: ${formData.audience}
        Unique Selling Proposition: ${formData.usp}
      `;
      const response: Response = await services.postCopywriting(payload); 
      setResultText(services.handleResponseData(response.data));
    } catch (error) {
      console.error("Error fetching response:", error);
      setResultText("Sorry, there was an error generating the copy. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Copywriting Assistant</h1>
          <p className="text-gray-600 mt-2">Generate compelling marketing copy by providing key details about your product, goals, and audience. Let our AI craft the perfect message for you.</p>
          <button
            onClick={handleClearForm}
            className="mt-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
          >
            Clear Form
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Input Details</h2>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">Results</h2>
            <button
              onClick={() => navigator.clipboard.writeText(resultText)}
              className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
              disabled={!resultText}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Input Section */}
          <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800 p-4 space-y-4">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                What is your product or service?
              </label>
              <textarea
                id="product"
                name="product"
                className="w-full p-2 rounded-md resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., A mobile app for budget tracking"
                value={formData.product}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-1">
                What are your goals and objectives?
              </label>
              <textarea
                id="goals"
                name="goals"
                className="w-full p-2 rounded-md resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Increase user sign-ups by 20%"
                value={formData.goals}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                Who is your target audience?
              </label>
              <textarea
                id="audience"
                name="audience"
                className="w-full p-2 rounded-md resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Millennials aged 25-35 interested in personal finance"
                value={formData.audience}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="usp" className="block text-sm font-medium text-gray-700 mb-1">
                What is your unique selling proposition (USP)?
              </label>
              <textarea
                id="usp"
                name="usp"
                className="w-full p-2 rounded-md resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., We automatically categorize expenses using AI"
                value={formData.usp}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800">
            <div className="w-full h-full p-4 rounded-lg prose">
              <ReactMarkdown>
                {resultText || "Your generated copy will appear here..."}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleGenerateCopy}
          >
            Generate CopyWriting
          </button>
        </div>
      </main>
    </div>
  );
};

export default CopyWritingPage;