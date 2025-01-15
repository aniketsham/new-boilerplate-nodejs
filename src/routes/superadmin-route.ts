import { Router } from 'express';
import { getAllUsers } from '../controller/admin-controller';
import {
  loginSuperAdmin,
  registerSuperAdmin,
  createAdminBySuperAdmin,
  updateAdminBySuperAdmin,
  deleteAdminBySuperAdmin,
  getAllAdmins,
  getAdminById,
} from '../controller/superadmin-controller';
import { registerAdminValidator } from '../validations/validation';
import { isAuthenticated } from '../middlewares/auth';

const superadminRouter = Router();

superadminRouter.post('/register', registerSuperAdmin);
superadminRouter.post('/login', loginSuperAdmin);
superadminRouter.post(
  '/create-admin',
  isAuthenticated,
  registerAdminValidator,
  createAdminBySuperAdmin
);
superadminRouter.put(
  '/update-admin/:adminId',
  isAuthenticated,
  updateAdminBySuperAdmin
);
superadminRouter.delete(
  '/delete-admin/:adminId',
  isAuthenticated,
  deleteAdminBySuperAdmin
);

superadminRouter.get('/get-all-admin', isAuthenticated, getAllAdmins);
superadminRouter.get('/get-admin/:adminId', isAuthenticated, getAdminById);
superadminRouter.get('/protected', isAuthenticated, (req, res) => {
  res.status(200).json({
    message: 'Welcome, super admin! You have access to the protected route.',
    admin: req.body.role,
  });
});

superadminRouter.get('/users', isAuthenticated, getAllUsers);

export default superadminRouter;
