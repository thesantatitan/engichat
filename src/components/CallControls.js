import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import CallEndIcon from '@material-ui/icons/CallEnd';
import * as ROUTES from '../constants/routes'
import { useHistory } from 'react-router-dom';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';

const CallControls = (props) => {
    const history = useHistory();
    const [isVideoEnabled,setIsVideoEnabled] = useState(true);
    const [isAudioEnabled,setIsAudioEnabled] = useState(true);

    if(!props.stream){
        return null;
    }

    

    return (
        <Box display='flex' justifyContent='center' alignItems='center'>
            <IconButton
                onClick={(event) => {
                    event.preventDefault();
                    props.stream.getVideoTracks()[0].enabled = !props.stream.getVideoTracks()[0].enabled;
                    setIsVideoEnabled(props.stream.getVideoTracks()[0].enabled);
                }}
            >
                {
                    isVideoEnabled && <VideocamIcon/>
                }
                {
                    !isVideoEnabled && <VideocamOffIcon/>
                }
            </IconButton>
            <IconButton
                onClick={(event) => {
                    event.preventDefault();
                    history.replace(ROUTES.MAINROOM);
                }}
            >
                <CallEndIcon color='secondary' />
            </IconButton>
            <IconButton
                onClick={(event) => {
                    event.preventDefault();
                    props.stream.getAudioTracks()[0].enabled = !props.stream.getAudioTracks()[0].enabled;
                    setIsAudioEnabled(props.stream.getAudioTracks()[0].enabled);
                }}
            >
                {
                    isAudioEnabled && <VolumeUpIcon/>
                }
                {
                    !isAudioEnabled && <VolumeOffIcon/>
                }
            </IconButton>
        </Box>
    );
}

export default CallControls;