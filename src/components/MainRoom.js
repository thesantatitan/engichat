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
import {Redirect} from 'react-router-dom';


const useStyles = makeStyles((theme) => ({
    title:{
        flexGrow:1,
    },
    rooms:{
        flexGrow:1,
        maxWidth:'300px',
    },
    chats:{
        flexGrow:5,
    }
}))

function MainRoom(){
    const authUser = useAuth();
    const classes = useStyles();

    const [currentChat,setCurrentChat] = useState('');

    if(authUser.user===null){
        return (
            <Redirect to="/" />
        )
    }
    return (
        <Grid container direction="column">
            <Grid item>
                <AppBar position="relative">
                    <Toolbar>
                        <Typography className={classes.title}>
                            Logged in as {authUser.user.email}
                        </Typography>
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
            <Grid item>
                <Grid container direction="row">
                    <Grid item className={classes.rooms}>
                        <Rooms updateChat = {(data) => setCurrentChat(data)} currentChat={currentChat}/>
                    </Grid>
                    <Grid item className={classes.chats}>
                        <Chats currentChat={currentChat}/>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default MainRoom;