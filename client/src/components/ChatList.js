import React from 'react';
import ChatListEntry from './ChatListEntry';
import { Header, Image, Modal } from 'semantic-ui-react';
import './styles/styles.css';

const ChatList = (props) => {
    console.log("INSIDE CHAT LIST PROPS ARE ", props);

  return (
    <div className="chatlistentry" >
      {props.messages.map((message, index) => 
        <ChatListEntry currentEngagement={props.currentEngagement} message={message} key={index} index={index}/>
      )}
    </div>
  )
}

export default ChatList;