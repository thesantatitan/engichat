import React , {useEffect, useState, useRef} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import {db} from '../services/firebase';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import UserCard from './UserCard';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import {addUserEmailToChat,deleteUserFromChat} from '../services/firebaseDbHelper';

const useStyles = makeStyles((theme) => ({
    root:{
        width:'100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(12),
        fontWeight: theme.typography.fontWeightRegular,
        flexGrow:1,
    },
    details: {
        padding: theme.spacing(1),
    }
}))


const ChatRoom = (props) => {
    const classes = useStyles();
    const userDbRef = db.ref('chats/'+props.chatID+'/users');
    const [userList,_setUserList] = useState([]);
    const [userToAdd,setUserToAdd] = useState('');
    const userListRef = useRef(userList);

    const setUserList = (data) => {
        userListRef.current = data;
        _setUserList(data);
    }


    useEffect(() => {
        const listener = userDbRef.on('child_added',(data)=>{
            if(data !== undefined){
                setUserList([...userListRef.current, data.key]);
            }
        });
        return () => userDbRef.off('child_added',listener)
    },[]);

    useEffect(() => {
        const listener = userDbRef.on('child_removed',(data) => {
            if(data !== undefined){
                let newUserList = userListRef.current.slice();
                newUserList.splice(newUserList.indexOf(data.key),1);
                setUserList(newUserList);
            }
        });
        return () => userDbRef.off('child_removed',listener)
    },[]);

    return ( 
        <div className={classes.root}>
            <Accordion 
                expanded={props.chatID===props.currentChat}
                onChange={(event,isExpanded) =>{
                    if(isExpanded){
                        props.updateChat(props.chatID);
                    }else{
                        props.updateChat('');
                    }
                }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography className={classes.heading}>Room: {props.chatID}</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                    <List>
                        {   
                            userList.map((user) =>{
                                return <UserCard 
                                    uid={user} 
                                    chatID={props.chatID} 
                                    key={user}
                                    handleClickOnDelete = {() => {deleteUserFromChat(user,props.chatID)}}
                                />
                            })
                        }
                        <ListItem>
                            <form>
                                <TextField style={{width:'70%'}} variant="outlined" label='Email'
                                    onChange={(event) => {setUserToAdd(event.target.value)}}
                                />
                                <IconButton 
                                    onClick={(event) => {
                                        event.preventDefault();
                                        addUserEmailToChat(userToAdd,props.chatID);
                                    }}
                                >
                                    <AddIcon/>
                                </IconButton>
                            </form>
                        </ListItem>
                    </List>
                </AccordionDetails>
            </Accordion>
        </div>
     );
}
 

 
export default ChatRoom;