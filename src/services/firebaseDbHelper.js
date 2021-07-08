import {db} from './firebase';

var uidToEmail = new Map();
var emailToUid = new Map();

db.ref('users/').on('child_added',(data) => {
    const email = data.child('email').val()
    uidToEmail.set(data.key,email);
    emailToUid.set(email,data.key);
})

function addUserToDb(user) {
    db.ref('users/'+user.uid).set({email: user.email});
}

function addUserToChat(uid,chatID){
    db.ref('users/'+uid+'/chats/').child(chatID).set(true);
    db.ref('chats/'+chatID+'/users/').child(uid).set(true);
}

function addUserEmailToChat(email,chatID){
    if(emailToUid.get(email) !== undefined){
        addUserToChat(emailToUid.get(email),chatID);
    }
}

function deleteUserFromChat(uid,chatID){
    db.ref('users/'+uid+'/chats/'+chatID).remove();
    db.ref('chats/'+chatID+'/users/'+uid).remove();
}

function createNewChat(uid){
    const newChatRef = db.ref('chats/').push();
    addUserToChat(uid,newChatRef.key);
}

function getEmailFromUid(uid){
    return uidToEmail.get(uid);
}


function deleteContact(uid1,uid2){
    db.ref('users/'+uid1+'/contacts/'+uid2).remove();
    db.ref('users/'+uid2+'/contacts/'+uid1).remove();
}


export {addUserToDb};
export {addUserToChat};
export {createNewChat};
export {getEmailFromUid};
export {deleteUserFromChat};
export {addUserEmailToChat};
export {deleteContact};