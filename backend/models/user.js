import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CustomError from "../errors/CustomError.js";

const userSchema = mongoose.Schema({
	first_name: {
	    type: String,
	    required: true
	},
	last_name: {
		type: String,
		required: true
	},
	nick: {
		type: String, 
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	lvl: {
		type: Number,
		required: true,
		default: 1
	},
	experiencePoints: {
		type: Number, 
		required: true, 
		default: 0
	},
	profilePicture: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 7,
		trim: true
	},
	accoutBallance: {
		type: Number,
		required: true,
		default: 0
	},
	tokens: [
		{
			token: {
				type: String,
				required: true
			}
		}
	]
}, {
	  timestamps: true
});

userSchema.pre('save', async function(next) {
	const user = this;

	if(user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 7);
	}
});

userSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject();
	delete userObject.password;
	delete userObject.tokens;

	return userObject;
};

userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email: email });
	if (!user) {
		throw new CustomError('incorrect email', 400);
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new CustomError('incorrect password', 400);
	}

	return user;
};

const User = mongoose.model("User", userSchema);
export default User;
