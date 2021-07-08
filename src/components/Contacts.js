import React, { useState, useEffect, useRef } from 'react';
import Box from '@material-ui/core/Box';
import { db } from '../services/firebase';
import { useAuth } from '../services/AuthContext';
import { deleteContact, addUserToContact } from '../services/firebaseDbHelper';
import UserCard from './UserCard';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

const Contacts = (props) => {

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


    useEffect(() => {
        const contactsDbRef = db.ref('users/' + authUser.user.uid + '/contacts');
        const deleteContactListener = contactsDbRef.on('child_removed', (deletedContact) => {
            let newContactList = contactListRef.current.slice();
            newContactList.splice(newContactList.indexOf(deletedContact.key), 1);
            setContactList(newContactList);
        })

        return () => {
            contactsDbRef.off('child_removed', deleteContactListener);
        }
    }, [])



    return (
        <Box border={1} p={'4px'}>
            <h4>Contacts</h4>
            <List>
                {
                    contactList.map((contact) => {
                        return (
                            <div
                                style={{
                                    borderStyle: props.currentContact === contact ? 'solid' : 'none',
                                    borderColor: 'green',
                                    borderWidth: '4px',
                                }}
                                key={contact}
                                onClick={() => {props.currentContact===contact?props.updateContact(''):props.updateContact(contact)}}
                            >
                                <UserCard
                                    uid={contact}
                                    handleClickOnDelete={() => { deleteContact(authUser.user.uid, contact) }}
                                />
                            </div>
                        );
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
                                addUserToContact(authUser.user.uid, userToAdd);
                            }}
                        >
                            <PersonAddIcon />
                        </IconButton>
                    </form>
                </ListItem>
            </List>
        </Box >
    );
}

export default Contacts;