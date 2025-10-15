import React from 'react';
import ReactMarkdown from "react-markdown";

interface SidebarProps {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  history: {
    method: string;
    prompt: string;
    response: string;
    created_at: string;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTool, setSelectedTool, history }) => {
  const tools = [
    "Prompt",
    "Proofreader", 
    "Rewriter",
    "Summarizer",
    "Translator",
    "Writer",
    "Copywriting",
    "Explainer",
    "Coming soon..."
  ];

  return (
    <div className="w-1/4 bg-gray-200 h-full p-4 border-r-2 border-white z-10 shadow-lg flex-shrink-0 flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="mb-4 text-xl font-semibold">Tools</h2>
        <div className="max-h-48 overflow-y-auto">
          <ul className="grid grid-cols-2 gap-2">
            {tools.map((tool) => (
              <li key={tool} className="mb-2">
                <a
                  href="#"
                  className={`block p-2 rounded hover:bg-gray-300 ${selectedTool === tool ? "font-bold bg-gray-300" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedTool(tool);
                  }}
                >
                  {tool}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <hr className="my-4 border-t-2 border-gray-400" />
        <h2 className="mb-4 text-xl font-semibold">History</h2>
      </div>
      <div className="overflow-y-auto flex-grow">
        {history.length > 0 ? (
          history.map((entry, index) => (
            <div
              key={index}
              className="mb-4 p-4 bg-white shadow rounded-lg border border-gray-300"
            >
              <h3 className="font-bold text-lg mb-2">{entry.method}</h3>
              <div className="text-sm text-gray-800 space-y-2">
                <div>
                  <strong>Prompt:</strong> {entry.prompt.slice(0, 100)}
                </div>
                <div>
                  <strong>Response:</strong> <ReactMarkdown>{entry.response.slice(0, 100)}</ReactMarkdown>
                </div>
              
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">
                {new Date(entry.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No history available.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;