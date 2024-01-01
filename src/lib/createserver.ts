import { Server, Socket } from 'socket.io'
import http from 'http'
import express from 'express'
import authRouter from '../auth/auth.router'
import cors from 'cors'
import * as ChatRooomService from '../chatroom/chatroom.service'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { AppError } from './utility-classes'
import { errorHandler, socketErrorHandler } from './middlewares'


dotenv.config()

const app = express();
const server = http.createServer(app)
const io = new Server(server);

app.use(cors)
app.use(express.json())
app.use('/auth', authRouter)
app.use(errorHandler)

const getUserIdFromSocket =(socket: Socket): string => {
    return socket.data.id;
}

const getChatRoomsIds =async (socket: Socket)=>{
    return await ChatRooomService.getUserChatRoomIds(socket.data.id);
}

//Jwt auths
io.use((socket, next)=>{
    const token = socket.handshake.auth.token;
    
    if(!token){
        next(new AppError('unauthorized', 'No Auth token available'))
    }
    if(!process.env.JWT_SECRET) throw new Error('Jwt Secret Not Found')

    jwt.verify(token, process.env.JWT_SECRET, (err: any, payload: any)=> {
        if(err){
            next(new AppError('unauthorized', 'Invalid token'))
        }

        socket.data.id = payload.id;
        next();
    })
})


io.on('connection', async (socket: Socket) =>{ 
    const rooms: string[] = await getChatRoomsIds(socket);
    socket.join(rooms);
    
    socket.on('chat message', async (msg, roomId) =>{
        if(await ChatRooomService.checkUserIsChatRoomMember(getUserIdFromSocket(socket), roomId)){
            const createdMessage = await ChatRooomService.createMessage(msg)
            io.to(roomId).emit('chat message', createdMessage)
        }
        else {
            socketErrorHandler(new AppError('unauthorized', 'Not a member of this server'), socket)
        }
    })
    socket.on('join room', async (roomId)=>{
        try {
            const user = await ChatRooomService.joinChatRoom(getUserIdFromSocket(socket), roomId)
            if(user){
                socket.join(roomId);
                io.to(roomId).emit('join room', `User ${user.username} joined`)
            }else throw new AppError('server', 'Something went wrong')
        }
        catch(error: any){
            if (error instanceof AppError) socketErrorHandler(error, socket)
        }
    })

    socket.on('leave room', async(roomId)=>{
        //Do something
    })

    socket.on('disconnect', (reason) =>{    
        //Do something
    })
})

export const startServer=(port: number)=>{
    app.listen(port, () => {
        console.log(`App listenig at ${port}`)
    })
} 