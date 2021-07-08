import React from 'react';
import {Link} from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Messages from './Messages';
import {db} from '../services/firebase';
import {useAuth} from '../services/AuthContext';
import SendMessage from './SendMessage';
import {sendMessage, sendMessageToChatRoom} from '../services/firebaseDbHelper';

const useStyles = makeStyles((theme) => ({
    messages:{
        flexGrow:8,
    },
    controls:{
        flexGrow:1,
    }
}));

const Chats = (props) => {
    const authUser = useAuth();

    if(props.currentChat==='' && props.currentContact===''){
        return <h1>Chats</h1>;
    }else{
        if(props.currentChat!==''){
            return (
                <Grid container spacing={2} direction="column" style={{minHeight:'100%',alignItems:'stretch',justifyContent:'flex-end'}}>
                    <Grid item>
                        <Messages messagesDbRef={db.ref('chats/'+props.currentChat+'/messages')}/>
                    </Grid>
                    <Grid item>
                        <SendMessage send={(data) => {sendMessageToChatRoom(authUser.user.uid,props.currentChat,data)}} />
                    </Grid>
                </Grid>
                );
        }else{
            return (
            <Grid container spacing={2} direction="column" style={{minHeight:'100%',alignItems:'stretch',justifyContent:'flex-end'}}>
                <Grid item>
                    <Messages messagesDbRef={db.ref('users/'+authUser.user.uid+'/contacts/'+props.currentContact+'/messages')}/>
                </Grid>
                <Grid item>
                    <SendMessage send={(data) => {sendMessage(authUser.user.uid,props.currentContact,data)}} />
                </Grid>
            </Grid>
            );
        }
    }
}
 
export default Chats;