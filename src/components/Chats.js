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
        </>
    )
}
 
export default Chats;