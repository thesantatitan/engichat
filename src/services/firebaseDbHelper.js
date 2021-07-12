import { db } from './firebase';

var uidToEmail = new Map();
var emailToUid = new Map();

db.ref('users/').on('child_added', (data) => {
    const email = data.child('email').val()
    uidToEmail.set(data.key, email);
    emailToUid.set(email, data.key);
})

function addUserToDb(user) {
    db.ref('users/' + user.uid).set({ email: user.email });
}

function addUserToChat(uid, chatID) {
    db.ref('users/' + uid + '/chats/').child(chatID).set(true);
    db.ref('chats/' + chatID + '/users/').child(uid).set(true);
}

function addUserEmailToChat(email, chatID) {
    if (emailToUid.get(email) !== undefined) {
        addUserToChat(emailToUid.get(email), chatID);
    }
}

function deleteUserFromChat(uid, chatID) {
    db.ref('users/' + uid + '/chats/' + chatID).remove();
    db.ref('chats/' + chatID + '/users/' + uid).remove();
}

function createNewChat(uid) {
    const newChatRef = db.ref('chats/').push();
    addUserToChat(uid, newChatRef.key);
}

async function getEmailFromUid(uid) {
    let email = await (await db.ref('users/' + uid + '/email').get()).val();
    return email;
}


function deleteContact(uid1, uid2) {
    db.ref('users/' + uid1 + '/contacts/' + uid2).remove();
    db.ref('users/' + uid2 + '/contacts/' + uid1).remove();
}

function sendContactRequest(senderUID, recieverMail) {
    db.ref('users/' + emailToUid.get(recieverMail) + '/requests/recieved/' + senderUID).set(true);
    db.ref('users/' + senderUID + '/requests/sent/' + emailToUid.get(recieverMail)).set(true);
}

function addUserToContact(senderUID, recieverMail) {
    if (emailToUid.get(recieverMail) !== undefined) {
        db.ref('users/' + emailToUid.get(recieverMail) + '/contacts/' + senderUID).set({ inCall: false });
        db.ref('users/' + senderUID + '/contacts/' + emailToUid.get(recieverMail)).set({ inCall: false });
    }
}

function sendMessage(senderUID, recieverUID, message) {
    const newmsgref = db.ref('users/' + senderUID + '/contacts/' + recieverUID + '/messages').push({ sender: senderUID, text: message });
    db.ref('users/' + recieverUID + '/contacts/' + senderUID + '/messages/' + newmsgref.key).set({ sender: senderUID, text: message });
}

function sendMessageToChatRoom(senderUID, chatID, message) {
    db.ref('chats/' + chatID + '/messages').push({ sender: senderUID, text: message });
}

export { addUserToDb };
export { addUserToChat };
export { createNewChat };
export { getEmailFromUid };
export { deleteUserFromChat };
export { addUserEmailToChat };
export { deleteContact };
export { sendContactRequest };
export { addUserToContact };
export { sendMessage };
export { sendMessageToChatRoom };