import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import services from './services/services';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';

// Import all your page components
import ApiKeyPage from './pages/ApiPage'; // Import the new page
import PromptPage from './pages/PromptPage';
import ProofreaderPage from './pages/ProofreaderPage';
import RewriterPage from './pages/RewriterPage';
import SummarizerPage from './pages/SummarizerPage';
import TranslatorPage from './pages/TranslatorPage';
import WriterPage from './pages/WriterPage';

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [selectedTool, setSelectedTool] = useState("Prompt");
  const [history, setHistory] = useState([]);

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

  const renderSelectedPage = () => {
    switch (selectedTool) {
      case "Prompt": return <PromptPage />;
      case "Proofreader": return <ProofreaderPage />;
      case "Rewriter": return <RewriterPage />;
      case "Summarizer": return <SummarizerPage />;
      case "Translator": return <TranslatorPage />;
      case "Writer": return <WriterPage />;
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
      /> 
      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          selectedTool={selectedTool} 
          setSelectedTool={setSelectedTool} 
          history={history} 
        />
        <main className="flex-grow overflow-y-auto p-6">
          {renderSelectedPage()}
        </main>
      </div>
    </div>
  );
}

export default App;