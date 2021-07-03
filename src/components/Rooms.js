import React, {useEffect,useState,useRef} from 'react';
import {useAuth} from '../services/AuthContext';
import ChatRoom from './ChatRoom';
import {db} from '../services/firebase';
import Box from '@material-ui/core/Box';

const Rooms = (props) => {
    const authUser = useAuth();
    const chatsDbRef = db.ref('users/'+authUser.user.uid+'/chats/');
    const [chats,_setChats] = useState([]);
    const chatsRef = useRef(chats);
    const setChats = (data) => {
        chatsRef.current = data;
        _setChats(data);
    }

    useEffect(() => {
        const listener = chatsDbRef.on('child_added',(data) => {
            if(data !== undefined){
                setChats([...chatsRef.current, data.key]);
            }
        })
        return () => chatsDbRef.off('child_added',listener)
    },[]);

    useEffect(() => {
        const listener = chatsDbRef.on('child_removed',(data) => {
            if(data !== undefined){
                let newChats = chatsRef.current.slice();
                newChats.splice(newChats.indexOf(data.key),1);
                setChats(newChats);
                props.updateChat("");
            }
        })
        return () => chatsDbRef.off('child_removed',listener)
    },[]);

    return (
        <Box border={1} maxWidth="300px">
            <h4>ChatRooms</h4>
            {
                chats.map((cid) => {
                    return <ChatRoom chatID={cid} key={cid} updateChat={(data) => props.updateChat(data)} currentChat={props.currentChat}/>
                })
            }
        </Box>
     );
}
 
export default Rooms;