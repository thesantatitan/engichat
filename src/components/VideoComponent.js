import React, { useRef, useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import randomColor from 'randomcolor';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {getEmailFromUid} from '../services/firebaseDbHelper';

const PeerVideoComponent = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, []);

    return (<video playsInline autoPlay ref={ref} />);
}





const VideoComponent = (props) => {
    const [videoColor, setVideoColor] = useState(randomColor());
    const [displayName,setDisplayName] = useState('');

    useEffect(() => {
        getEmailFromUid(props.uid).then((email) => {
            setDisplayName(email);
        })
    },[])

    if (props.isVideoGiven) {
        return (
            <Box border={4} borderColor={videoColor} borderRadius={10}>
                <Grid container direction='column'>
                    <Grid item style={{ flexGrow: 5 }}>
                        {props.children}
                    </Grid>
                    <Grid item style={{ flexGrow: 1 }}>
                        <Typography align='center' style={{ color: 'white' }}>
                            {displayName}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        );
    } else {

        return (
            <Box border={4} borderColor={videoColor} borderRadius={10}>
                <Grid container direction='column'>
                    <Grid item style={{ flexGrow: 5 }}>
                        <PeerVideoComponent peer={props.peer} />
                    </Grid>
                    <Grid item style={{ flexGrow: 1 }}>
                        <Typography align='center' style={{ color: 'white' }}>
                            {displayName}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}

export default VideoComponent;