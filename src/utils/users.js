const users = []

// addUser, removeUser, getUser, getUsersInRconst 
addUser = ({id,username,room})=>{
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  if (!username || !room){
    return {
      error : "Username and room are required!"
    }
  }

  // Check for existing suer
  const existingUser = users.find((user)=>{
    return user.room===room && user.username===username
  })

  // Validate username
  if (existingUser){
    return{
      error:"Username is in use!"
    }
  }

  // Store user
  const user = {id,username,room}
  users.push(user)
  return {user}
}

const removeUser = (id)=>{
  const index = users.findIndex((user)=>{
    return user.id===id
  })
  if(index !== -1){
    return users.splice(index,1)[0]
  }
}

const getUser =(id)=>{
  const user = users.filter((user)=>{
    return user.id===id
  })
  return user[0]
}

const getUsersInRoom = (room)=>{
  const usersinRoom = users.filter((user)=>{
    return user.room===room
  })
  return usersinRoom
}

module.exports={
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}

