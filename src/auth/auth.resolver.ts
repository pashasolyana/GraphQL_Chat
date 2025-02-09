import { Resolver, Mutation, Args, Context} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse, RegisterResponse } from './types';
import { LoginDto, RegisterDto } from './dtos/dto';
import { Request, Response } from 'express';
import { BadRequestException, UseFilters } from '@nestjs/common';
import { GraphQLErrorFilter } from 'src/filter/custom.exceptions';

@UseFilters(GraphQLErrorFilter)
@Resolver()
export class AuthResolver {

    constructor(private readonly authService: AuthService){}

    @Mutation(() => RegisterResponse)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: { res: Response }
    ){
        if(registerDto.password !== registerDto.confirmPassword){
            throw new BadRequestException({confirmPassword: "Password and confirm password are not the same."})
        }
        const { user } = await this.authService.register(registerDto, context.res)
        return { user }
    }

    @Mutation(() => LoginResponse)
    async login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: { res: Response }
    ){
        return this.authService.login(loginDto, context.res)
    }

    @Mutation(() => String)
    async logout(@Context() context: { res: Response }){
        return this.authService.logout(context.res)
    }

    @Mutation(() => String)
    async refreshToken(@Context() context: { res: Response , req: Request}){
        try{
            return this.authService.refreshToken(context.req, context.res);
        }catch(e){
            throw new BadRequestException(e.message);
        }
    }

}
