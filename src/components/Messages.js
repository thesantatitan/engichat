import React, { useState, useEffect, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import MessageCard from './MessageCard';
import Box from '@material-ui/core/Box';

const Messages = ({ messagesDbRef }) => {

    const [messageList, _setMessageList] = useState([]);
    const messageListRef = useRef([]);
    const setMessageList = (data) => {
        messageListRef.current = data;
        _setMessageList(data);
    }


    useEffect(() => {
        const newMessageListener = messagesDbRef.on('child_added', (message) => {
            setMessageList([...messageListRef.current, { key: message.key, sender: message.child('sender').val(), text: message.child('text').val() }]);
        });


        return () => {
            messagesDbRef.off('child_added', newMessageListener);
        }
    }, []);

    return (
        <Box style={{overflow:'auto', maxHeight:'75vh'}} spacing={1}>
            {
                messageList.map((message) => {
                    return (
                        <Grid item key={message.key}>
                            <MessageCard sender={message.sender} text={message.text} />
                        </Grid>
                    );
                })
            }
        </Box>
    );
}

export default Messages