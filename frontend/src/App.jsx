import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileSizeError, setFileSizeError] = useState('');
  const [frequencyMeaning, setFrequencyMeaning] = useState('');

  const interpretFrequency = (frequency) => {
    if (!frequency) return '';
    
    // Extract the numeric frequency value from the result string
    const match = frequency.match(/(\d+\.?\d*)/);
    if (!match) return '';
    
    const freq = parseFloat(match[1]);
    
    if (Math.abs(freq - 432) <= 5) {
      return "🎵 This frequency is close to 432 Hz - known as 'Verdi's A' or the 'natural frequency'. Historically used by classical composers like Mozart and Verdi, this frequency is believed to be mathematically consistent with the patterns of the universe and nature. Some people report feeling more relaxed and centered when listening to music tuned to 432 Hz.";
    } else if (Math.abs(freq - 440) <= 5) {
      return "🎼 This frequency is close to 440 Hz - the modern standard pitch (A4) established in 1955. Most contemporary music is tuned to this frequency. While it's the current standard, some argue it creates a slightly more tense or energetic feeling compared to 432 Hz.";
    } else if (freq < 432) {
      return "⬇️ This frequency is below 432 Hz. Lower frequencies generally create deeper, more grounding tones. In some musical traditions, lower frequencies are associated with root chakras and earthing energies.";
    } else {
      return "⬆️ This frequency is above 432 Hz. Higher frequencies typically create brighter, more energetic tones. In some traditions, higher frequencies are associated with higher chakras and spiritual awakening.";
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) { // 20MB in bytes
      setFileSizeError('File size should not exceed 20MB.');
      setFile(null); // Clear the file state
    } else {
      setFileSizeError(''); // Clear the error message
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setFrequencyMeaning('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://four32hz-frequency-checker-1.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data.message);
      setFrequencyMeaning(interpretFrequency(data.message));
    } catch (error) {
      setResult("An error occurred. Please try again.");
      setFrequencyMeaning('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center mx-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">432Hz Frequency Checker</h2>
        <p className="text-lg text-gray-500 mb-4">If it fails at first try, submit it again. The backend sleeps when it detects no activity.</p>
        
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        {fileSizeError && (
          <p className="mt-2 text-red-500">{fileSizeError}</p>
        )}
        
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
          <div className="mt-4 space-y-4">
            <p className="text-gray-700 font-semibold">{result}</p>
            {frequencyMeaning && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm leading-relaxed">{frequencyMeaning}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
