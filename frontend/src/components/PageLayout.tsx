import React from 'react';

interface PageLayoutProps {
  title: string;
  description: string;
  onClear: () => void;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, description, onClear, children }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>
          <button
            onClick={onClear}
            className="mt-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
          >
            Clear
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;