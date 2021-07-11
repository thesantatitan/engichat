import React, {useState} from 'react';
import {useAuth} from '../services/AuthContext'
import {auth} from '../services/firebase';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Rooms from './Rooms';
import Chats from './Chats';
import {createNewChat} from '../services/firebaseDbHelper';
import {Redirect, useHistory} from 'react-router-dom';
import Contacts from './Contacts';
import * as ROUTES from '../constants/routes';
import Snackbar from '@material-ui/core/Snackbar';


const useStyles = makeStyles((theme) => ({
    title:{
        flexGrow:1,
    },
    rooms:{
        flexGrow:1,
        maxWidth:'300px',
        maxHeight:'100vh',
        overflow: 'auto',
    },
    chats:{
        flexGrow:7,
    },
    contacts:{
        flexGrow:1,
        maxWidth:'300px',
    }
}))

function MainRoom(){
    const authUser = useAuth();
    const classes = useStyles();
    const history = useHistory();
    const [snackOpen,setSnackOpen] = useState(false);

    const [currentChat,setCurrentChat] = useState('');
    const [currentContact,setCurrentContact] = useState('');
    const [key,setKey] = useState('');

    const setCurrent = (chat,contact) => {
        setCurrentChat(chat);
        setCurrentContact(contact);
        setKey(chat+contact);
    };

    if(authUser.user===null){
        return (
            <Redirect to="/" />
        )
    }
    return (
        <Grid container direction="column" style={{minHeight:'100vh', height:'auto'}}>
            <Grid item>
                <AppBar position="relative">
                    <Toolbar>
                        <Typography className={classes.title}>
                            Logged in as {authUser.user.email}
                        </Typography>
                        <Button
                            color='inherit'
                            onClick={(event) =>{
                                event.preventDefault();
                                if(currentChat!==''){
                                    history.push({pathname:ROUTES.CALL,state:{currentChat:currentChat}});
                                }
                                if(currentContact!==''){
                                    history.push({pathname:ROUTES.CONTACT_CALL,state:{contact:currentContact}});
                                }
                                if(key===''){
                                    setSnackOpen(true);
                                }
                            }}
                        >
                            Join Call
                        </Button>
                        <Button 
                            color="inherit"
                            onClick={(event) => {
                                event.preventDefault();
                                createNewChat(authUser.user.uid);
                            }}
                        >
                            Add Room
                        </Button>
                        <Button 
                            type="submit" 
                            color="inherit"
                            onClick={(event) => {
                                event.preventDefault();
                                auth.signOut();
                            }}
                        >
                            Logout
                        </Button>
                    </Toolbar>
                </AppBar>
            </Grid>
            <Grid item style={{minHeight:'90vh',height:'auto'}}>
                <Grid container spacing={1} direction="row" alignItems="stretch" style={{minHeight:'90vh',height:'auto'}}>
                    <Grid item className={classes.rooms}>
                        <Rooms updateChat = {(data) => {setCurrent(data,'')}} currentChat={currentChat}/>
                    </Grid>
                    <Grid item className={classes.chats}>
                        <Chats currentChat={currentChat} currentContact={currentContact} key={key} />
                    </Grid>
                    <Grid item className={classes.contacts}>
                        <Contacts updateContact = {(data) => {setCurrent('',data)}} currentContact={currentContact}/>
                    </Grid>
                </Grid>
            </Grid>
            <Snackbar
                anchorOrigin = {{
                    vertical:'bottom',
                    horizontal:'center',
                }}
                open={snackOpen}
                autoHideDuration={1000}
                onClose={()=>setSnackOpen(false)}
                message='Select a ChatRoom or a Contact'
            />
        </Grid>
    );
}

export default MainRoom;