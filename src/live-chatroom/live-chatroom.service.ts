import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Redis } from 'ioredis';

@Injectable()
export class LiveChatroomService {
    private redisClient: Redis;

    constructor(){
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIST_PORT || '6379', 10),
        })
    }

    async addLiveUserToChatroom(chatroomId: number, user:User): Promise<void> {
        const existingLiveIsers = await this.getLiveUsersForChatroom(chatroomId);

        const existingUser = existingLiveIsers.find(
            (liveUser) => liveUser.id === user.id,
        );
        if(existingUser){
            return;
        }
        await this.redisClient.sadd(
            `liveUser:chatroom:${chatroomId}`,
            JSON.stringify(user)
        )
    }

    async removeLiveUserFromChatroom(
        chatroomId: number,
        user: User,
    ): Promise<void> {
        await this.redisClient
        .srem(`liveUsers:chatroom:${chatroomId}`,JSON.stringify(user))
        .catch(err => {
            console.log('removeLiveUserFromChatroom error', err)
        })
        .then(res => {
            console.log('removeLiveUserFromChatroom res', res)
        })
    }

    async getLiveUsersForChatroom(chatroomId: number): Promise<User[]>{
        const users = await this.redisClient.smembers(
            `liveUsers:chatroom:${chatroomId}`,
        )
        return users.map((user) => JSON.parse(user))
    }
}
