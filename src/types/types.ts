import { Request } from 'express';
import { Admin } from '../models/admin-model';
import UserModel from '../models/user-model';
import { ISuperAdmin } from '../models/superadmin-model';
export interface CustomRequest extends Request {
  admin?: Admin;
  user?: typeof UserModel | Admin | ISuperAdmin;
}