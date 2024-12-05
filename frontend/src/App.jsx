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
    
    // More detailed frequency interpretation
    if (Math.abs(freq - 432) <= 2) {
      return "🎵 Perfect 432 Hz - Known as 'Verdi's A' or the 'natural frequency'. This frequency:\n" +
             "• Aligns with the natural vibrations of the universe (Pi and Phi ratios)\n" +
             "• Was favored by classical composers like Mozart and Verdi\n" +
             "• Is believed to promote healing and spiritual well-being\n" +
             "• Creates a warmer, more relaxing sound experience\n" +
             "• Resonates with the heart chakra frequency";
    } else if (freq >= 430 && freq < 432) {
      return "🎵 Very close to 432 Hz (slightly flat). This frequency still carries many beneficial properties of the 432 Hz resonance. Consider fine-tuning slightly upward for perfect alignment.";
    } else if (freq > 432 && freq <= 434) {
      return "🎵 Very close to 432 Hz (slightly sharp). This frequency maintains most benefits of the 432 Hz resonance. Consider fine-tuning slightly downward for perfect alignment.";
    } else if (Math.abs(freq - 440) <= 2) {
      return "🎼 Perfect 440 Hz - The modern concert pitch standard:\n" +
             "• Established as the international standard in 1955\n" +
             "• Used in most contemporary music\n" +
             "• Creates a brighter, more brilliant sound\n" +
             "• Some argue it may create subtle tension in the listener\n" +
             "• Excellent for performances requiring high energy";
    } else if (freq >= 438 && freq < 440) {
      return "🎼 Very close to 440 Hz (slightly flat). This is within acceptable range for modern concert pitch, though some fine-tuning upward might be desired for strict concert standards.";
    } else if (freq > 440 && freq <= 442) {
      return "🎼 Very close to 440 Hz (slightly sharp). This is within acceptable range for modern concert pitch, though some orchestras intentionally tune slightly sharp for a brighter sound.";
    } else if (freq < 430) {
      return `⬇️ Low frequency (${freq} Hz):\n` +
             "• Creates deeper, more grounding tones\n" +
             "• Associated with root and sacral chakras\n" +
             "• May induce calming, meditative states\n" +
             "• Good for meditation and relaxation music\n" +
             "• Consider tuning higher if aiming for 432 Hz or 440 Hz standard";
    } else if (freq > 442) {
      return `⬆️ High frequency (${freq} Hz):\n` +
             "• Produces brighter, more energetic tones\n" +
             "• Associated with crown and third-eye chakras\n" +
             "• May increase alertness and energy\n" +
             "• Common in some Eastern musical traditions\n" +
             "• Consider tuning lower if aiming for 432 Hz or 440 Hz standard";
    } else {
      return `🎵 Intermediate frequency (${freq} Hz):\n` +
             "• Falls between common tuning standards\n" +
             "• May create unique tonal characteristics\n" +
             "• Consider adjusting toward 432 Hz for natural resonance\n" +
             "• Or tune to 440 Hz for modern standard alignment";
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
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            file:cursor-pointer cursor-pointer
            focus:outline-none"
        />
        {fileSizeError && (
          <p className="mt-2 text-red-500">{fileSizeError}</p>
        )}
        
        <button 
          onClick={handleSubmit} 
          className="mt-4 w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 
            transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
            font-medium text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
          disabled={!file || isLoading}
        >
          {isLoading ? 'Processing...' : 'Check Frequency'}
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
