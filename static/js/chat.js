const socket = io()

const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $locationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")
const $sidebar = document.querySelector("#sidebar")

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const urlTemplate = document.querySelector("#url-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoscroll =()=>{
  // New message element
  const $newMessage = $messages.lastElementChild
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on("message", (obj)=>{
  const createdAt = moment(obj.createdAt).format("h:mm:ss a");
  const msg = obj.text
  const username = obj.username
  const room = obj.room
  console.log(msg)
  const html = Mustache.render(messageTemplate, {username, room, msg, createdAt})
  $messages.insertAdjacentHTML("beforeend", html)
  autoscroll()
})

socket.on("locationMessage", (obj)=>{
  const createdAt = moment(obj.createdAt).format("h:mm:ss a")
  const url = `${obj.text}`
  const username = obj.username
  const room = obj.room
  console.log(url);
  const html = Mustache.render(urlTemplate, {username, room, url,createdAt})
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
})

$messageForm.addEventListener("submit", (e)=>{
  e.preventDefault()
  $messageFormButton.setAttribute("disabled", "disabled")
  
  const msg = e.target.elements.message.value
  socket.emit("sendMessage", msg, (msg2)=>{
    $messageFormButton.removeAttribute("disabled")
    $messageFormInput.value=""
    $messageFormInput.focus()
    console.log(msg2)
  });
})

$locationButton.addEventListener("click",()=>{
  $locationButton.setAttribute("disabled", "disabled")
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser")
  }
  navigator.geolocation.getCurrentPosition((pos)=>{
    socket.emit("location", username, room, pos.coords.longitude, pos.coords.latitude, ()=>{
      console.log("Location shared!")
      $locationButton.removeAttribute("disabled")
    });
  })
})


socket.on("roomData",({room,users})=>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  })
  $sidebar.innerHTML = html
})


socket.emit("join", {username,room}, (error)=>{
  if(error){
    alert(error);
    location.href="/"
  }
})


