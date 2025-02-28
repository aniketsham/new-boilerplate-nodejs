import { Router } from 'express';
import {
  forgotPasswordAdmin,
  getAllUsers,
  loginAdmin,
  registerAdmin,
  resetPasswordAdmin,
  updateAdmin,
} from '../controller/admin-controller';
import { registerAdminValidator } from '../validations/validation';
import { isAuthenticated } from '../middlewares/auth';
import { accessControl } from '../middlewares/accessControl';

const adminRouter = Router();

adminRouter.post('/register', registerAdminValidator, registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.get('/protected', isAuthenticated, (req, res) => {
  res.status(200).json({
    message: 'Welcome, admin! You have access to the protected route.',
    admin: req.body.role,
  });
});

adminRouter.post('/forgot-password', forgotPasswordAdmin);
adminRouter.put('/reset-password/:token', resetPasswordAdmin);
adminRouter.put('/update-admin', isAuthenticated, updateAdmin);
adminRouter.get(
  '/users',
  isAuthenticated,
  accessControl('get-users'),
  getAllUsers
);

export default adminRouter;
