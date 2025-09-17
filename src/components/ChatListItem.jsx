import React, { useState, useRef } from 'react';
import { Trash2, Pencil } from 'lucide-react';

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + '…';
}

const ChatListItem = ({ chat, idx, active, selectChat, setChats, chats }) => {
    const [hovered, setHovered] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(chat.title);
    const inputRef = useRef(null);

    // Truncate more when hovered (icons shown)
    const maxLength = hovered ? 14 : 22;
    const displayTitle = renaming ? '' : truncateText(chat.title, maxLength);

    const handleDelete = (e) => {
        e.stopPropagation();
        const updated = chats.filter((_, i) => i !== idx);
        setChats(updated);
        // If deleted active, select first
        if (active && updated.length > 0) selectChat(0);
        // Persist
        try {
            localStorage.setItem('chats', JSON.stringify(updated));
        } catch {}
    };

    const handleRename = (e) => {
        e.stopPropagation();
        setRenaming(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const finishRename = () => {
        if (!newTitle.trim()) return;
        const updated = chats.map((c, i) => i === idx ? { ...c, title: newTitle } : c);
        setChats(updated);
        setRenaming(false);
        // Persist
        try {
            localStorage.setItem('chats', JSON.stringify(updated));
        } catch {}
    };

    return (
        <div
            className={`chat-list-item${active ? ' active' : ''}`}
            onClick={() => selectChat(idx)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setRenaming(false); }}
            style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
        >
            {renaming ? (
                <input
                    ref={inputRef}
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onBlur={finishRename}
                    onKeyDown={e => { if (e.key === 'Enter') finishRename(); }}
                    style={{ flex: 1, fontFamily: 'Inter', fontSize: '0.9rem', borderRadius: 4, border: '1px transparent', padding: '2px 6px' }}
                />
            ) : (
                <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{displayTitle}</span>
            )}
            {hovered && !renaming && (
                <span style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                    <button className="icon-btn" aria-label="Rename chat" onClick={handleRename} tabIndex={-1} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <Pencil size={16} />
                    </button>
                    <button className="icon-btn" aria-label="Delete chat" onClick={handleDelete} tabIndex={-1} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <Trash2 size={16} />
                    </button>
                </span>
            )}
        </div>
    );
};

export default ChatListItem;
