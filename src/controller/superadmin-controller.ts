import { Request, Response, NextFunction } from 'express';
import SuperAdmin from '../models/superadmin-model';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin-model';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { CustomRequest } from '../types/types';

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

      return;
    }
    const token = jwt.sign(
      { id: superAdmin._id, role: superAdmin.role },
      process.env.JWT_TOKEN || 'test',
      { expiresIn: '7d' }
    );
    res
      .status(200)
      .cookie('token', token)
      .json({
        message: 'Login successful',
        superAdmin: {
          id: superAdmin._id,
          fullName: superAdmin.fullName,
          email: superAdmin.email,
          mobileNumber: superAdmin.mobileNumber,
        },
        token,
      });
  } catch (error) {
    next(error);
  }
};

export const createAdminBySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, mobileNumber, password, accessTo } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ error: 'Admin already exists' });
      return;
    }
    const existingAdminByMobile = await Admin.findOne({ mobileNumber });
    if (existingAdminByMobile) {
      res.status(400).json({ error: 'Mobile number already exists.' });
      return;
    }

    const newAdmin = new Admin({
      fullName,
      email,
      mobileNumber,
      password,
      accessTo,
    });
    await newAdmin.save();

    res.status(201).json({
      message: 'Admin created successfully by Super Admin',
      admin: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        mobileNumber: newAdmin.mobileNumber,
        accessTo: newAdmin.accessTo,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminBySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { adminId } = req.params;
    const { fullName, email, mobileNumber, password, accessTo } = req.body;

    const updateData = {
      fullName,
      email,
      mobileNumber,
      password,
      accessTo,
    };
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

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
export const updateAccessbySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { adminId } = req.params;
    const { accessTo } = req.body;
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { accessTo },
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

export const deleteAdminBySuperAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { adminId } = req.params;
    if (!adminId) {
      res.status(400).json({ error: 'Admin id is required' });
      return;
    }
    const deletedAdmin = await Admin.findById(adminId);
    if (!deletedAdmin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }
    await deletedAdmin.deleteOne();
    res.status(200).json({
      message: 'Admin marked as deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getAllAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const admins = await Admin.find();

    res.status(200).json({
      message: 'Admins retrieved successfully',
      admins,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    res.status(200).json({
      message: 'Admin retrieved successfully',
      admin,
    });
  } catch (error) {
    next(error);
  }
};
