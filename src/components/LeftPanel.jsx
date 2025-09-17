import React from 'react';
import { PanelLeftClose, PanelLeftOpen, MessageSquarePlus } from 'lucide-react';
import { useMessages } from '../contexts/MessagesContext';
import './left-panel.css';
import ChatListItem from './ChatListItem';

const LeftPanel = () => {
    const { isLeftPanelOpen, setIsLeftPanelOpen, setChats, chats = [], activeIndex = 0, selectChat, newChat } = useMessages();

    const togglePanel = () => {
        setIsLeftPanelOpen(!isLeftPanelOpen);
    };

    return (
        <div className={`left-panel ${isLeftPanelOpen ? 'open' : 'closed'}`}>
            <button 
                className="toggle-button"
                onClick={togglePanel}
                aria-label={isLeftPanelOpen ? 'Close panel' : 'Open panel'}
            >
                {isLeftPanelOpen ? <PanelLeftClose size={22}/> : <PanelLeftOpen size={22}/>}
            </button>
            <button className="new-chat-button" onClick={() => newChat()}>
                <MessageSquarePlus size={16}/>New Chat
            </button>
            <div className="panel-content">
                <div className="chat-list">
                    <span className='chat-list-title'>Chats</span>
                    {chats.map((c, idx) => (
                        <ChatListItem
                            key={idx}
                            chat={c}
                            idx={idx}
                            active={idx === activeIndex}
                            selectChat={selectChat}
                            setChats={setChats}
                            chats={chats}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeftPanel;
