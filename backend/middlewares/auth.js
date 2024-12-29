import jwt from 'jsonwebtoken';
import User from '../models/user.js'

export const auth = async (req, res, next) => {
	try {
		const token  = req.body.Authorization.replace('Bearer ', '');
		const decode = jwt.verify(token, process.env.JWT_SECRET);
		
		const user = await User.findOne({
			_id: decode._id,
			'tokens.token': token
		});


		if(!user) {
			throw new Error("incorrect token")
		}

		req.token = token;
		req.user  = user;
		next();
	} catch (e) {
		res.status(401).send({
			success: false, 
			error: e, 
			user_message: "your login token is incorrect", 
			message: e.message
		})
	}
};
