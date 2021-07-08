import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import SendIcon from '@material-ui/icons/Send';

const SendMessage = (props) => {
    const [message, setMessage] = useState('');

    return (
        <form>
            <TextField
                style={{ 'width': '94%' }}
                variant='outlined'
                value={message}
                onChange={(event) => { setMessage(event.target.value) }}
                onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        props.send(message);
                        setMessage('');
                    }
                }}
            />
            <IconButton
                onClick={(event) => {
                    event.preventDefault();
                    props.send(message);
                    setMessage('');
                }}
            >
                <SendIcon />
            </IconButton>
        </form>
    );
}

export default SendMessage;