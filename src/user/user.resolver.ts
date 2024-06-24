import {  Resolver, Context, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.types';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/guards/graphql-auth.guard';
import { createWriteStream } from 'fs';
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import * as GraphQlUpload from 'graphql-upload/GraphQLUpload.js';

@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService){}
    
    @Query(() => String)
    sayHello(): string {
      return 'Hello World!';
    }

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async updateProfile(
        @Args('fullname') fullname: string,
        @Args('file', {type: () => GraphQlUpload, nullable: true })
        file: GraphQlUpload.FileUpload,
        @Context() context: {req: Request}
    ) {
        console.log(file)
        const imageUrl = file ? await this.storeImageAndGetUrl(file) : null;
        const userId = context.req.user.sub;
        return this.userService.updateProfile(userId,fullname,imageUrl)
    }

    private async storeImageAndGetUrl(file: GraphQlUpload) {
        const { createReadStream, filename } = await file;
        const uniqueFilename = `${uuidv4()}_${filename}`;
        const imagePath = join(process.cwd(), 'public', 'images', uniqueFilename);
        const imageUrl = `${process.env.APP_URL}/images/${uniqueFilename}`;
        const readStream = createReadStream();
        readStream.pipe(createWriteStream(imagePath));
        return imageUrl;
    }

    @UseGuards(GraphqlAuthGuard)
    @Query(() => [User])
    async searchUsers(
        @Args('fullname') fullname: string,
        @Context() context: {req: Request}
    ){
        return this.userService.searchUsers(fullname, context.req.user.sub)
    }

    @UseGuards(GraphqlAuthGuard)
    @Query(() => [User])
    getUsersOfChatroom(@Args('chatroomId') chatroomId: number){
        return this.userService.getUsersOfChatroom(chatroomId);
    }


}
