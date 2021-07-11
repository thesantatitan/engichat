import React, { useState, useEffect, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { db } from '../services/firebase';
import { useAuth } from '../services/AuthContext';
import Peer from 'simple-peer';
import { useLocation, useHistory, Redirect } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import CallEndIcon from '@material-ui/icons/CallEnd';
import * as ROUTES from '../constants/routes'
import Box from '@material-ui/core/Box';
import Chats from './Chats';
import VideoComponent from './VideoComponent';

const useStyles = makeStyles((theme) => ({
    videos: {
        flexGrow: 10,
        width: '100vw',
        minHeight: '100%',
        backgroundColor: 'black',
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

    const [contactDisconnected, _setContactDisconnected] = useState(false);
    const contactDisconnectedRef = useRef(false);
    const setContactDisconnected = (data) => {
        contactDisconnectedRef.current = data;
        _setContactDisconnected(data);
    }

    const userVideo = useRef();
    const contactVideo = useRef();

    const userPeer = useRef();

    const location = useLocation();

    useEffect(() => {
        if (location.state) {
            const contactDbRef = db.ref('users/' + location.state.contact + '/contacts/' + authUser.user.uid);
            const myDbRef = db.ref('users/' + authUser.user.uid + '/contacts/' + location.state.contact);

            contactDbRef.child('inCall').set(true);
            contactDbRef.child('inCall').onDisconnect().set(false);
            contactDbRef.child('data').onDisconnect().remove();
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                setStream(stream);
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }

                myDbRef.child('inCall').get().then((data) => {
                    userPeer.current = createPeer(!data.val(), contactDbRef, myDbRef, stream);
                })

            });



            return () => {
                myDbRef.child('data').off('child_added');

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => { track.stop() });
                }
                contactDbRef.child('inCall').set(false);
                contactDbRef.child('data').remove();
                userPeer.current.destroy();
            }
        }

    }, [contactDisconnectedRef.current]);

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

        peer.on('close', () => {
            setContactStream(null);
            if (contactVideo.current) {
                contactVideo.current.srcObject = null;
            }
            setContactDisconnected(!contactDisconnectedRef.current);
        });

        return peer;

    }

    if (!location.state) {
        return <Redirect to={ROUTES.MAINROOM} />
    }

    return (
        <Grid container direction="row">
            <Grid item style={{ flexGrow: 7 }}>
                <Grid container direction="column" style={{ minHeight: '100vh', height: 'auto' }}>
                    <Grid item className={classes.videos}>
                        <Grid container direction="row" alignItems="center" justify="center" spzing={2}>
                            <Grid item className={classes.video}>
                                <VideoComponent isVideoGiven={true} uid={authUser.user.uid}>
                                    <video playsInline muted ref={userVideo} autoPlay />
                                </VideoComponent>
                            </Grid>
                            {
                                contactStream &&
                                <Grid item className={classes.video}>
                                    <VideoComponent isVideoGiven={true} uid={location.state.contact}>
                                        <video playsInline ref={contactVideo} autoPlay />
                                    </VideoComponent>
                                </Grid>
                            }
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
            </Grid>
            <Grid item style={{ flexGrow: 3 }}>
                <Chats currentChat={''} currentContact={location.state.contact} key={location.state.contact} />
            </Grid>
        </Grid>
    );
}

export default ContactCallRoom;