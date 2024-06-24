import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'

@Injectable()
export class GraphqlAuthGuard implements CanActivate{

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlCtx = context.getArgByIndex(2);
        const request: Request = gqlCtx.req;
        const token = this.extractTokenFromCookie(request)
        if(!token) throw new UnauthorizedException()
        try{
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('ACCESS_TOKEN_SECRET'),
            });
            console.log('payload', token)
            request['user'] = payload;
        }catch(e){
            console.log('error', e)
            throw new UnauthorizedException()
        }
        return true;
    }

    private extractTokenFromCookie(request: Request): string | undefined {
        return request.cookies?.access_token;
    }

}