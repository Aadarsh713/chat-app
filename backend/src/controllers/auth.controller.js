
import { generateToken } from "../lib/utils.js"; // Function to generate JWT token
import User from "../models/users.models.js"; // Mongoose User model
import bcrypt from "bcryptjs"; // Library for hashing passwords
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
	const { fullName, email, password, profilePic } = req.body; // Destructure user input

	try {
		if (!fullName || !email || !password) {
			return res.status(400).json({
				message: "All fields are required",
			});
		}
		// Validate password length
		if (password.length < 6) {
			return res.status(400).json({
				message: "Password must be at least 6 characters long",
			});
		}

		// Check if user with the same email already exists
		const user = await User.findOne({ email });
		if (user) return res.status(400).json({ message: "Email already exists" });

		// Generate salt and hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user instance (but not saved to DB yet)
		const newUser = await User({
			fullName,
			email,
			password: hashedPassword,
		});

		if (newUser) {
			// Generate and send JWT token via cookie or response
			generateToken(newUser._id, res);

			// Save new user to the database
			await newUser.save();

			// Respond with created user info (excluding password)
			return res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				email: newUser.email,
				profilePic: newUser.profilePic, // This is unused currently unless handled in model
			});
		} else {
			// Fallback error if user creation fails
			res.status(400).json({
				message: "Invalid user data",
			});
		}
	} catch (e) {
		// Catch and log any unexpected server errors
		console.log("error in signup controller", e);
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};

export const login = async (req, res) => {
    
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({
				message: "Invalid credentials",
			});
		}
        console.log('user',user)
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({
				message: "Invalid credentials",
			});
		}

		generateToken(user._id, res);
		return res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("error in login controller", error);
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};


export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", {
			maxAge: 0,
		});
		res.status(200).json({
			message: "Logged out successful",
		});
	} catch (error) {
		console.log("error in logout controller", error);
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};

export const updateProfile = async (req,res) => {
	try{
		const {profilePic} = req.body
		const userId = req.user._id;

		if(!profilePic){
			return res.status(400).json({message:"Profile pic is required"})
		}

		const uploadResponse = await cloudinary.uploader.upload(profilePic)
		const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})

		res.status(200).json(updatedUser)


	}catch(error){
		console.log("error in update profile:",error);
		res.status(500).json({message:"Internal Server Error"})

	}

}

export const checkAuth = (req,res) => {
	try{
		res.status(200).json(req.user)
	}catch(error){
		console.log("Error in checkAuth controller ",error.message)
		res.status(500).json({message:"Internal Server Error"})
	}

}
