import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  googleId?: string;
  provider: 'local' | 'google';
  phone?: string;
  location?: string;
  bio?: string;
  travelStyle?: string[];
  languages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    select: false,
    required: function(this: any) {
      return this.provider === 'local';
    }
  },
  avatar: { 
    type: String,
    default: null
  },
  googleId: { 
    type: String,
    sparse: true,
    unique: true
  },
  provider: { 
    type: String, 
    enum: ['local', 'google'], 
    default: 'local' 
  },
  phone: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  travelStyle: {
    type: [String],
    default: []
  },
  languages: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true 
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);