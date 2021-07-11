import React from 'react';
import Grid from '@material-ui/core/Grid';
import Messages from './Messages';
import { db } from '../services/firebase';
import { useAuth } from '../services/AuthContext';
import SendMessage from './SendMessage';
import { sendMessage, sendMessageToChatRoom } from '../services/firebaseDbHelper';
import Box from '@material-ui/core/Box';

const Chats = (props) => {
    const authUser = useAuth();

    if (props.currentChat === '' && props.currentContact === '') {
        return (
            <Box border={2} borderColor='secondary' p={2}>
                <h1>Chats</h1>
            </Box>
        );
    } else {
        if (props.currentChat !== '') {
            return (
                <Box border={2} borderColor='secondary' p={2} style={{maxHeight:'100%',minHeight:'100%'}}>
                    <Grid container spacing={2} direction="column" style={{ minHeight: '100%', alignItems: 'stretch' }}>
                        <Grid item>
                            <Messages messagesDbRef={db.ref('chats/' + props.currentChat + '/messages')} />
                        </Grid>
                        <Grid item>
                            <SendMessage send={(data) => { sendMessageToChatRoom(authUser.user.uid, props.currentChat, data) }} />
                        </Grid>
                    </Grid>
                </Box>
            );
        } else {
            return (
                <Box border={2} borderColor='secondary' p={2} style={{maxHeight:'100%',minHeight:'100%'}}>
                    <Grid container spacing={2} direction="column" style={{ minHeight: '100%', alignItems: 'stretch'}}>
                        <Grid item>
                            <Messages messagesDbRef={db.ref('users/' + authUser.user.uid + '/contacts/' + props.currentContact + '/messages')} />
                        </Grid>
                        <Grid item>
                            <SendMessage send={(data) => { sendMessage(authUser.user.uid, props.currentContact, data) }} />
                        </Grid>
                    </Grid>
                </Box>
            );
        }
    }
}

export default Chats;