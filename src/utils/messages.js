const generateMessage = (username, room, text)=>{
  return {
    username,
    room,
    text,
    createdAt : new Date().getTime()
  }
}

module.exports={
  generateMessage
}
