import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app'; //Import firbase sdk
import 'firebase/compat/firestore'; //Import firestore for database
import 'firebase/compat/auth'; //Import for user authentication
import 'firebase/compat/analytics'; //Import for analytics


//Imports to make firebase and react work together
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCHusESe7uiMQV-TVfTjVcBIdKMj_uPz-Q",
  authDomain: "reactchatapp-97ee8.firebaseapp.com",
  projectId: "reactchatapp-97ee8",
  storageBucket: "reactchatapp-97ee8.appspot.com",
  messagingSenderId: "721452045279",
  appId: "1:721452045279:web:9fb38d7b869dd0efd96a6a",
  measurementId: "G-NHRL4RDTKQ"
})

//References to the auth and firestore database as global varibales
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {

  //Returns user info if logged in, null if logged out
  const [user] = useAuthState(auth);

  //If user is logged in, show chatroom, otherwise show sign in page
  return (
    <div className="App">
      <header>
        <h1>React & Firebase Chat</h1>
        <SignOut />
      </header>
      <section>
        {user ? <Chatroom /> : <SignIn />} 
      </section>
    </div>
  );
}

//Sign in page
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider(); //Create new google auth provider
    auth.signInWithPopup(provider); //Trigger sign in with google popup
  } 

  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && ( //Checks if there is a current user

  <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button> //Sign out if there is a current user
  )
}

//Chatroom page
function Chatroom() {

  const dummy = useRef(); //Create a dummy reference to use for the scroll to bottom function


  const messagesRef = firestore.collection('messages'); //Reference to the messages collection in the database
  const query = messagesRef.orderBy('createdAt').limitToLast(25); //Limit the number of messages to 25

  const [messages] = useCollectionData(query, { idField: 'id' }); //Use the query to get the messages from the database

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault(); //Prevent the default behaviour of the form from submitting
    
    const {uid, photoURL} = auth.currentUser; //Get the user id and photo url from the current user
    
    await messagesRef.add({ //Add the message to the database
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue(''); //Clear the form value

    dummy.current.scrollIntoView({ behavior: 'smooth' }); //Scroll to bottom of the chatroom
  
  }
    //Map through the messages and display them
  return (
    <>
      
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)} 

        <div ref={dummy}></div>
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit">Send</button>
      </form>
    </>

    
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message; //Get the message text and the user id from the message object

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'; //If the user id is the same as the current user id, set the class to sent, otherwise set the class to received

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  ) 
}

export default App;
