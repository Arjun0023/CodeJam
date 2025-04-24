// Home.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQueries, setShowQuickQueries] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQueries = [
    "Detect brute-force attacks or unauthorized access attempts.",
    "Find failed login attempts.",
    "Track server errors over time.",
    "Monitor product purchases per day."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQuickQuery = async (query) => {
    await sendQuery(query);
    setShowQuickQueries(false);
  };

  const sendQuery = async (queryText) => {
    // Add user message to the chat
    const userMessage = { role: 'user', content: queryText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Make API call
      const response = await fetch('http://127.0.0.1:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText }),
      });

      const data = await response.json();
      
      // Add assistant message to the chat
      const assistantMessage = { 
        role: 'assistant', 
        content: data,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: { 
          summary: "Sorry, there was an error processing your request. Please try again."
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendQuery(input);
    setShowQuickQueries(false);
  };

  // Format and display the SPL query with syntax highlighting
  const formatSPLQuery = (query) => {
    return (
      <div className="bg-gray-100 p-4 rounded-md my-2 overflow-x-auto">
        <pre className="text-sm font-mono whitespace-pre-wrap">{query}</pre>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-800">SPL Query Assistant</h1>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-xl">Ask a question about SPL queries</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              {message.role === 'user' ? (
                <p>{message.content}</p>
              ) : (
                <div className="space-y-4">
                  {message.content.spl_query && (
                    <div>
                      <h3 className="font-semibold mb-1">SPL Query:</h3>
                      {formatSPLQuery(message.content.spl_query)}
                    </div>
                  )}
                  {message.content.summary && (
                    <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>
                        {message.content.summary}
                    </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-3xl">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white p-4">
        {/* Quick Query Buttons */}
        
          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuery(query)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-md text-sm text-left transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your query here..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;