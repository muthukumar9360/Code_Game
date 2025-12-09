import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        default: 'Bronze'
    },
    xp: {
        type: Number,
        default: 0
    },
    coins: {
        type: Number,
        default: 0
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
