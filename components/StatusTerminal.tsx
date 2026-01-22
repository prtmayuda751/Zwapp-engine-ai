import React from 'react';
import { TaskRecordInfo, ParsedResult } from '../types';

interface StatusTerminalProps {
  task: TaskRecordInfo | null;
  logs: string[];
}

export const StatusTerminal: React.FC<StatusTerminalProps> = ({ task, logs }) => {
  let resultUrl = '';
  let isVideo = false;
  
  if (task?.state === 'success' && task.resultJson) {
    try {
      const parsed: ParsedResult = JSON.parse(task.resultJson);
      if (parsed.resultUrls && parsed.resultUrls.length > 0) {
        resultUrl = parsed.resultUrls[0];
        const lowerUrl = resultUrl.toLowerCase();
        if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.mov')) {
            isVideo = true;
        }
      }
    } catch (e) {
      console.error("Failed to parse result JSON");
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Terminal Log Output */}
      <div className="bg-zinc-950 border border-zinc-700 p-4 font-mono text-xs md:text-sm h-64 md:h-96 overflow-y-auto shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative">
        <div className="absolute top-2 right-2 text-zinc-600 select-none">SYS.LOG.V1</div>
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-zinc-400 border-l-2 border-zinc-800 pl-2">
              <span className="text-orange-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
          {!task && logs.length === 0 && (
            <div className="text-zinc-600 italic">No active operations. Standby...</div>
          )}
          <div className="w-2 h-4 bg-orange-500 animate-pulse inline-block align-middle ml-1"></div>
        </div>
      </div>

      {/* Status Panel */}
      {task && (
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
            <span className="text-orange-500 font-bold tracking-widest uppercase text-sm">Operation Status</span>
            <span className={`px-2 py-0.5 text-xs font-bold uppercase ${
              task.state === 'success' ? 'bg-green-900 text-green-400' :
              task.state === 'fail' ? 'bg-red-900 text-red-400' :
              'bg-orange-900/40 text-orange-400 animate-pulse'
            }`}>
              {task.state}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-400">
             <div>
               <span className="block text-zinc-600 mb-1">TASK ID</span>
               <span className="text-zinc-200 select-all">{task.taskId}</span>
             </div>
             <div>
               <span className="block text-zinc-600 mb-1">MODEL</span>
               {task.model}
             </div>
             <div>
                <span className="block text-zinc-600 mb-1">CREATED</span>
                {new Date(task.createTime).toLocaleString()}
             </div>
             {task.costTime && (
                <div>
                  <span className="block text-zinc-600 mb-1">DURATION</span>
                  {task.costTime}ms
                </div>
             )}
          </div>
        </div>
      )}

      {/* Result Display */}
      {resultUrl && (
        <div className="border-2 border-orange-500 p-1 bg-zinc-900 relative">
          <div className="absolute top-0 left-0 bg-orange-500 text-black text-xs font-bold px-2 py-0.5">OUTPUT_FEED</div>
          {isVideo ? (
            <video 
                src={resultUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full aspect-video bg-black object-contain"
            />
          ) : (
            <img 
                src={resultUrl}
                alt="Generated Output"
                className="w-full h-auto max-h-[500px] bg-black object-contain border border-zinc-800"
            />
          )}
          
          <div className="mt-2 text-center">
             <a 
               href={resultUrl} 
               target="_blank" 
               rel="noreferrer"
               className="inline-block text-xs text-orange-500 hover:text-orange-400 underline decoration-dotted underline-offset-4"
             >
               DOWNLOAD RAW ARTIFACT
             </a>
          </div>
        </div>
      )}
    </div>
  );
};