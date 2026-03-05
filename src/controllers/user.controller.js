import User from '../models/usermodel.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { errorHandler } from '../uitils/errorHandler.js'


let SALT = process.env.SALT;


const createUser = async (req, res, next) => {
    try {
        let { userName, email, mobile, password } = req.body;
        let checkuser = await User.find({ userName })
        if (checkuser.length > 0) return next(errorHandler(400, 'userName Already exist'))
        let checkuserEmail = await User.find({ email })
        if (checkuserEmail.length > 0) return next(errorHandler(400, 'Email Already exist'))

        const hashedPassword = bcryptjs.hashSync(password, Number(10));
        let newUser = new User({ userName, email, mobile, password: hashedPassword })

        await newUser.save()
        if (newUser) {
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)
            const { password: pass, ...rest } = newUser._doc
            res.status(201).json({ message: 'user Created success' })
        }

    } catch (error) {
        next(error)
    }
}

const getuserByadmin = async (req, res, next) => {
    try {
        let { id } = req.params
        let admin = await User.findById({ _id: id })
        if (admin.role !== 'admin') return errorHandler(401, 'admin only access')

        let user = await User.find()

        res.status(200).json({
            message: 'user updated',
            user
        })
    } catch (error) {
        next(error)
    }
}

const getAllUsersForAdmin = async (req, res, next) => {
    try {
        let adminId = req.user.id
        let admin = await User.findById(adminId)
        if (!admin || admin.role !== 'admin') return next(errorHandler(401, 'Admin only access'))

        let users = await User.find().select('-password').sort({ createdAt: -1 })
        res.status(200).json({
            message: 'All users fetched',
            users
        })
    } catch (error) {
        next(error)
    }
}
const getuserbyId = async (req, res, next) => {
    try {
        let { id } = req.params
        let Adminid = req.user.id
        let admin = await User.findById(Adminid)
        if (admin.role !== 'admin') return errorHandler(401, 'admin only access')

        let user = await User.findById(id)
        if (!user) return errorHandler(402, 'no user found')

        res.status(200).json({
            user,
            message: 'User Found'
        })
    } catch (error) {
        next(error)
    }

}


const updateUser = async (req, res, next) => {
    try {
        let { id } = req.params
        let adminId = req.user.id
        let admin = await User.findById(adminId)
        if (!admin || admin.role !== 'admin') return next(errorHandler(401, 'Admin only access'))

        const { userName, email, mobile, role, status, activeStatus } = req.body
        const updateFields = {}
        if (userName !== undefined) updateFields.userName = userName
        if (email !== undefined) updateFields.email = email
        if (mobile !== undefined) updateFields.mobile = mobile
        if (role !== undefined) updateFields.role = role
        if (status !== undefined) updateFields.status = status
        if (activeStatus !== undefined) updateFields.activeStatus = activeStatus

        let user = await User.findByIdAndUpdate(id, updateFields, { new: true }).select('-password')
        if (!user) return next(errorHandler(404, 'User not found'))

        res.status(200).json({ message: 'User updated successfully', user })
    } catch (error) {
        next(error)
    }
}
const deleteUser = async (req, res, next) => {
    try {
        let { id } = req.params
        // console.log(id)

        let Adminid = req.user.id
        let admin = await User.findById(Adminid)
        if (admin.role !== 'admin') return errorHandler(401, 'admin only access')

        let user = await User.findByIdAndDelete(id)

        res.status(200).json({
            message: 'user deleted',

        })

    } catch (error) {
        next(error)
    }
}

const signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        //console.log(user)
        if (!user) return next(errorHandler(404, 'User Not Found'))
        const validPassword = bcryptjs.compareSync(password, user.password)
        if (!validPassword) return next(errorHandler(401, 'Wrong credentials'))
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        })
        const { password: pass, ...rest } = user._doc
        res.status(200).json({ token, rest: { ...rest, role: user.role, status: user.status, activeStatus: user.activeStatus } })


    } catch (error) {
        next(error)
    }
}
const google = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            const { password: pass, ...rest } = user._doc
            // res.cookie('access_token', token, {
            //     httpOnly: true, // The cookie cannot be accessed through client-side scripts
            //     secure: true, // Send the cookie only over HTTPS (in a production environment)
            //     sameSite: 'none', // Protect against CSRF attacks dtrict
            //     expires: new Date(Date.now() + 3600000), // Cookie expiration time (1 hour in milliseconds)
            //   }).status(200).json(rest)
            res.status(200).json({ token, rest })
            //   console.log(rest,token)

            //res.cookie('access_token',token,{httpOnly:false,sameSite: 'none',secure:true}).status(200).json(rest)

        }
        else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, SALT);
            const newUser = new User({ username: req.body.name.split(" ").join('').toLowerCase() + Math.random().toString(36).slice(-4), email: req.body.email, password: hashedPassword, avatar: req.body.photo })
            await newUser.save()
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            const { password: pass, ...rest } = user._doc
            // res.cookie('access_token', token, {
            //     httpOnly: true, // The cookie cannot be accessed through client-side scripts
            //     secure: true, // Send the cookie only over HTTPS (in a production environment)
            //     sameSite: 'none', // Protect against CSRF attacks
            //     expires: new Date(Date.now() + 3600000), // Cookie expiration time (1 hour in milliseconds)
            //   }).status(201).json(rest)
            res.status(201).json({ token, rest })

            // res.cookie('access_token',token,{httpOnly:false,sameSite: 'none',secure:true}).status(200).json(rest)

        }
    } catch (error) {
        next(error)
    }
}
const userApproval = async (req, res, next) => {
    try {
        let { id } = req.params
        let Adminid = req.user.id
        let status = req.body
        if (!status) return errorHandler(402, 'Status found')
        // console.log(status,id)
        let admin = await User.findById(Adminid)
        if (admin.role !== 'admin') return errorHandler(401, 'admin only access')


        let user = await User.findByIdAndUpdate(id, status)
        if (!user) return errorHandler(402, 'no user found')

        res.status(200).json({
            user,
            message: 'User Found'
        })

    } catch (error) {
        next(error)
    }
}
const signOut = async (req, res, next) => {

    try {
        // res.clearCookie('access_token')
        res.status(200).json('User has been logged Out')

    } catch (error) {
        next(error)
    }
}

export default {
    createUser,
    signin,
    google,
    signOut, getuserByadmin, getAllUsersForAdmin, updateUser, deleteUser, getuserbyId, userApproval
}
