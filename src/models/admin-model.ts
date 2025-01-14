import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface Admin extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: string;
  isActive: boolean;
  verifiedBy: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deactivatedBy?: string;
  deactivatedAt?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const adminSchema: Schema<Admin> = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'Admin' },
  isActive: { type: Boolean, default: true },
  verifiedBy: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deactivatedBy: { type: String },
  deactivatedAt: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: String },
});

adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

adminSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model<Admin>('Admin', adminSchema);

export default Admin;
