
import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript' }) => {
  return (
    <div className="bg-slate-950 rounded-lg shadow-inner overflow-hidden my-4">
      <div className="bg-slate-700/50 px-4 py-2 text-xs text-sky-300 font-semibold">
        {language.toUpperCase()}
      </div>
      <pre className="p-4 text-sm text-slate-200 overflow-x-auto font-mono">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
