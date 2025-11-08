import React from 'react';

interface TwoColumnLayoutProps {
  inputComponent: React.ReactNode;
  resultComponent: React.ReactNode;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({ inputComponent, resultComponent }) => {
  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
      {inputComponent}
      {resultComponent}
    </div>
  );
};

export default TwoColumnLayout;