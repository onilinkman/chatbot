import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './Constants';

@Module({
    imports: [
        TypeOrmModule.forFeature([Auth]),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            /* signOptions:{expiresIn:'60s'} */
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
