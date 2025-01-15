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
    const superAdmin = new SuperAdmin({
      fullName,
      email,
      mobileNumber,
      password,
      role: 'SuperAdmin',
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
    const superAdmin = await SuperAdmin.findOne({ email, role: 'SuperAdmin' });
    if (!superAdmin) {
      res.status(401).json({ error: 'Invalid Credentials' });
      console.log('A');
      return;
    }

    const isMatch = await superAdmin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid Credentials' });
      console.log('A2');
      return;
    }
    const token = jwt.sign(
      { id: superAdmin._id, role: superAdmin.role },
      process.env.JWT_TOKEN || 'test',
      { expiresIn: '1h' }
    );
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    next(error);
  }
};
