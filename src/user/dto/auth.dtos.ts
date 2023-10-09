import {
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(5)
  password: string;
}

export class SigninDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
