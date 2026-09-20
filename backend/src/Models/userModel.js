//user Schema
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { type } from "node:os";
import { url } from "node:inspector";
import { settings } from "node:cluster";
import { bytes } from "node:stream/consumers";
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter your name"],
            // '           John           ' => 'John'
            trim: true,
            maxLength: [50, "your name cannot be longer than 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Please enter your email ID"],
            unique: true,
            lowercase: true,
            trim: true,
            validator: [validator.install, "Please enter vaild email address"],
        },
        password: {
            type: String,
            required: [true, "Please enter password"],
            minlength: [6, "Your password must be longer than 6 characters"],
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, "Please confirm your password"],
            validate: {
                validator: function (el) {
                    return el === this.password
                },
                message: "Passwords are not the same !"
            }
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        avatar: {
            url: { type: String },
            public_id: { type: String }
        },
        passwordChangedAt: {
            type: Date
        },
        passwordResetToken: {
            type: String,
            select: false,
            index: true
        },
        passwordResetExpires: {
            type: Date,
            select: false
        },
    },
    { timestamps: true }
)

//settings to not pass in response from server
userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.passwordConfirm;
        delete ret.passwordChangedAt;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
    }
})

//password logic 
//hashing 
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined;
})
//login check
//test123 === e32tr2yut36rgdw6r536r537
userSchema.methods.correctPassword = async function (candidatePAssword, userPassword) {
    return await bcrypt.compare(candidatePAssword, userPassword)
}

//
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 100,
            10
        );
        return JWTTimestamp < changedTimestamp
    }
    return false;
}

//forgot password
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}


const User = mongoose.model("User", userSchema);
//in mongodb : users
export { User };