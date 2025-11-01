import React from 'react';
import FeatureCard from '../../components/FeatureCard';

const AboutPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          About Nevatal
        </h1>
        
        <p className="text-gray-600 mb-8 text-center">
          Nevatal is a comprehensive AI application that combines multiple AI functionalities into a single, easy-to-use platform. 
          Our platform integrates various AI capabilities to help streamline your workflow.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Features</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FeatureCard title="Prompt-based Interactions" 
              description="Intuitive interface for AI interactions through natural language prompts" />
            <FeatureCard title="Proofreading Assistance" 
              description="Advanced proofreading tools to perfect your writing" />
            <FeatureCard title="Text Summarization" 
              description="Quick and accurate summarization of long-form content" />
            <FeatureCard title="Translation Services" 
              description="High-quality translation across multiple languages" />
            <FeatureCard title="Content Writing" 
              description="AI-powered content creation and rewriting capabilities" />
          </div>
          
          <div className="space-y-4">
            <FeatureCard title="AI Explanations" 
              description="Clear explanations of complex topics using AI" />
            <FeatureCard title="Copywriting Assistance" 
              description="Professional copywriting help for marketing and content" />
            <FeatureCard title="Document AI" 
              description="Advanced document processing and analysis" />
            <FeatureCard title="RAG Chat" 
              description="Retrieval Augmented Generation for context-aware conversations" />
          </div>
        </div>
      </div>
    </div>
  );
};


export default AboutPage;
