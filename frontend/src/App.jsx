import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://four32hz-frequency-checker-1.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">432Hz Frequency Checker</h2>
        
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        
        <button 
          onClick={handleSubmit} 
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          disabled={!file || isLoading}
        >
          Check Frequency
        </button>

        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {result && !isLoading && (
          <p className="mt-4 text-gray-700">{result}</p>
        )}
      </div>
    </div>
  );
}

export default App;
