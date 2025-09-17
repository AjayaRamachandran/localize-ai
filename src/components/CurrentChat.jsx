import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Copy, Check } from 'lucide-react';
import { useMessages } from "@/contexts/MessagesContext";
import "./current-chat.css";

export default function CurrentChat({ messages: propMessages }) {
  const { messages: ctxMessages, isStreaming } = useMessages();
  const messages = propMessages || ctxMessages;
  const feedRef = useRef(null);
  const [copiedStates, setCopiedStates] = useState({});

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset copied state after 2 seconds
  const handleCopy = (id) => {
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Custom components for ReactMarkdown
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const id = Math.random().toString(36).substr(2, 9);

      return !inline ? (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            {match && <span className="code-language">{match[1]}</span>}
            <CopyToClipboard text={String(children)} onCopy={() => handleCopy(id)}>
              <button className="copy-button">
                {copiedStates[id] ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </CopyToClipboard>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match?.[1] || 'text'}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="current-chat-container">
      <div className="chat-feed" ref={feedRef}>
        <span className='chat-starter' text-style='display'>Hey there! Ready to dive in?</span>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.role === "user" ? "user-message" : "ai-message"
            }`}
          >
            {msg.role === "user" ? (
              <div className="user-bubble">{msg.content}</div>
            ) : (
              <div className="ai-bubble">
                <ReactMarkdown components={components}>{msg.content}</ReactMarkdown>
                {isStreaming && index === messages.length - 1 && (
                  <span className="typing-indicator">▋</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
