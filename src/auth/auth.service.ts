import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/regitster.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const email = dto.email.toLowerCase().trim();

        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException(
                'User with this email already exists',
            );
        }

        const passwordHash = await hash(dto.password, 12);

        const user = await this.usersService.create({
            email,
            passwordHash,
        });

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
            },
            accessToken,
            tokenType: 'Bearer',
            expiresIn: 900,
        };
    }
    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(
            dto.email.toLowerCase().trim(),
        );

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordIsValid = await compare(
            dto.password,
            user.passwordHash,
        );

        if (!passwordIsValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        });

        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: 900,
        };
    }
}