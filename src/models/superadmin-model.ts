import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ISuperAdmin extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deactivatedBy?: string;
  deactivatedAt?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const SuperAdminSchema: Schema<ISuperAdmin> = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'superadmin' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deactivatedBy: { type: String },
  deactivatedAt: { type: Date },
  deletedAt: { type: Date },
  deletedBy: { type: String },
});

SuperAdminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

SuperAdminSchema.methods.comparePassword = function (
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const SuperAdmin = mongoose.model<ISuperAdmin>('SuperAdmin', SuperAdminSchema);

export default SuperAdmin;
