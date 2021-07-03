import React, { useEffect, useState, useRef } from 'react';
import '../App.css';
import io from "socket.io-client";
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

function CallRoom2() {
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


    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);

    const userVideo = useRef();
    const partnerVideo = useRef();
    const socket = useRef();


    useEffect(() => {

        let newUserIncallCallback = {};



        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            setStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
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
                }
            });
        });

        const userCallingMeCallback = inCallRef.child(yourID).on('child_added', (callingUser) => {
            setReceivingCall(true);
            setCaller(callingUser.key);
            setCallerSignal(callingUser.child('callingData').child('signalData').val());
        });


        return () => {
            inCallRef.off('child_added', newUserIncallCallback);
            inCallRef.child(yourID).off('child_added', userCallingMeCallback);
        }
    }, []);

    // useEffect(() => {
    //     socket.current = io.connect("/");
    //     // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    //     //     setStream(stream);
    //     //     if (userVideo.current) {
    //     //         userVideo.current.srcObject = stream;
    //     //     }
    //     // })

    //     // socket.current.on("yourID", (id) => {
    //     //     setYourID(id);
    //     // })
    //     // socket.current.on("allUsers", (users) => {
    //     //     setUsers(users);
    //     // })

    //     // socket.current.on("hey", (data) => {
    //     //     setReceivingCall(true);
    //     //     setCaller(data.from);
    //     //     setCallerSignal(data.signal);
    //     // })
    // }, []);

    function callPeer(id) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            config: {

                iceServers: [
                    {
                        urls: "stun:numb.viagenie.ca",
                        username: "sultan1640@gmail.com",
                        credential: "98376683"
                    },
                    {
                        urls: "turn:numb.viagenie.ca",
                        username: "sultan1640@gmail.com",
                        credential: "98376683"
                    }
                ]
            },
            stream: stream,
        });

        peer.on("signal", data => {
            // socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID })
            inCallRef.child(id).child(yourID).set({ callingData: { signalData: data } });
        })

        peer.on("stream", stream => {
            if (partnerVideo.current) {
                partnerVideo.current.srcObject = stream;
            }
        });

        // socket.current.on("callAccepted", signal => {
        //     setCallAccepted(true);
        //     peer.signal(signal);
        // })

        inCallRef.child(id).child(yourID).child('returnSignalData').on('child_added', (callAccepted) => {
            setCallAccepted(true);
            peer.signal(callAccepted.val());
        })

    }

    function acceptCall() {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });
        peer.on("signal", data => {
            inCallRef.child(yourID).child(caller).child("returnSignalData").set({ signalData: data });
        })

        peer.on("stream", stream => {
            partnerVideo.current.srcObject = stream;
        });

        peer.signal(callerSignal);
    }

    let UserVideo;
    if (stream) {
        UserVideo = (
            <Video playsInline muted ref={userVideo} autoPlay />
        );
    }

    let PartnerVideo;
    if (callAccepted) {
        PartnerVideo = (
            <Video playsInline ref={partnerVideo} autoPlay />
        );
    }

    let incomingCall;
    if (receivingCall) {
        incomingCall = (
            <div>
                <h1>{caller} is calling you</h1>
                <button onClick={acceptCall}>Accept</button>
            </div>
        )
    }
    return (
        <Container>
            <Row>
                {UserVideo}
                {PartnerVideo}
            </Row>
            <Row>
                {/* {users.map(key => {
                    if (key === yourID) {
                        return null;
                    }
                    return (
                        <button onClick={() => callPeer(key)}>Call {key}</button>
                    );
                })} */}

                {
                    users.map((user) => {
                        if (user !== yourID) {
                            return (
                                <button onClick={() => callPeer(user)}>Call {user}</button>
                            );
                        }
                    })
                }

            </Row>
            <Row>
                {incomingCall}
            </Row>
        </Container>
    );
}

export default CallRoom2;
