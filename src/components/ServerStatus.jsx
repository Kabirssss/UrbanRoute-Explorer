import React, { useState, useEffect } from 'react';

const ServerStatus = () => {
  const [status, setStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);

  const checkServer = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Server check failed:', err);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkServer();
    
    // Retry connection a few times
    const interval = setInterval(() => {
      if (status === 'error' && retryCount < 5) {
        console.log('Retrying server connection...');
        setRetryCount(prev => prev + 1);
        checkServer();
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, retryCount]);

  const handleManualRetry = () => {
    setStatus('checking');
    setRetryCount(0);
    checkServer();
  };

  if (status === 'checking') {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">Connecting to server...</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p><strong>Server Connection Error:</strong> Unable to connect to the backend server.</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm">Please ensure the server is running at http://localhost:5000.</p>
          <button onClick={handleManualRetry} className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-2 rounded">
            Retry
          </button>
        </div>
        <div className="mt-3 text-sm">
          <p className="font-semibold">Troubleshooting steps:</p>
          <ol className="list-decimal list-inside ml-2">
            <li>Check if the server is running in the terminal</li>
            <li>Try restarting the server: <code>cd server && npm run dev</code></li>
            <li>Ensure MongoDB is running (if required)</li>
            <li>Check for errors in the server console</li>
          </ol>
        </div>
      </div>
    );
  }

  return null;
};

export default ServerStatus;
