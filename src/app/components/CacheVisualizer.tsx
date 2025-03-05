// CacheVisualizer.tsx
import { useState } from 'react';

interface CacheItem {
  data: any[];
  totalItems: number;
  totalPages: number;
  timestamp: number;
}

interface CacheVisualizerProps {
  cache: Record<string, CacheItem>;
  cacheExpiry: number;
}

export default function CacheVisualizer({ cache, cacheExpiry }: CacheVisualizerProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const cacheKeys = Object.keys(cache);
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const timeAgo = Math.round((Date.now() - timestamp) / 1000);
    
    return {
      formatted: date.toLocaleTimeString(),
      timeAgo: timeAgo < 60 ? `${timeAgo}s ago` : 
               timeAgo < 3600 ? `${Math.floor(timeAgo/60)}m ago` :
               `${Math.floor(timeAgo/3600)}h ago`
    };
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleVisibility}
        className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg hover:bg-gray-700"
      >
        {isVisible ? 'Hide Cache' : 'Show Cache'}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-[400px] max-h-[500px] overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          <h3 className="text-lg font-bold mb-2">Cache Contents ({cacheKeys.length} entries)</h3>
          
          {cacheKeys.length === 0 ? (
            <p className="text-gray-500">Cache is empty</p>
          ) : (
            <div className="space-y-4">
              {cacheKeys.map(key => {
                const item = cache[key];
                const { formatted, timeAgo } = formatTimestamp(item.timestamp);
                
                return (
                  <div key={key} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between">
                      <h4 className="font-semibold text-sm">{key}</h4>
                      <span className="text-xs text-gray-500" title={formatted}>{timeAgo}</span>
                    </div>
                    <div className="text-xs mt-1 text-gray-600">
                      <p>Items: {item.data.length} / {item.totalItems}</p>
                      <p>Pages: {item.totalPages}</p>
                      <details>
                        <summary className="cursor-pointer hover:text-blue-600">Show Data</summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
                          {JSON.stringify(item.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-xs text-gray-500">Cache expiry: {cacheExpiry/1000/60} minutes</p>
          </div>
        </div>
      )}
    </div>
  );
}