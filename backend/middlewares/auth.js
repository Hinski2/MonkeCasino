import jwt from 'jsonwebtoken';
import User from '../models/user.js'

export const auth = async (req, res, next) => {
	try {
		const token  = req.header('Authorization').replace('Beareer ', '');
		const decode = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({
			_id: decode._id,
			'tokens.token': token
		});

		if(!user) {
			throw new Error('');
		}

		req.token = token;
		req.user  = user;
		next();
	} catch (er) {
		res.status(401).send({ error: 'Please authenticate!'});
	}
};
