import React, {useState, useEffect} from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {getEmailFromUid} from '../services/firebaseDbHelper';

const MessageCard = (props) => {
    const [email,setEmail] = useState('');

    useEffect(() => {
        getEmailFromUid(props.sender).then((data) => {setEmail(data)});
    });

    return (
        <Paper elevation={1} style={{backgroundColor:'aliceblue'}}>
            <Box p={'5px'}>
                <Typography color='textSecondary' align='right' gutterBottom style={{ fontSize:15 }}>{email}</Typography>
                <Typography align='right' gutterBottom style={{ fontSize: 25 }}>{props.text}</Typography>
            </Box>
        </Paper>
    );
}

export default MessageCard;