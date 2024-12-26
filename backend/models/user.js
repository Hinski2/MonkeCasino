import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = mongoose.Schema({
	  first_name: {
	      type: String,
	      required: true
	  },
	  last_name: {
	      type: String,
	      required: true
	  },
	  email: {
	      type: String,
	      required: true,
	      unique: true
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

userSchema.statics.findByCredentials = async (us, password) => {
	const user = await us.findOne({ us });
	if (!user) {
	  throw new Error('Unable to login!');
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
	  throw new Error('Unable to login!');
	}

	return user;
};

const User = mongoose.model("User", userSchema);
export default User;
