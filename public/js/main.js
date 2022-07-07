const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const typing = document.querySelector('.typing');
const msg = document.getElementById('msg');
const socket = io(); 

//Get username and room from url
let params = (new URL(window.location.href)).searchParams;
var username = params.get('username') 
var room = params.get('room')

//JOIN CHATROOM
socket.emit('joinRoom',{username,room});

//Get room and users
socket.on('roomUsers',({room,users}) =>{
    // Add room name to dom
    roomName.innerText = room;
    // Add users to dom
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
});

//Message from server
socket.on('message',message=>{
    outputMessage(message);
    //remove the typing text
    typing.innerHTML = '';
    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message Submit
chatForm.addEventListener('submit',(e)=>{
    //when you submit a form it automatically saves to a file. Pprevent this by using the default.
    e.preventDefault();
    //GETTING MESSAGE TEXT 
    const msg = e.target.elements.msg.value;
    //EMITING A MESSAGE TO THE SERVER
    socket.emit('chatMessage',msg);
    e.target.elements.msg.value = '';
})

msg.addEventListener('keypress',()=>{
    socket.emit('typing',{username,room});
})

socket.on('typing',(data)=>{
    typing.innerHTML = data;
})

//Output message to dom
function outputMessage(message) {
    const div = document.createElement('div');
    if(message.username === ''){
        div.classList.add('botmessage');
        div.innerHTML = `<p class="text">
            ${message.text}
        </p>`;
    }else{
        div.classList.add('message');
        if(message.username === username){
            div.classList.add('right');
        }
        div.innerHTML = `<p class="meta">${message.username}<span>&nbsp;${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p>`;
    }
    chatMessages.appendChild(div);
    chatMessages.innerHTML += `<br>`;
}
