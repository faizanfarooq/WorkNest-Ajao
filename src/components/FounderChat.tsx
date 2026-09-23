import React, { useState } from 'react';
import { 
  Send, 
  Code2, 
  Paperclip, 
  Calendar, 
  CheckCheck, 
  Video, 
  ExternalLink, 
  Smile,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { ChatThread, ChatMessage, CandidateProfile } from '../types';

interface FounderChatProps {
  threads: ChatThread[];
  messagesMap: Record<string, ChatMessage[]>;
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onSendMessage: (threadId: string, text: string, codeSnippet?: { language: string; code: string }) => void;
  onOpenScheduleModal: (startupId: string, startupName: string, founderName: string) => void;
  candidate: CandidateProfile;
}

export const FounderChat: React.FC<FounderChatProps> = ({
  threads,
  messagesMap,
  activeThreadId,
  onSelectThread,
  onSendMessage,
  onOpenScheduleModal,
  candidate,
}) => {
  const [inputText, setInputText] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippetText, setCodeSnippetText] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('go');

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];
  const messages = (activeThread ? messagesMap[activeThread.id] : []) || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !codeSnippetText.trim()) return;

    const code = showCodeInput && codeSnippetText.trim() ? {
      language: codeLanguage,
      code: codeSnippetText.trim()
    } : undefined;

    onSendMessage(activeThread.id, inputText.trim(), code);
    setInputText('');
    setCodeSnippetText('');
    setShowCodeInput(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[720px]">
      {/* Left Sidebar: Threads List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-extrabold text-slate-900 text-sm">Direct Founder Channels</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Direct async communication with technical decision-makers</p>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {threads.map((thread) => {
            const isSelected = thread.id === activeThread?.id;
            return (
              <button
                key={thread.id}
                id={`chat-thread-${thread.id}`}
                onClick={() => onSelectThread(thread.id)}
                className={`w-full p-3 rounded-xl text-left transition-all flex items-start space-x-3 cursor-pointer ${
                  isSelected 
                    ? 'bg-white border border-slate-300/80 shadow-xs' 
                    : 'hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={thread.founderAvatar}
                    alt={thread.founderName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  {thread.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {thread.founderName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {thread.lastMessageTimestamp}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-indigo-600 truncate mt-0.5">
                    {thread.startupName}
                  </p>

                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {thread.lastMessageText}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Area: Active Chat Window */}
      {activeThread ? (
        <div className="flex-1 flex flex-col h-full bg-white">
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center space-x-3">
              <img
                src={activeThread.founderAvatar}
                alt={activeThread.founderName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm">{activeThread.founderName}</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] text-slate-500 font-medium">Founder / CTO</span>
                </div>
                <p className="text-xs text-indigo-600 font-semibold truncate max-w-sm">
                  {activeThread.startupName} • {activeThread.projectTitle}
                </p>
              </div>
            </div>

            {/* Quick action: Schedule tech discussion */}
            <button
              id="chat-header-schedule-btn"
              onClick={() => onOpenScheduleModal(activeThread.startupId, activeThread.startupName, activeThread.founderName)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center space-x-1.5 border border-indigo-200 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Schedule Tech Chat</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono">
                Encrypted Peer-to-Peer Communication Channel
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderRole === 'candidate';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                  />

                  <div className={`space-y-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-2 px-1">
                      <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                    </div>

                    {/* Text bubble */}
                    {msg.text && (
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-slate-900 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* Code Snippet attachment if any */}
                    {msg.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-emerald-400 p-3 font-mono text-xs max-w-lg">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
                          <span>Snippet: {msg.codeSnippet.language}</span>
                          <span>AST Verified</span>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                          {msg.codeSnippet.code}
                        </pre>
                      </div>
                    )}

                    {/* File Attachment if any */}
                    {msg.attachment && (
                      <div className="flex items-center space-x-2.5 p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{msg.attachment.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{msg.attachment.size}</span>
                        </div>
                      </div>
                    )}

                    {/* Meeting Schedule Invite card if present */}
                    {msg.scheduleInvite && (
                      <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-xs max-w-sm space-y-2">
                        <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                          <Video className="w-4 h-4 text-indigo-600" />
                          <span>Virtual Technical Review Invite</span>
                        </div>
                        <p className="text-xs text-indigo-950 font-semibold">
                          {msg.scheduleInvite.topic}
                        </p>
                        <div className="text-[11px] text-indigo-700 flex items-center space-x-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{msg.scheduleInvite.dateTime}</span>
                        </div>
                        <div className="pt-2">
                          <a
                            href={msg.scheduleInvite.meetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors"
                          >
                            <span>Open Virtual Room</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Code Input Box (Collapsible) */}
          {showCodeInput && (
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 flex items-center space-x-1">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Attach Code / Architecture Snippet</span>
                </span>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs px-2 py-0.5 rounded border border-slate-700 font-mono outline-none"
                >
                  <option value="go">Go (Golang)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="terraform">Terraform</option>
                  <option value="yaml">YAML / Docker</option>
                </select>
              </div>
              <textarea
                value={codeSnippetText}
                onChange={(e) => setCodeSnippetText(e.target.value)}
                placeholder="Paste code snippet to share with founder..."
                rows={4}
                className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-2.5 rounded-lg border border-slate-800 outline-none"
              />
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                id="toggle-code-input-btn"
                onClick={() => setShowCodeInput(!showCodeInput)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  showCodeInput ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                title="Attach code snippet"
              >
                <Code2 className="w-4 h-4" />
              </button>

              <input
                id="chat-message-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Reply to ${activeThread.founderName}...`}
                className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />

              <button
                id="send-chat-message-btn"
                type="submit"
                disabled={!inputText.trim() && !codeSnippetText.trim()}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
          Select a chat channel to start conversation
        </div>
      )}
    </div>
  );
};
