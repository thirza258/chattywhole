import { useState } from "react";
import services from "../../services/services";
import type { Response } from "../../interface";
// Import new components
import PageLayout from "../../components/PageLayout";
import ResultDisplay from "../../components/ResultDisplay";
import TwoColumnLayout from "../../components/TwoColumnLayout";

const EmailBuilderPage: React.FC = () => {
  const [formData, setFormData] = useState({ context: '', recipients: '', sender: '', prompt: '' });
  const [resultText, setResultText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({ context: '', recipients: '', sender: '', prompt: '' });
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

  const InputPanel = (
    <div className="bg-white rounded-lg shadow-md flex flex-col outline outline-1 outline-gray-800 p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Input Details</h2>
      
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
          disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Email Builder"
      description="Craft professional emails by providing the context, recipients, sender, and a specific prompt. Let the AI handle the composition."
      onClear={handleClearForm}
    >
      <TwoColumnLayout
        inputComponent={InputPanel}
        resultComponent={
            <ResultDisplay 
                isLoading={isLoading} 
                resultText={resultText} 
                placeholderText="Your generated email will appear here..."
            />
        }
      />
      <div className="flex justify-center mt-4">
        <button
          className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          onClick={handleGenerateEmail}
          disabled={isFormIncomplete || isLoading}
        >
          {isLoading ? "Generating..." : "Generate Email"}
        </button>
      </div>
    </PageLayout>
  );
};

export default EmailBuilderPage;