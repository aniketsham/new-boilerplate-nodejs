import { Router } from 'express';
import {
  forgotPasswordAdmin,
  getAllUsers,
  loginAdmin,
  registerAdmin,
  resetPasswordAdmin,
} from '../controller/admin-controller';
import { registerAdminValidator } from '../validations/validation';
import { isAuthenticated } from '../middlewares/auth';

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

adminRouter.get('/users', isAuthenticated, getAllUsers);

export default adminRouter;
