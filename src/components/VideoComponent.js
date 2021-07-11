import React, { useRef, useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import randomColor from 'randomcolor';


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


    if(props.isVideoGiven){
        return (
            <Box border={4} borderColor={videoColor} borderRadius={10}>
                {props.children}
            </Box>
        );
    }else{

        return (
            <Box border={4} borderColor={videoColor} borderRadius={10}>
                <PeerVideoComponent peer={props.peer} />
            </Box>
        );
    }
}
 
export default VideoComponent;