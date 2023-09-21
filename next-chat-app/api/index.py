from flask import Flask, render_template, request
from waitress import serve
from flask_socketio import SocketIO, join_room, leave_room
import random
import eventlet

eventlet.monkey_patch()

app = Flask(__name__)

# Allow connections from http://localhost:3000
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

# Dictionary to store active chat rooms
chat_rooms = {}
connected_users = [

]

# Create a dictionary to store mappings of SIDs to rooms
sid_to_room = {}

# Function to change the is_connected value
def change_is_connected(username, new_is_connected):
    for user in connected_users:
        if user['sid'] == username:
            user['is_connected'] = new_is_connected
            break  # Exit the loop once the user is found

def get_rand_user(username):
    print(connected_users)
    filtered_users = [user for user in connected_users if user['is_connected'] == False and user['username'] != username]

    # Check if there are any disconnected users
    if filtered_users:
        # Select a random disconnected user
        random_user = random.choice(filtered_users)
        username = random_user['sid']
        return username
    else:
        print("No disconnected users found.")

def get_user(id):
    found_user = None
    for user in connected_users:
        if user['sid'] == id:
            found_user = user['username']
            break
    return found_user

@socketio.on('connect_to')
def handle_connect(data):
    username = data['username']

    print(f'{username} connected')
    
    connected_users.append({'username': username, 'is_connected': False,'sid': request.sid})
    socketio.emit('message', {'message': f'{username} has connected'})

@socketio.on('join_room_random')
def handle_join_room_random(data):

    print(data)
    if data.get('current_room'):
        print(data.get('random_sid'))
        leave_room(data['current_room'])
        leave_room(data['current_room'], sid=data['sid'])
        print("FAGFDSAFDSFHEY")

        socketio.emit('user_left', room=data.get('random_sid'))

    username = request.sid
    random_user = get_rand_user(data.get('username'))

    print(random_user)

    # Emit a 'join_room' event for the random user
    if random_user:
        print(f'{username} connected')
        print(random_user)
        room_name = f'{username}-{random_user}'
        user = get_user(username)
        rand_user = get_user(random_user)
        join_room(room_name)
        join_room(room_name, sid=random_user)
        change_is_connected(username, True)
        change_is_connected(random_user, True)

        socketio.emit('join_room_for_random', {'room': room_name, 'other_user': user, 'sid': username}, room=random_user)
        socketio.emit('join_room_for_user', {'room': room_name, 'other_user': rand_user, 'sid': random_user}, room=username)

        socketio.emit('random_message', {'message': f'{user} has connected with {rand_user}'}, room=f'{username}-{random_user}')

@socketio.on('join_room')
def handle_join_room(data):

    room_name = data['room']
    join_room(room_name)
    # Emit a 'join_room' event for the random user
    # socketio.emit('join_room', {'room': room_name}, room=room_name)

    # socketio.emit('user_message', {'message': f'{username} has connected with {random_user}',
    # 'user1': username,'user2': random_user}, room=f'{username}-{random_user}')


@socketio.on('leave_room')
def handle_room_leave(data):
    room_name = data['room']
    leave_room(room_name)



@socketio.on('disconnect')
def handle_disconnect():
    room_name = request.sid

    leave_room(room_name)  # Leave the specified chat room
    socketio.emit('message', {'message': f'{username} has left the room'}, room=room_name)
    new_connected_users = [user for user in connected_users if user['sid'] == request.sid]
    connected_users = new_connected_users
    print(request.sid)

@socketio.on('get_random_user')
def handle_random_room():
    # username = data['username']
    # room = data['room']
    # join_room(room);
    # socket.io.emit('message', {'message': f'{username} has joined the room'})
    filtered_users = [user for user in connected_users if not user['is_connected']]

    # Check if there are any disconnected users
    if filtered_users:
        # Select a random disconnected user
        random_user = random.choice(filtered_users)
        username = random_user['username']
        print(f"Random disconnected user: {username}")
    else:
        print("No disconnected users found.")

@socketio.on('message')
def handle_message(data):
    message = data['message']
    room_name = data['room']
    username = get_user(request.sid)
    print(f'Received message in room {room_name}: {message}')
    socketio.emit('user_message', 
    {'message': message, 'username' : username, 'room': room_name}, room=room_name)

if __name__ == '__main__':
    print("Server is running on http://localhost:8000")
    socketio.run(app, debug=True, host='localhost', port=8000) 
