import express from 'express';
import http from 'http';
import { Server as SocketIo } from 'socket.io';
import cors from 'cors';
import * as random from 'random';

const app = express();
const server = http.createServer(app);
const io = new SocketIo(server);

// Allow connections from any origin

// Dictionary to store active chat rooms
const chat_rooms = {};

const connected_users = [];

// Create a dictionary to store mappings of SIDs to rooms
const sid_to_room = {};

// Function to change the is_connected value
function change_is_connected(username, new_is_connected) {
  for (const user of connected_users) {
    if (user.sid === username) {
      user.is_connected = new_is_connected;
      break; // Exit the loop once the user is found
    }
  }
}

function get_rand_user(username) {

  const filtered_users = connected_users.filter(
    (user) => !user.is_connected && user.username !== username
  );
  io.emit('fuck2')

  // Check if there are any disconnected users
  if (filtered_users.length > 0) {
    // Select a random disconnected user
    
    var randomIndex = Math.floor(Math.random() * filtered_users.length);
    const random_user = filtered_users[randomIndex];
    io.emit('fuck', {username: 'CUNT'})
    io.emit('fuck', {username: random_user.sid})
    return random_user.sid;
    
} else {
    io.emit('fuck', {username: 'stright guy'})
    console.log('No disconnected users found.');
    return null;
  }
}

function get_user(id) {  
  const found_user = connected_users.find((user) => user.sid === id)
  return found_user ? found_user.username : null;
}

io.on('connection', (socket) => {
  socket.on('connect_to', (data) => {
    const username = data.username;
    console.log(`${username} connected`);
    connected_users.push({ username, is_connected: false, sid: socket.id });
    io.emit('message', { message: `${username} has connected` });
  });

  socket.on('join_room_random', (data) => {
    if (data.current_room) {
      socket.leave(data.current_room);
      socket.leave(data.current_room, data.sid);
      io.to(data.random_sid).emit('user_left');
    }
    
    const username = socket.id;
    const random_user = get_rand_user(data.username);
    
    console.log(random_user);
    // Emit a 'join_room' event for the random user
    if (random_user) {

      console.log(`${username} connected`);
      console.log(random_user);
      const room_name = `${username}-${random_user}`;
      const user = get_user(username);
      const rand_user = get_user(random_user);
      io.emit('fuck', {username : "HAHAHAHA"})
      io.emit('fuck', {username : String(random_user)});
      socket.join(room_name);
      socket.join(room_name, random_user);
      change_is_connected(username, true);
      change_is_connected(random_user, true);
      

      io.to(random_user).emit('join_room_for_random', {
        room: room_name,
        other_user: user,
        sid: username,
      });
      io.to(username).emit('join_room_for_user', {
        room: room_name,
        other_user: rand_user,
        sid: random_user,
      });

      io.to(`${username}-${random_user}`).emit('random_message', {
        message: `${user} has connected with ${rand_user}`,
      });

      io.to(username).emit('fuck', {username: 'hey asshole'})

    }
  });

  socket.on('join_room', (data) => {
    const room_name = data.room;
    socket.join(room_name);
  });

  socket.on('leave_room', (data) => {
    const room_name = data.room;
    socket.leave(room_name);
  });

  socket.on('disconnect', () => {
    const room_name = socket.id;
    socket.leave(room_name); // Leave the specified chat room
    io.emit('message', { message: `${username} has left the room` });
    const new_connected_users = connected_users.filter(
      (user) => user.sid !== socket.id
    );
    connected_users = new_connected_users;
    console.log(socket.id);
  });

  socket.on('get_random_user', () => {
    const random_user = get_rand_user(socket.id);
    if (random_user) {
      console.log(`Random disconnected user: ${random_user}`);
    } else {
      console.log('No disconnected users found.');
    }
  });

  socket.on('message', (data) => {
    const message = data.message;
    const room_name = data.room;
    const username = get_user(socket.id);
    console.log(`Received message in room ${room_name}: ${message}`);
    if (room_name.length === 0) {
        io.emit('user_message', {
                message, username,
        })
    } else {
        io.to(room_name).emit('user_message', {
                message,
                username,
                room: room_name,
              });
          }
        });
      });
      
      const PORT = process.env.PORT || 8000;
      server.listen(PORT, () => {
        console.log(`Server is running on 0.0.0.0:${PORT}`);
      });
      