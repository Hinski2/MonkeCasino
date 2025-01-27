import mongoose from "mongoose";
import User from "../models/user.js";

/*
    function for creating users, requires:
    * "nick"
    * "first_name"
    * "last_name"
    * "email"
    * "password"
    * "profilePicture" - string with image name in frontend/public/profile_pictures
*/
export const createUser = async (req, res) => {
	const user = new User(req.body);

    if(!req.body.nick || !req.body.profilePicture || !req.body.first_name || !req.body.last_name || !req.body.email || !req.body.password){
        return res.status(400).send({
            success: false, 
            user_message: "Missing required fields",
            message: "Missing required fields"
        })
    }

	try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                user_message: "Email already in use",
                message: "Duplicate email detected"
            });
        }

		await user.save();
		const token = await user.generateAuthToken();
        res.status(201).send({  
            success: true, 
            data: {user, token},
            user_message: "your accout was created successfully",
            message: "user was created successfully",
        });
	} catch (e) {
		res.status(500).send({
            success: false, 
            error: e, 
            user_message: "An error occured while registering",
            message:"Internal server error"
        });
	}
}

/*
    function for loggin, requires:
    * "email"
    * "password"
*/
export const userLogin = async (req, res) => {
    if(!req.body.email || !req.body.password){
        return res.status(400).send({
            success: false, 
            user_message: "Email and password are required",
            message: "Missing required fields"
        })
    };
    
	try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({
            success: true,
            data: {user, token},
            user_message: `Welcome back ${user.nick}`,
            message: "user logged successfully"
        })
    } catch (e) {
        if(e?.status){
            res.status(e.status).send({
                success: false,
                error: e, 
                user_message: e.message,
                message: e.message
            })
        } else {
            res.status(500).send({
                success: false, 
                error: e, 
                user_message: "error occured while login",
                message: "internal server error"
            })
        }
    }
}

/*
    function for logout user (remove one token), requires:
    * "token"
*/
export const userLogout = async (req, res) => {
	try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);

        await req.user.save()
        res.status(200).send({
                success: true,
                user_message: "you have been logged out successfully",
                message: "User logged out successfully"
        })
    } catch (e) {
        res.status(500).send({
            success: false, 
            error: e, 
            user_message: "An error occured while logging out",
            message: "internal server error"
        })
    }
}

/*
    functon for logout user (remove all tokens), requires:
    * "token"
*/
export const userLogoutAll = async (req, res) => {
	try {
        req.user.tokens = []
        await req.user.save()

        res.status(200).send({
            success: true, 
            user_message: "you have been logged out successfully",
            message: "user logged out successfully from all devices"
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            error: e,
            user_message: "An error occured while logging out",
            message: "internal server error"
        })
    }
}
/*
    function to get user (me), reqires:
    * "token"
*/
export const userMe = async (req, res) => {
    res.status(200).send({
           success: true, 
           data: req.user,
           message: "user profile fetched successfully",
           user_message: `${req.user.nick}, your profile was fetched successfully`
    });
}

/*
    function for user update, reqiures:
    * "token"
*/

export const userUpdate = async (req, res) => {
	const updates = Object.keys(req.body)
    const allowedUpdates = ['first_name', 'last_name', 'nick', 'password', 'profilePicture']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            success: false, 
            error: new Error('invalid operation'),
            user_message: "You can't change this",
            message: "invalid operation"
        })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send({
            success: true, 
            data: req.user, 
            user_message: "your data was changed successfully",
            message: "user data changed successfully"
        })
    } catch (e) {
        res.status(400).send({
            success: false, 
            error: e, 
            user_message: "error occured while changing data",
            message: e.message
        })
    }
}

export const sudoUserUpdate = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['first_name', 'last_name', 'nick', 'password', 'profilePicture', 'lvl', 'experiencePoints', 'accoutBalance']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            success: false, 
            error: new Error('invalid operation'),
            user_message: "You can't change this",
            message: "invalid operation"
        })
    }

    const id = req.params.id;
        const user = await User.findOne({ _id: id });
        if(user == null) {
            return res.status(400).send({
                success: false, 
                user_message: "there is no user with this id",
                message: "there is no user with this id"
            })
        }

    try {
        updates.forEach((update) => user[update] = req.body[update])
        await user.save();

        res.status(200).send({
            success: true, 
            data: user, 
            user_message: "your data was changed successfully",
            message: "user data changed successfully"
        })
    } catch (e) {
        res.status(400).send({
            success: false, 
            error: e, 
            user_message: "error occured while changing data",
            error: e.message
        })
    }
}

/* 
    function for user remove, requires:
    * "token"
*/
export const userDelete = async (req, res) => {
	try {
        await req.user.remove()
        res.status(200).send({
            success: true, 
            data: req.user, 
            user_message: "your accout was deleted successfully"
        })
    } catch (e) {
        res.status(500).send({
            success: false, 
            error: e, 
            user_message: "error occured while deleting prifile",
            message: "internal server error"
        })
    }
}
/*
    get all users, requires:
    * void
*/
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send({success: true, data: users});
    } catch (error) {
        console.log("error in fetching users: ", error);
        res.status(500).json({success: false, message: "Server error"});
    }
}

/*
    function for getting some bassic infor about user with id, requires:
    * void
*/
export const getUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ _id: id });
        if(user == null) {
            return res.status(400).send({
                success: false, 
                user_message: "there is no user with this id",
                message: "there is no user with this id"
            })
        }

        res.status(200).send({
            success: true, 
            data: {
                nick: user.nick,
                lvl: user.lvl,
                accoutBalance: user.accoutBalance,
                experiencePoints: user.experiencePoints,
                profilePicture: user.profilePicture
            },
            user_message: "data was fethed correctly",
            message: "data was fetched correctly"
        });
    } catch (e) {
        res.status(500).send({
            success: false, 
            error: e, 
            user_message: "An error occured while data fetching",
            message: "Internal server error"
        })
    }
}
