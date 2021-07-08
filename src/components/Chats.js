import React from 'react';
import {Link} from 'react-router-dom';
import * as ROUTES from '../constants/routes';

const Chats = (props) => {
    return (
        <>
        <h1>Chats</h1>
        {
            props.currentChat!==""?<Link to={ROUTES.CALL+'/'+props.currentChat}>Join Call</Link>:<></>
        }
        {
            props.currentContact!==""?<Link to={{pathname:ROUTES.CONTACT_CALL,state:{contact:props.currentContact}}}>Join ContactCall</Link>:<></>
        }
        </>
    )
}
 
export default Chats;