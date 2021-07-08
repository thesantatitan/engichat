import React, { useState, useEffect, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import MessageCard from './MessageCard';

const Messages = ({messagesDbRef}) => {

    const [messageList, _setMessageList] = useState([]);
    const messageListRef = useRef([]);
    const setMessageList = (data) => {
        messageListRef.current = data;
        _setMessageList(data);
    }


    useEffect(() => {
        const newMessageListener = messagesDbRef.on('child_added',(message)=>{
            setMessageList([...messageListRef.current, {key:message.key,sender:message.child('sender').val(),text:message.child('text').val()}]);
        });


        return () =>{
            messagesDbRef.off('child_added',newMessageListener);
        }
    },[]);

    return (
        <Grid container direction='column' justify='flex-end'>
            {
                messageList.map((message) =>{
                    return (
                        <Grid item key={message.key}>
                            <MessageCard sender={message.sender} text={message.text}/>
                        </Grid>
                    );
                })
            }
        </Grid>
    );
}
 
export default Messages