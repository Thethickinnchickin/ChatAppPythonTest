import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(''); 
  const [randomUser, setRandomUser] = useState();// Default room
  const [randomUserID, setRandomUserID] = useState();
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false)

  useEffect(() => {
    // Connect to the server via WebSocket
    const socket = io('http://localhost:8000'); // Replace with your server's URL
    setSocket(socket);

    // Listen for incoming messages
    socket.on('user_message', (data) => {
      if(data.room) {
        console.log("heyyeyeyye")
        setCurrentRoom(`${data.room}`)
      }


      setMessages((prevMessages) => [...prevMessages,
         {'message':data.message,
        'username': data.username}]);
    });

    // Listen for incoming messages
    socket.on('random_message', (data) => {


      

    });

    socket.on('thign', (data) => {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });

    socket.on('join_room_for_random', (data) => {
        setMessages([])
        socket.emit('join_room',  {'room': data.room, 'username': username})
        setRandomUser(data.other_user)
        setRandomUserID(data.sid)
        setCurrentRoom(data.room)
    });

    socket.on('join_room_for_user', (data) => {
      setMessages([])
      setRandomUser(data.other_user)
      setRandomUserID(data.sid)
      setCurrentRoom(data.room)
  });

  socket.on('user_left' , (data) => {
    setRandomUser('');
    setCurrentRoom('');
    setRandomUserID('');
    setMessages([])
    console.log("Hey Matt")
  })


    // Cleanup when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);
  // Create a ref for the chatbox element
  const chatboxRef = useRef(null);

  useEffect(() => {
    // ... (other useEffect code)

    if (chatboxRef.current) {
      // Whenever messages change and chatboxRef is available, scroll to the bottom of the chatbox
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() !== '') {
      socket.emit('message', { message: newMessage, room: currentRoom });
      setNewMessage('');
    }
  };

  // const connect = (room) => {
  //   // Emit a 'leave_room' event to leave the current room
  //   socket.emit('leave_room', { room: currentRoom, username: username });

  //   // Join the selected room
  //   socket.emit('join_room', { room, username:  username});

  //   // Update the current room state
  //   setCurrentRoom(room);

  //   // Clear the message list for the new room
  //   setMessages([]);

  //   setIsUsernameSet(true)
  // };
  const connect = async () => {
    // Emit a 'connect_to' event with the username 'Matt'
    await socket.emit('connect_to', { username: username });
    setIsUsernameSet(true)
  };

  const random = () => {

    if(randomUser) {
      console.log("1")
      console.log(randomUserID)
      socket.emit('join_room_random', {'username': username,
      'current_room': currentRoom, 'sid': randomUserID});
    } else {
      console.log("2")
      socket.emit('join_room_random', {'username': username});
    }
    
  };
  

  return (
    <div className='custom-container'>
      {isUsernameSet ? (
      <>
        <div className="row">
          <div className="col-2 d-flex h-100 text-light">
              <div className='row title-card text-center'>
                <h1 className='mt-3'
                    style={{

                  fontFamily: 'Calibri',
                  fontWeight: 'bold', // Set the font-weight to 'bold'
                  fontStyle: 'italic',
                  fontSize: '21px' // Set the font-family to 'Calibri'
                  }}>Welcome To</h1>
              <h1 style={{

          fontFamily: 'MS Gothic', // Set the font-family to 'MS Gothic'
          fontWeight: 'bold', // Set the font-weight to 'bold'
          fontStyle: 'italic',
          fontSize: '21px'
          // Set the font-style to 'italic'
              }} >Random Chatter</h1>
              <h1  style={{

fontFamily: 'Calibri', // Set the font-family to 'MS Gothic'
fontWeight: 'bold', // Set the font-weight to 'bold'
fontStyle: 'italic',
fontSize: '51px'
// Set the font-style to 'italic'
    }} >Username: {username}</h1>
              <h1  style={{backgroundColor: 'green',

fontFamily: 'Calibri', // Set the font-family to 'MS Gothic'
fontWeight: 'bold', // Set the font-weight to 'bold'
fontStyle: 'italic',
fontSize: '31px'
// Set the font-style to 'italic'
    }}>You are connected To: {randomUser}</h1>
                <div className="room-buttons my-3">
                  <button style={{

fontFamily: 'Calibri', // Set the font-family to 'MS Gothic'
fontWeight: 'bold', // Set the font-weight to 'bold'
fontStyle: 'italic',
fontSize: '31px',
borderRadius: '10px'
// Set the font-style to 'italic'
    }}  className='join' onClick={() => random()}>Join Random </button>
                </div>

              </div>
          </div>
          <div className="col-1"></div>
          <div className="col-7 ">
          <div className='row'>
            <p className='float-left'  style={{

fontFamily: 'MS Gothic', // Set the font-family to 'MS Gothic'
fontWeight: 'bold', // Set the font-weight to 'bold'
fontStyle: 'italic',
fontSize: '21px'
// Set the font-style to 'italic'
    }} >Random Chatter</p>
          </div>
          
          <div className='chatbox' ref={chatboxRef} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className='row'>
              {/* Map over messages and render them */}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message-container
                   ${message.username !== username ? '' : 'to'}`}
                   // Set a maximum width of 50% for 'from' messages
                >
                  <div className='row'>
                    { message.username !== username ? (
                      <>
                        
                        <div className='col-6 ml-5'>    
                        <div className='row ml-5 from-text'
                        style={{ 
                          marginLeft: '10%'}}>From {message.username} </div> 
                        <div className='row'>                        
                        <div style={{ 
                        float: 'left'}} className={`message from ml-5 px-2`}>
                        
                        {message.message}
                          
                        </div>
                        </div>

                      </div>
                      <div className='col-6'></div>
                          </>

                    ) : (
                      <>
                      <div className='row'>
                      <div className='col-8 my-3'></div>
                        <div className='col-4'>
                        <div className='row from-text' 
                        >From {message.username} </div> 
                        <div className='row' >                        
                        <div style={{ maxWidth: '100%' ,
                        float: 'left'}}  className={`message fuck my-1 px-2`}>
                        
                        {message.message}
                          
                        </div>
                        </div>
                          </div>
                        </div>


                            </>
                    )}


                  </div>

                </div>
              ))}
            </div>

          </div>
          <div className="input-container mt-5">
            <div className='row'>
              <div className='col'>
                <button className='send-button join' onClick={sendMessage}>Send</button>

              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                className='send-input'
                onChange={(e) => setNewMessage(e.target.value)}
              />
              </div>
            </div>

          </div>
            
            
          </div>
          <div className="col-1"></div>
        </div>

          {/* <div className="room-buttons">
            

            <button onClick={() => random()}>Join Random </button>
          </div>
          <div className="message-list">
            {messages.map((message, index) => (
              <div key={index} className="message">
                {message}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            {randomUser}
          </div> */}
        </>

      ) : (
        <>
          <div className="row my-5">
            <div className="col d-flex align-items-center justify-content-center">
              <div className="row text-center">
                <div className="row text-white main-card d-flex justify-content-center
                text-center">
                  <div className='row text-center mt-5 welcome-text'><div   style={{

            fontFamily: 'Calibri',
            fontWeight: 'bold', // Set the font-weight to 'bold'
            fontStyle: 'italic',
            fontSize: '51px' // Set the font-family to 'Calibri'
          }} >Welcome To</div></div>
                  
                  <div className='row mb-3'><div   style={{

            fontFamily: 'MS Gothic', // Set the font-family to 'MS Gothic'
            fontWeight: 'bold', // Set the font-weight to 'bold'
            fontStyle: 'italic',
            fontSize: '51px'
            // Set the font-style to 'italic'
          }} >Random Chatter</div></div>
                  
                </div>
              </div>
            </div>
          </div>
          <div className="row my-5">
            <div className="col d-flex align-items-center justify-content-center">
              <div className="row text-center">
                <div className="row text-white  d-flex justify-content-center
                text-center">
              
                  <div className='row'><h1 className='text-dark'>Enter Your Username to Join</h1></div>
                  <div className='row'><input className='mx-auto'
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  style={{ width: '380px', height: '60px',
                borderRadius: '10px'
                , textAlign: 'center' }} type='string' ></input></div>
                  
                </div>
              </div>
            </div>
          </div>

          <div className="row my-5">
            <div className="col d-flex align-items-center justify-content-center">
              <div className="row text-center">
                <div className="row text-white 
                d-flex justify-content-center
                text-center">
              
            
                  <div className='row'>
                  <button
                    className='mx-auto join'
                    style={{
                      width: '180px',
                      height: '60px',
                      borderRadius: '10px',
                      fontSize: '31px'
                    }}
                    onClick={connect}
                    type='string'
                    disabled={username.length < 1} // Disable the button if username.length is 0
                  >
                    Join
            
                  </button>
        </div>
                </div>
              </div>
            </div>
          </div>
        </>

      )}


    </div>
  );
};

export default Chat;
