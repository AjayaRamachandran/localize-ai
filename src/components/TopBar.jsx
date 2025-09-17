import React from "react";
import { Sparkle } from "lucide-react";
import { useMessages } from "@/contexts/MessagesContext";

import './top-bar.css';

const TopBar = () => {
    const { chats, activeIndex } = useMessages();
    const chatTitle = chats[activeIndex]?.title || '';

    return (
        <div className='top-bar'>
            <span className="localize-title" text-style='display'><Sparkle size={16}/>LocalizeAI</span>
            <span className="top-bar-chat-title">{chatTitle}</span>
            <span className="slogan" text-style='display'>
                Democratize Compute.
            </span>
        </div>
    );
};

export default TopBar;
