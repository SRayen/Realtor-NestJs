import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from '../dto/auth.dtos';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';

// interface SignupParams {
//   email: string;
//   password: string;
//   name: string;
//   phone: string;
// }

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signup({ name, email, password, phone }: SignupDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (userExists) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.prismaService.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: UserType.BUYER,
      },
    });
    return user;
  }
}
