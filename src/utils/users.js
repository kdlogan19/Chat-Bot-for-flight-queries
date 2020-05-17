const users = []

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: "Username and room are required!"
        }
    }

    //Unique username

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser){
        return  {
            error: "This username is already taken"
        }
    }

    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id == id)

    if(index != -1){
        return users.splice(index, 1)[0]
    }


}

const getUser = (id) => {
    const user = users.find((user) => user.id == id)
    if(!user){
        return {error: 'User not found'}
    }
    return {user}
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = []
    users.find((user) => {
        if(user.room === room){
            usersInRoom.push(user)
        }
    })
    if(!usersInRoom){
        return {
            error:'No users found'
        }
    }
    return usersInRoom
}
// addUser({id:21, username:'  kirti', room:'Room1' })
// addUser({id:22, username:'  piyush', room:'Room1' })
// addUser({id:23, username:'  Karan', room:'Room1' })
// addUser({id:1, username:'  piyush', room:'Room2' })
// console.log(users);
// removeUser(21)
// console.log(users);
// console.log("Get method:" , getUser(22));
// console.log("users in a room: ", getUsersInRoom('room1'));

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}