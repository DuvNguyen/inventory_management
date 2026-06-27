import { Request } from 'express';
import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export class RequestUser {
  userId!: string;
  email!: string;
  role!: Role;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}
