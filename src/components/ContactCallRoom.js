import React, { useState, useEffect, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { db } from '../services/firebase';
import { useAuth } from '../services/AuthContext';
import Peer from 'simple-peer';
import { useLocation, useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import CallEndIcon from '@material-ui/icons/CallEnd';
import * as ROUTES from '../constants/routes'
import Box from '@material-ui/core/Box';


const useStyles = makeStyles((theme) => ({
    videos: {
        flexGrow: 10,
        width: '100vw',
        minHeight:'100%',
    },
    video: {
        height: '100%',
        widht: '100%',
    },
    controls: {
        flexGrow: 1,
        width: '100vw',
        alignItems: 'center',
    },
    root: {
        height: '100vh',
    }
}))


const ContactCallRoom = (props) => {
    const classes = useStyles();
    const authUser = useAuth();
    const history = useHistory();

    const [stream, _setStream] = useState();
    const streamRef = useRef();
    const setStream = (data) => {
        streamRef.current = data;
        _setStream(data);
    }


    const [contactStream, _setContactStream] = useState();
    const contactStreamRef = useRef();
    const setContactStream = (data) => {
        contactStreamRef.current = data;
        _setContactStream(data);
    }


    const userVideo = useRef();
    const contactVideo = useRef();

    const userPeer = useRef();

    const location = useLocation();

    useEffect(() => {
        const contactDbRef = db.ref('users/' + location.state.contact + '/contacts/' + authUser.user.uid);
        const myDbRef = db.ref('users/' + authUser.user.uid + '/contacts/' + location.state.contact);

        contactDbRef.child('inCall').set(true);
        contactDbRef.child('inCall').onDisconnect().set(false);
        contactDbRef.child('data').onDisconnect().remove();
        navigator.mediaDevices.getUserMedia({ video: { height: '500px', width: '500px' }, audio: true }).then((stream) => {
            setStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            myDbRef.child('inCall').get().then((data) => {
                userPeer.current = createPeer(data.val(), contactDbRef, myDbRef, stream);
            })

        });



        return () => {
            myDbRef.off('child_added');
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => { track.stop() });
            }
            contactDbRef.child('inCall').set(false);
            contactDbRef.child('data').remove();
        }

    }, []);

    function createPeer(isInitiator, contactDbRef, myDbRef, stream) {
        const peer = new Peer({
            initiator: isInitiator,
            trickle: false,
            config: {

                iceServers: [
                    {
                        urls: "stun:numb.viagenie.ca",
                        username: "cyber4dude@gmail.com",
                        credential: "qwertyuiop"
                    },
                    {
                        urls: "stun:stun.wtfismyip.com",
                    },
                    {
                        urls: "turn:numb.viagenie.ca",
                        username: "cyber4dude@gmail.com",
                        credential: "qwertyuiop"
                    }
                ]
            },
            stream: stream,
        });
        peer.on('signal', (signalData) => {
            contactDbRef.child('data').set({ signalData: signalData });
        });
        myDbRef.child('data').on('child_added', (data) => {
            peer.signal(data.val());
        });
        peer.on('stream', stream => {
            setContactStream(stream);
            if (contactVideo.current) {
                contactVideo.current.srcObject = stream;
            }
        });

        return peer;

    }

    return (
        <Grid container direction="column" style={{minHeight:'100vh',height:'auto'}}>
            <Grid item className={classes.videos}>
                <Grid container direction="row" alignItems="center" justify="center">
                    <Grid item className={classes.video}>
                        <video playsInline muted ref={userVideo} autoPlay />
                    </Grid>
                    <Grid item className={classes.video}>
                        <video playsInline muted ref={contactVideo} autoPlay />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item className={classes.controls}>
                <Box display='flex' justifyContent='center' alignItems='center'>
                    <IconButton
                        onClick={(event) => {
                            event.preventDefault();
                            history.replace(ROUTES.MAINROOM);
                        }}
                    >
                        <CallEndIcon color='secondary' />
                    </IconButton>
                </Box>
            </Grid>
        </Grid>
    );
}

export default ContactCallRoom;