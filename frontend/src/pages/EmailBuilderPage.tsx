import { useState } from "react";
import services from "../services/services";
import type { Response } from "../interface"; // Assuming you have a Response interface
import ReactMarkdown from "react-markdown";

const EmailBuilderPage: React.FC = () => {
  const [formData, setFormData] = useState({
    context: '',
    recipients: '',
    sender: '',
    prompt: '',
  });
  const [resultText, setResultText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({
      context: '',
      recipients: '',
      sender: '',
      prompt: '',
    });
    setResultText('');
  };

  const handleGenerateEmail = async () => {
    setIsLoading(true);
    setResultText('');
    try {
      const { context, recipients, sender, prompt } = formData;
      const response: Response = await services.createEmail(context, recipients, sender, prompt);
      setResultText(services.handleResponseData(response.data));
    } catch (error) {
      console.error("Error fetching response:", error);
      setResultText("Sorry, there was an error generating the email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormIncomplete = !formData.context || !formData.recipients || !formData.sender || !formData.prompt;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Email Builder</h1>
          <p className="text-gray-600 mt-2">Craft professional emails by providing the context, recipients, sender, and a specific prompt. Let the AI handle the composition.</p>
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
            <h2 className="text-lg font-semibold text-gray-700">Generated Email</h2>
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
              <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
                What is the context of the email?
              </label>
              <textarea
                id="context"
                name="context"
                className="w-full p-2 rounded-md resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Following up on our meeting last Tuesday about the Q3 marketing campaign."
                value={formData.context}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
                Who are the recipients?
              </label>
              <textarea
                id="recipients"
                name="recipients"
                className="w-full p-2 rounded-md resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., The marketing team, John Doe (john.doe@example.com)"
                value={formData.recipients}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="sender" className="block text-sm font-medium text-gray-700 mb-1">
                Who is the sender?
              </label>
              <input
                id="sender"
                name="sender"
                type="text"
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Jane Smith, Project Manager"
                value={formData.sender}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                What should the email be about? (Prompt)
              </label>
              <textarea
                id="prompt"
                name="prompt"
                className="w-full p-2 rounded-md resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Write a concise summary of the key decisions and action items."
                value={formData.prompt}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800">
            <div className="w-full h-full p-4 rounded-lg prose">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Generating email...</p>
                </div>
              ) : (
                <ReactMarkdown>
                  {resultText || "Your generated email will appear here..."}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            onClick={handleGenerateEmail}
            disabled={isFormIncomplete || isLoading}
          >
            {isLoading ? "Generating..." : "Generate Email"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default EmailBuilderPage;