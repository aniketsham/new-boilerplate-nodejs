import { Request, Response, NextFunction } from 'express';
import Admin from '../models/admin-model';
import jwt from 'jsonwebtoken';
import User from '../models/user-model';
import { sendResetEmail } from '../helpers/sendResetEmail';
import { CustomRequest } from '../types/types';

export const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ error: 'Admin already exists' });
      return;
    }

    const existingAdminByMobile = await Admin.findOne({ mobileNumber });
    if (existingAdminByMobile) {
      res.status(400).json({ error: 'Mobile number already exists' });
      return;
    }

    const newAdmin = new Admin({
      fullName,
      email,
      mobileNumber,
      password,
    });
    await newAdmin.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    console.log(`Login attempt with email: ${email}`);
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ error: 'Invalid Credentials' });
      return;
    }

    const isPasswordValid = await admin.comparePassword(password);
    console.log(`Password valid: ${isPasswordValid}`);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid Password' });
      return;
    }
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    res
      .status(200)
      .cookie('token', token)
      .json({
        message: 'Login successful',
        admin: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          mobileNumber: admin.mobileNumber,
        },
        token,
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find();

    res.status(200).json({
      message: 'Users retrieved successfully',
      users: users,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    const resetToken = jwt.sign(
      { email: admin.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '10m' }
    );

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const emailResponse = await sendResetEmail(email, resetUrl);
    if (emailResponse.success) {
      console.log('Email sent successfully');
    } else {
      console.log('Error sending email');
    }
    res.status(200).json({
      message:
        'Password reset URL generated. Check the server logs for the URL.',
      resetUrl,
    });
  } catch (error) {
    console.error('Error in forgotPasswordAdmin:', error);
    next(error);
  }
};

export const resetPasswordAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decoded = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;
    const email = decoded.email;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match' });
      return;
    }

    admin.password = password;
    console.log('New password: ', admin.password);
    await admin.save();
    console.log('Password reset successfully', admin.password);

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Password reset successfully', token });
  } catch (error) {
    console.error('Error in resetPasswordAdmin:', error);
    next(error);
  }
};

export const updateAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { adminId } = req.user?.id;
    const { fullName, email, mobileNumber } = req.body;

    interface adminUpdateType {
      fullName?: string;
      email?: string;
      mobileNumber?: string;
    }
    const updateData: Partial<adminUpdateType> = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    res.status(200).json({
      message: 'Admin updated successfully',
      admin: updatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};
