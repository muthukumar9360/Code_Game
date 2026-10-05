import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    fullname:{
        type:String,
        required:true
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
    practiceXp: {
        type: Number,
        default: 0
    },
    rankedBattleXp: {
        type: Number,
        default: 0
    },
    contestXp: {
        type: Number,
        default: 0
    },
    coins: {
        type: Number,
        default: 0
    },
    practicePoints: {
        type: Number,
        default: 0
    },
    tournamentPoints: {
        type: Number,
        default: 0
    },
    friendRoomPoints: {
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
    },
    streakCount: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastStreakDate: {
        type: Date,
        default: null
    },
    activeDaysStreak: {
        type: Number,
        default: 0
    },
    longestActiveStreak: {
        type: Number,
        default: 0
    },
    lastActiveSubmissionDate: {
        type: Date,
        default: null
    },
    eloRating: {
        type: Number,
        default: 1200
    },
    activeDays: [{
        type: String // Format: "YYYY-MM-DD"
    }],
    solvedDays: [{
        type: String // Format: "YYYY-MM-DD"
    }],
    dailyChallengeSolvedDates: [{
        type: String // Format: "YYYY-MM-DD"
    }],
    badges: [{
        id: String,
        name: String,
        description: String,
        icon: String,
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
