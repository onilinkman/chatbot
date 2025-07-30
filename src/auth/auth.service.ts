import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,
    ) {}

    create(createAuthDto: CreateAuthDto) {
        return 'This action adds a new auth';
    }

    async login(loginAuthDto: LoginAuthDto) {
        const { password, username } = loginAuthDto;
        const user = await this.authRepository.findOne({
            where: { username },
            select: {
                username: true,
                password: true,
            },
        });
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }
        if (!password) {
            throw new UnauthorizedException('Debe ingresar algun password');
        }
        if (!bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedException('Usuario o contraseña incorrecta');
        }
        return user;
    }

    findAll() {
        return `This action returns all auth`;
    }

    findOne(id: number) {
        return `This action returns a #${id} auth`;
    }

    update(id: number, updateAuthDto: UpdateAuthDto) {
        return `This action updates a #${id} auth`;
    }

    remove(id: number) {
        return `This action removes a #${id} auth`;
    }
}
