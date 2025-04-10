import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// export default mongoose.model('User', userSchema);


const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ["Customer", "Catering Manager", "Executive Chef", "System Admin"], 
        default: "Customer" 
    },
    createdAt: { type: Date, default: Date.now }
});


UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default  mongoose.model('userModel', UserSchema);
