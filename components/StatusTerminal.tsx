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

  // Check if task is complete
  const isTaskComplete = task && (task.state === 'success' || task.state === 'fail');
  // Show logs only if task is pending or failed
  const shouldShowLogs = logs.length > 0 && (!isTaskComplete);

  return (
    <div className="flex flex-col h-full gap-4 relative">
      {/* Result Display - Takes Priority */}
      {resultUrl && (
        <div className="border-2 border-orange-500 p-1 bg-zinc-900 relative flex-shrink-0">
          <div className="absolute top-0 left-0 bg-orange-500 text-black text-xs font-bold px-2 py-0.5 z-10">OUTPUT_FEED</div>
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

      {/* Status Panel */}
      {task && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 flex-shrink-0">
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
               <span className="text-zinc-200 select-all break-all">{task.taskId.slice(0, 16)}...</span>
             </div>
             <div>
               <span className="block text-zinc-600 mb-1">MODEL</span>
               <span className="text-zinc-300">{task.model}</span>
             </div>
             <div>
                <span className="block text-zinc-600 mb-1">CREATED</span>
                <span className="text-zinc-300">{new Date(task.createTime).toLocaleTimeString()}</span>
             </div>
             {task.costTime && (
                <div>
                  <span className="block text-zinc-600 mb-1">DURATION</span>
                  <span className="text-green-400">{task.costTime}ms</span>
                </div>
             )}
          </div>
        </div>
      )}

      {/* Spacer - Grows to fill available space */}
      <div className="flex-grow"></div>

      {/* System Log - Floating at Bottom with Gradient */}
      {shouldShowLogs && (
        <div className="absolute bottom-0 left-0 right-0 max-h-[180px] overflow-y-auto">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none"></div>
          
          {/* Log Content */}
          <div className="relative z-10 font-mono text-xs text-zinc-400 px-4 pt-8 pb-4 space-y-1">
            {logs.slice(0, 8).map((log, i) => (
              <div key={i} className="border-l-2 border-zinc-800 pl-2 text-zinc-300 hover:text-orange-400 transition-colors">
                <span className="text-orange-600 mr-2 text-[9px]">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-[10px]">{log}</span>
              </div>
            ))}
            {logs.length > 8 && (
              <div className="text-zinc-600 text-[10px] italic pl-2">
                ... +{logs.length - 8} more messages
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};