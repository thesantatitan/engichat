import React, { useState, useEffect, useRef } from 'react';
import Box from '@material-ui/core/Box';
import { db } from '../services/firebase';
import { useAuth } from '../services/AuthContext';
import { deleteContact, sendContactRequest} from '../services/firebaseDbHelper';
import UserCard from './UserCard';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

const Contacts = () => {

    const [contactList, _setContactList] = useState([]);
    const contactListRef = useRef(contactList);
    const setContactList = (data) => {
        contactListRef.current = data;
        _setContactList(data);
    }


    const authUser = useAuth();
    const [userToAdd, setUserToAdd] = useState('');

    useEffect(() => {
        const contactsDbRef = db.ref('users/' + authUser.user.uid + '/contacts');

        const newContactListener = contactsDbRef.on('child_added', (newContact) => {
            setContactList([...contactListRef.current, newContact.key]);
        })



        return () => {
            contactsDbRef.off('child_added', newContactListener);
        }
    }, [])





    return (
        <Box border={1}>
            <h4>Contacts</h4>
            <List>
                {
                    contactList.map((contact) => {
                        return <UserCard
                            uid={contact}
                            key={contact}
                            handleClickOnDelete={() => { deleteContact(authUser.user.uid, contact) }}
                        />
                    })
                }
                <ListItem>
                    <form>
                        <TextField style={{ width: '70%' }} variant="outlined" label='Email'
                            onChange={(event) => { setUserToAdd(event.target.value) }}
                        />
                        <IconButton
                            onClick={(event) => {
                                event.preventDefault();
                                sendContactRequest(authUser.user.uid,userToAdd);
                            }}
                        >
                            <PersonAddIcon />
                        </IconButton>
                    </form>
                </ListItem>
            </List>
        </Box>
    );
}

export default Contacts;