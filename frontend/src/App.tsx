import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Import routing components
import { v4 as uuidv4 } from 'uuid';
import services from './services/services';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import AboutPage from './pages/about/AboutPage';
import ApiKeyPage from './pages/api-insert-page/ApiPage';

import PromptPage from './pages/ai-service-page/PromptPage';
import ProofreaderPage from './pages/ai-service-page/ProofreaderPage';
import RewriterPage from './pages/ai-service-page/RewriterPage';
import SummarizerPage from './pages/ai-service-page/SummarizerPage';
import TranslatorPage from './pages/ai-service-page/TranslatorPage';
import WriterPage from './pages/ai-service-page/WriterPage';
import CopyWritingPage from './pages/ai-service-page/CopyWritingPage';
import ExplainerPage from './pages/ai-service-page/ExplainerPage';
import RAGPage from './pages/ai-service-page/RAGPage';
import InsertFile from './pages/insert-page/InsertFile';
import ImaGenPage from './pages/ai-service-page/ImaGenPage';
import EmailBuilderPage from './pages/ai-service-page/EmailBuilderPage';

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [selectedTool, setSelectedTool] = useState("Prompt");
  const [history, setHistory] = useState([]);
  const [isRagChatActive, setIsRagChatActive] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const navigate = useNavigate(); // Hook to programmatically navigate

  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey');
    if (storedKey) {
      setHasApiKey(true);
    }

    if (!localStorage.getItem('conversationId')) {
      localStorage.setItem('conversationId', uuidv4());
    }
  }, []);


  useEffect(() => {
    if (!hasApiKey) return;

    const fetchHistory = async () => {
      try {
        const response = await services.getHistory();
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
  }, [hasApiKey]);

  const handleKeySubmission = () => {
    setHasApiKey(true);
  };

  const handleClearKey = () => {
    localStorage.removeItem('apiKey');
    setHasApiKey(false);
  };

  const handleToolSelection = (tool: string) => {
    setSelectedTool(tool);
    setIsRagChatActive(false);
    navigate('/'); // Navigate to the main page when a tool is selected
  };

  const handleClearDocument = () => {
    setIsRagChatActive(false);
    setSelectedTool("Document AI");
    setDocumentName("");
  };

  const renderSelectedPage = () => {
    switch (selectedTool) {
      case "Prompt": return <PromptPage />;
      case "Proofreader": return <ProofreaderPage />;
      case "Rewriter": return <RewriterPage />;
      case "Summarizer": return <SummarizerPage />;
      case "Translator": return <TranslatorPage />;
      case "Writer": return <WriterPage />;
      case "Copywriting": return <CopyWritingPage />;
      case "Explainer": return <ExplainerPage />;
      case "Document AI": return isRagChatActive ? <RAGPage documentName={documentName} /> : <InsertFile onUploadSuccess={(documentName) => {setDocumentName(documentName); setIsRagChatActive(true)}} />;
      case "Image Generation": return <ImaGenPage />;
      case "Email Builder": return <EmailBuilderPage />;
      default: return <PromptPage />;
    }
  };

  if (!hasApiKey) {
    return <ApiKeyPage onKeySubmit={handleKeySubmission} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <NavBar
        selectedTool={selectedTool}
        hasApiKey={hasApiKey}
        onClearApiKey={handleClearKey}
        onClearDocument={handleClearDocument}
      />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          selectedTool={selectedTool}
          setSelectedTool={handleToolSelection}
          history={history}
        />
        <main className="flex-grow overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={renderSelectedPage()} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;