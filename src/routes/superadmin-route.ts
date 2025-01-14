import { Router } from 'express';
import {
  getAllUsers,
  createAdminBySuperAdmin,
} from '../controller/admin-controller';
import {
  loginSuperAdmin,
  registerSuperAdmin,
  forgotPasswordSuperAdmin,
  resetPasswordSuperAdmin,
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
superadminRouter.get('/protected', isAuthenticated, (req, res) => {
  res.status(200).json({
    message: 'Welcome, super admin! You have access to the protected route.',
    admin: req.body.role,
  });
});

superadminRouter.post('/forgot-password', forgotPasswordSuperAdmin);
superadminRouter.put('/reset-password/:token', resetPasswordSuperAdmin);

superadminRouter.get('/users', isAuthenticated, getAllUsers);

export default superadminRouter;
