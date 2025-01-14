import { Request, Response, NextFunction } from 'express';
import SuperAdmin from '../models/superadmin-model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const registerSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;
    if (!fullName || !email || !mobileNumber || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      res.status(400).json({ error: 'Super Admin already exists' });
      return;
    }
    //const hashedPassword = await bcrypt.hash(password, 10);
    const superAdmin = new SuperAdmin({
      fullName,
      email,
      mobileNumber,
      password,
      role: 'superadmin',
    });
    await superAdmin.save();
    res.status(201).json({ message: 'Super Admin registered successfully' });
  } catch (error) {
    next(error);
  }
};

export const loginSuperAdmin = async (
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
    const superAdmin = await SuperAdmin.findOne({ email, role: 'superadmin' });
    if (!superAdmin) {
      res.status(401).json({ error: 'Invalid Credentials' });
      console.log('A');
      return;
    }
    console.log(superAdmin.password);
    console.log(await bcrypt.compare(password, superAdmin.password));
    const isMatch = await superAdmin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid Credentials' });
      console.log('A2');
      return;
    }
    const token = jwt.sign(
      { id: superAdmin._id, role: superAdmin.role },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const superAdmin = await SuperAdmin.findOne({ email, role: 'superadmin' });
    if (!superAdmin) {
      res.status(404).json({ error: 'Super Admin not found' });
      return;
    }

    const token = crypto.randomBytes(20).toString('hex');
    superAdmin.resetPasswordToken = token;
    superAdmin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await superAdmin.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      to: superAdmin.email,
      from: 'passwordreset@yourdomain.com',
      subject: 'Super Admin Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset-password/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const superAdmin = await SuperAdmin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!superAdmin) {
      res
        .status(400)
        .json({ error: 'Password reset token is invalid or has expired' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    superAdmin.password = hashedPassword;
    superAdmin.resetPasswordToken = undefined;
    superAdmin.resetPasswordExpires = undefined;
    await superAdmin.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    next(error);
  }
};
