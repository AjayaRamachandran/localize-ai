import React from "react";
import LeftPanel from "@/components/LeftPanel";
import CurrentChat from "@/components/CurrentChat";
import EntryBox from "@/components/EntryBox";
import TopBar from "@/components/TopBar";
import "./homepage.css";

function HomePage() {
  return (
    <div className="homepage-layout">
      <LeftPanel />
      <div className="chat-area">
        <TopBar />
        <CurrentChat />
        <EntryBox />
      </div>
    </div>
  );
}

export default HomePage;
