const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { HTTP_STATUS } = require('../config/constants');
const { SALT, NODE_ENV } = require('../config/config');
const { generateToken } = require('../utils/tokenServices');
const { AppError } = require('../middleware/errorHandler');
const { sessionOf } = require('../utils/workspace');

const WEB_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24; // 1 day, same as the web token

const webCookieOptions = () => ({
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'None' : 'Lax',
});

function setWebCookie(response, payload) {
    response.cookie('token', generateToken(payload, '1d'), { ...webCookieOptions(), maxAge: WEB_COOKIE_MAX_AGE });
}

const tokenPayload = (user) => ({
    id: user.id,
    email: user.email,
    role: user.is_super_admin ? 'Super Admin' : 'User',
});

const UserController = {

    getAllUsers: async (request, response, next) => {
        try {
            const users = await User.find();
            response.status(HTTP_STATUS.OK).json(users);
        } catch (error) {
            next(error);
        }
    },

    registerUser: async (request, response, next) => {
        try {
            const { email, password, first_name, last_name, middle_name, contact } = request.body || {};

            if (!email || !password) {
                throw new AppError('Email and password are required', HTTP_STATUS.BAD_REQUEST);
            }
            if (password.length < 8) {
                throw new AppError('Password must be at least 8 characters', HTTP_STATUS.BAD_REQUEST);
            }

            const user = await User.findByEmail(email);
            if (user) {
                throw new AppError('Email already exists', HTTP_STATUS.CONFLICT);
            }

            const hashedPassword = await bcrypt.hash(password, SALT);
            const newUser = await User.create({
                email,
                password: hashedPassword,
                first_name,
                last_name,
                middle_name,
                contact
            });
            response.status(HTTP_STATUS.CREATED).json(newUser);
        } catch (error) {
            next(error);
        }
    },

    loginUser: async (request, response, next) => {
        try {
            const { email, contact, password, client } = request.body || {};

            if (!email && !contact) {
                throw new AppError('Email or contact is required', HTTP_STATUS.BAD_REQUEST);
            }
            if (!password) {
                throw new AppError('Password is required', HTTP_STATUS.BAD_REQUEST);
            }

            if (!client) {
                throw new AppError('Client is required', HTTP_STATUS.BAD_REQUEST);
            }

            // password is hidden by default (select: false), so ask for it explicitly
            const filter = email ? { email } : { contact };
            const user = await User.findOne(filter, { select: '+password' });

            if (!user) {
                throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
            }

            if (user.status === 'suspended') {
                throw new AppError('Account is suspended', HTTP_STATUS.FORBIDDEN);
            }

            // the web console is for Super Admins and agency staff; work out their role, agency and menus
            // before anything is recorded (participants and people without an agency are refused here)
            const session = client === 'web' ? await sessionOf(user) : null;

            await User.recordSignIn(user.id);

            // never send the password hash back
            const { password: _hidden, ...safeUser } = user;

            const payload = tokenPayload(user);

            if (client === 'web') {
                // Web: token goes in an httpOnly cookie
                setWebCookie(response, payload);
                return response.status(HTTP_STATUS.OK).json({
                    message: 'Login successful',
                    user: safeUser,
                    session,
                    mustResetPassword: !!user.must_reset_password,
                });
            } else if (client === 'mobile') {
                response.status(HTTP_STATUS.OK).json({
                    message: 'Login successful',
                    user: safeUser,
                    token: generateToken(payload),
                });
            } else {
                throw new AppError('Invalid client type', HTTP_STATUS.BAD_REQUEST);
            }
        } catch (error) {
            next(error);
        }
    },

    // GET /api/users/me  - the signed-in person's current role, agency and menus (web console)
    getSession: async (request, response, next) => {
        try {
            const user = await User.findById(request.user.id);
            if (!user || user.status !== 'active') {
                throw new AppError('Session expired. Sign in again.', HTTP_STATUS.UNAUTHORIZED);
            }
            response.status(HTTP_STATUS.OK).json({ session: await sessionOf(user) });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/users/logout  - clears the web session cookie
    logoutUser: async (request, response, next) => {
        try {
            response.clearCookie('token', webCookieOptions());
            response.status(HTTP_STATUS.OK).json({ message: 'Logged out' });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/users/change-password  { current, next }  - also clears a temporary password
    changePassword: async (request, response, next) => {
        try {
            const { current, next: newPassword } = request.body || {};

            if (!current || !newPassword) {
                throw new AppError('Current and new password are required', HTTP_STATUS.BAD_REQUEST);
            }
            if (newPassword.length < 8) {
                throw new AppError('Password must be at least 8 characters', HTTP_STATUS.BAD_REQUEST);
            }
            if (newPassword === current) {
                throw new AppError('Choose a password different from the current one', HTTP_STATUS.BAD_REQUEST);
            }

            const user = await User.findById(request.user.id, { select: '+password' });
            if (!user || user.status !== 'active') {
                throw new AppError('Session expired. Sign in again.', HTTP_STATUS.UNAUTHORIZED);
            }

            const isMatch = await bcrypt.compare(current, user.password);
            if (!isMatch) {
                throw new AppError('The current password is incorrect', HTTP_STATUS.BAD_REQUEST);
            }

            await User.findByIdAndUpdate(user.id, {
                password: await bcrypt.hash(newPassword, SALT),
                must_reset_password: false,
            });

            const result = { message: 'Password changed' };
            if (request.cookies?.token) {
                setWebCookie(response, tokenPayload(user));
                result.session = await sessionOf(user);
            }
            response.status(HTTP_STATUS.OK).json(result);
        } catch (error) {
            next(error);
        }
    },

    getUserById: async (request, response, next) => {
        try {
            const user = await User.findById(request.params.id);
            if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(user);
        } catch (error) {
            next(error);
        }
    },

    deleteUser: async (request, response, next) => {
        try {
            const user = await User.findByIdAndDelete(request.params.id);
            if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(user);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = UserController;
