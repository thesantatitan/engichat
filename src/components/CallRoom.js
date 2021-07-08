import React, { useEffect, useState, useRef } from 'react';
import '../App.css';
import Peer from "simple-peer";
import styled from "styled-components";
import { db } from '../services/firebase';
import { useLocation,useHistory } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Chats from './Chats';
import IconButton from '@material-ui/core/IconButton';
import CallEndIcon from '@material-ui/icons/CallEnd';
import * as ROUTES from '../constants/routes'
import Box from '@material-ui/core/Box';


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



function CallRoom() {
    const history = useHistory();
    const location = useLocation();
    const authUser = useAuth();
    const classes = useStyles();

    const [yourID, setYourID] = useState(authUser.user.uid);
    const [users, _setUsers] = useState([]);
    const usersRef = useRef([]);
    const setUsers = (data) => {
        usersRef.current = data;
        _setUsers(data);
    };
    const [inCallRef, setInCallRef] = useState(db.ref('chats/' + location.state.currentChat + '/inCall'));


    const [stream, _setStream] = useState();
    const streamRef = useRef();
    const setStream = (data) => {
        streamRef.current = data;
        _setStream(data);
    }

    const userVideo = useRef();

    const [uidToCallingSignal, _setUidToCallingSignal] = useState(new Map());
    const uidToCallingSignalRef = useRef(new Map());
    const setUidToCallingSignal = (data) => {
        uidToCallingSignalRef.current = data;
        _setUidToCallingSignal(data);
    }



    const [uidToPeer, _setUidToPeer] = useState(new Map());
    const uidToPeerRef = useRef(uidToPeer);
    const setUidToPeer = (data) => {
        uidToPeerRef.current = data;
        _setUidToPeer(data);
    };

    useEffect(() => {

        let newUserIncallCallback = {};



        navigator.mediaDevices.getUserMedia({ video: { height: '500px', width: '500px' }, audio: true }).then(stream => {
            setStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = streamRef.current;
            }
        });




        inCallRef.once('value', (usersInCallOnFirebase) => {
            let usersList = usersRef.current.slice();
            usersInCallOnFirebase.forEach((user) => { usersList.push(user.key) });
            usersList.push(yourID);
            setUsers(usersList);
        }).then(() => {
            inCallRef.child(yourID).set(true);
            inCallRef.child(yourID).onDisconnect().remove();
            newUserIncallCallback = inCallRef.on('child_added', (newUser) => {
                if (!usersRef.current.includes(newUser.key)) {
                    let tempUsersList = usersRef.current.slice();
                    tempUsersList.push(newUser.key);
                    setUsers(tempUsersList);

                    callPeer(newUser.key);
                }
            });
        });

        const userCallingMeCallback = inCallRef.child(yourID).on('child_added', (callingUser) => {
            let tempMap = new Map(uidToCallingSignalRef.current);
            tempMap.set(callingUser.key, callingUser.child('callingData').child('signalData').val());
            setUidToCallingSignal(tempMap);
            acceptCall(callingUser.key);
        });


        return () => {
            inCallRef.off('child_added', newUserIncallCallback);
            inCallRef.child(yourID).off('child_added', userCallingMeCallback);
            inCallRef.child(yourID).remove();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => { track.stop() });
            }
            uidToPeerRef.current.forEach((peer)=>{
                peer.destroy();
            });
            setUidToPeer(new Map());
        }
    }, []);




    function callPeer(id) {
        const peer = new Peer({
            initiator: true,
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
            stream: streamRef.current,
        });

        peer.on("signal", data => {
            inCallRef.child(id).child(yourID).set({ callingData: { signalData: data } });
        })

        peer.on('close',() => {
            let tempMap = new Map(uidToPeerRef.current);
            tempMap.delete(id);
            setUidToPeer(tempMap);
        });


        inCallRef.child(id).child(yourID).child('returnSignalData').on('child_added', (callAccepted) => {
            peer.signal(callAccepted.val());
        })

        let tempMap = new Map(uidToPeerRef.current);
        tempMap.set(id, peer);
        setUidToPeer(tempMap);

    }

    function acceptCall(caller) {
        const peer = new Peer({
            initiator: false,
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
            stream: streamRef.current,
        });
        peer.on("signal", data => {
            inCallRef.child(yourID).child(caller).child("returnSignalData").set({ signalData: data });
        })



        peer.signal(uidToCallingSignalRef.current.get(caller));

        peer.on('close',() => {
            let tempMap = new Map(uidToPeerRef.current);
            tempMap.delete(caller);
            setUidToPeer(tempMap);
        });

        let tempMap = new Map(uidToPeerRef.current);
        tempMap.set(caller, peer);
        setUidToPeer(tempMap);

    }

    const VideoComponent = (props) => {
        const ref = useRef();

        useEffect(() => {
            props.peer.on("stream", stream => {
                ref.current.srcObject = stream;
            });
        }, []);

        return (<video playsInline autoPlay ref={ref} />);

    }


    return (
        <Grid container direction='row'>
            <Grid item style={{ flexGrow: 7 }}>
                <Grid container direction='column' style={{ minHeight: '100vh', height: 'auto' }}>
                    <Grid item className={classes.videos}>
                        <Grid container style={{ flexWrap: 'wrap' }}>
                            <Grid item>
                                <video playsInline autoPlay muted ref={userVideo} />
                            </Grid>
                            {
                                [...uidToPeer.entries()].map(([uid, peer]) => {
                                    return (
                                        <Grid item key={uid}>
                                            <VideoComponent peer={peer}/>
                                        </Grid>
                                    );
                                })
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
                <Chats currentChat={location.state.currentChat} currentContact={''} key={location.state.currentChat} />
            </Grid>
        </Grid>
    );






}

export default CallRoom;
