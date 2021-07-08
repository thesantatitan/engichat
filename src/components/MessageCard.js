import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';


const MessageCard = (props) => {
    return (
        <Paper elevation={3}>
            <Box p={'5px'}>
                <Typography color='textSecondary' align='right' gutterBottom style={{ fontSize:15 }}>{props.sender}</Typography>
                <Typography align='right' gutterBottom style={{ fontSize: 25 }}>{props.text}</Typography>
            </Box>
        </Paper>
    );
}

export default MessageCard;