/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBjTSzXFGoo7pPJN_kZkmDON-M8Fv_VG9U",
  authDomain: "chatrealtime-a6daa.firebaseapp.com",
  projectId: "chatrealtime-a6daa",
  storageBucket: "chatrealtime-a6daa.appspot.com",
  messagingSenderId: "485581093124",
  appId: "1:485581093124:web:96044444cf13be3682b851"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    const showNotification = (title, options) => {
      if (Notification.permission === 'granted') {
        new Notification(title, options);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const { text, uid } = lastMessage;

        // Show notification only if the message is not from the user
        if (uid !== auth.currentUser.uid) {
          showNotification('New Message', {
            body: text,
          });
        }
      }
    };

    // Set up visibility change event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Remove visibility change event listener on component unmount
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [messages]);


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
  };

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type..." />

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://images.pexels.com/photos/18028919/pexels-photo-18028919/free-photo-of-brown-cow-lying-on-grass-on-pasture.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} alt="User Avatar" />
      <p>{text}</p>
    </div>
  );
}

export default App;
