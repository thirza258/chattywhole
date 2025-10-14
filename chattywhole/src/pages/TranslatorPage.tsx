import React, { useState } from 'react'; 
import services from '../services/services';
import type { Response } from '../interface';
import ReactMarkdown from 'react-markdown';

const TranslatorPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('es'); 

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
    // You can add your logic here to process the input and set the result
    setResultText(`Processed: ${event.target.value}`);
    setResultText(services.handleResponseData(event.target.value));
  }; 

  const handleTranslate = async () => {
    try {
      const response: Response = await services.postTranslator(inputText, targetLang, sourceLang);
      setResultText(services.handleResponseData(response.data));
      setInputText(response.data);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ]; 

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Translator Page</h1>
        </div>
      </header> 

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col">
        {/* Language Selection */}
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/2 pr-2">
            <label htmlFor="source-lang" className="text-lg font-semibold text-gray-700">Source Language</label>
            <select
              id="source-lang"
              className="w-full mt-1 p-2 border rounded-md"
              value={sourceLang}
              onChange={e => setSourceLang(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div className="w-1/2 pl-2">
            <label htmlFor="target-lang" className="text-lg font-semibold text-gray-700">Target Language</label>
            <select
              id="target-lang"
              className="w-full mt-1 p-2 border rounded-md"
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
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
              onBlur={handleTranslate}
            />
          </div> 

          {/* Right Column (Result) */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="w-full h-full p-4 rounded-lg">
              <ReactMarkdown>{resultText as string}</ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 

export default TranslatorPage;