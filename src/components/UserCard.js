import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import {getEmailFromUid} from '../services/firebaseDbHelper';

const UserCard = (props) => {
    return ( 
        <ListItem divider>
            <ListItemText primary={getEmailFromUid(props.uid)} style={{overflow:"hidden"}}/>
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