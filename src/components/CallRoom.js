import React, { useEffect, useState, useRef } from 'react';
import '../App.css';
import Peer from "simple-peer";
import styled from "styled-components";
import { db } from '../services/firebase';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 50%;
  height: 50%;
`;

function CallRoom() {
    const currentChat = useLocation().pathname.split('/')[2];
    const authUser = useAuth();


    const [yourID, setYourID] = useState(authUser.user.uid);
    const [users, _setUsers] = useState([]);
    const usersRef = useRef([]);
    const setUsers = (data) => {
        usersRef.current = data;
        _setUsers(data);
    };
    const [inCallRef, setInCallRef] = useState(db.ref('chats/' + currentChat + '/inCall'));


    const [stream, _setStream] = useState();
    const streamRef = useRef();
    const setStream = (data) => {
        streamRef.current = data;
        _setStream(data);
    }

    const userVideo = useRef();

    const [uidToCallingSignal,_setUidToCallingSignal] = useState(new Map());
    const uidToCallingSignalRef = useRef(new Map());
    const setUidToCallingSignal = (data) => {
        uidToCallingSignalRef.current = data;
        _setUidToCallingSignal(data);
    }



    const [uidToPeer,_setUidToPeer] = useState(new Map());
    const uidToPeerRef = useRef(uidToPeer);
    const setUidToPeer = (data) => {
        uidToPeerRef.current = data;
        _setUidToPeer(data);
    };

    useEffect(() => {

        let newUserIncallCallback = {};



        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
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
            tempMap.set(callingUser.key,callingUser.child('callingData').child('signalData').val());
            setUidToCallingSignal(tempMap);
            acceptCall(callingUser.key);
        });


        return () => {
            inCallRef.off('child_added', newUserIncallCallback);
            inCallRef.child(yourID).off('child_added', userCallingMeCallback);
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
                        urls:"stun:stun.wtfismyip.com",
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

       


        inCallRef.child(id).child(yourID).child('returnSignalData').on('child_added', (callAccepted) => {
            peer.signal(callAccepted.val());
        })

        let tempMap = new Map(uidToPeerRef.current);
        tempMap.set(id,peer);
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
                        urls:"stun:stun.wtfismyip.com",
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
        
        let tempMap = new Map(uidToPeerRef.current);
        tempMap.set(caller,peer);
        setUidToPeer(tempMap);

    }

    let UserVideo;
    if (streamRef.current) {
        UserVideo = (
            <Video playsInline muted ref={userVideo} autoPlay />
        );
    }


    const VideoComponent = (props) => {
        const ref = useRef();

        useEffect(() => {
            props.peer.on("stream",stream =>{
                ref.current.srcObject = stream;
            });
        },[]);

        return (<Video playsInline autoPlay ref={ref}/>);

    }

    const renderVideos = () => {
        let partnerVideos = [];
        uidToPeerRef.current.forEach((peer,uid) => {
            partnerVideos.push(<VideoComponent peer={peer} key={uid}/>);
        });
        return partnerVideos;
    };


    return (
        <Container>
            <Row>
                {UserVideo}
                {   
                    renderVideos()
                }
            </Row>
        </Container>
    );
}

export default CallRoom;
