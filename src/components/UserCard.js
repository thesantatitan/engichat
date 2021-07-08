import React, { useState, useEffect } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import {getEmailFromUid} from '../services/firebaseDbHelper';

const UserCard = (props) => {
    const [email,setEmail] = useState('');
    
    useEffect(() => {
        getEmailFromUid(props.uid).then((data) => {
            setEmail(data);
        })
    });

    return ( 
        <ListItem divider>
            <ListItemText primary={email} style={{overflow:"hidden"}}/>
            <ListItemIcon>
                <IconButton
                    onClick={(event) => {
                        event.preventDefault();
                        props.handleClickOnDelete();
                    }}
                >
                    <DeleteIcon/>
                </IconButton>
            </ListItemIcon>
        </ListItem>
     );
}
 
export default UserCard;