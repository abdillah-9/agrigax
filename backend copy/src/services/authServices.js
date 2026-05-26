const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    updateRefreshToken,
    insertRefreshToken,
    getRefreshTokenByUserId,
    userSignOut,
    createUser,
    getUserByEmail
} = require("../repositories/authRepo");

require("dotenv").config();

/********************** SIGN-IN SERVICE ********************** */

module.exports.signInService = async ({ email, password }) => {

    const userData = await getUserByEmail({ email });

    if (!userData) {
        throw new Error("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, userData.password);

    if (!validPassword) {
        throw new Error("Invalid credentials");
    }

    const accessToken = jwt.sign(
        { id: userData.id },
        process.env.ACCESSTOKEN,
        { expiresIn: '15min' }
    );

    const refreshToken = jwt.sign(
        { id: userData.id },
        process.env.REFRESHTOKEN,
        { expiresIn: '7d' }
    );

    await updateRefreshToken({
        id: userData.id,
        refreshToken
    });

    return {
        id: userData.id,
        accessToken,
        refreshToken
    };
};

/********************** SIGN-UP SERVICE ********************** */

module.exports.signUpService = async ({ userData }) => {

    const accountExists = await getUserByEmail({ email: userData.email });

    if (accountExists) {
        throw new Error("Account exists");
    }

    const password = await bcrypt.hash(userData.password, 10);

    const userId = await createUser({
        data: { ...userData, password }
    });

    const accessToken = jwt.sign(
        { id: userId },
        process.env.ACCESSTOKEN,
        { expiresIn: '15min' }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.REFRESHTOKEN,
        { expiresIn: '7d' }
    );

    await insertRefreshToken({
        id: userId,
        refreshToken
    });

    return {
        id: userId,
        accessToken,
        refreshToken
    };
};

/********************** SIGN-OUT ********************** */

module.exports.signOutService = async ({ accessToken, refreshToken }) => {

    try {
        jwt.verify(accessToken, process.env.ACCESSTOKEN);
        return; // ✅ already valid → nothing to do
    } catch (_) {}

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN);
    } catch (_) {
        throw new Error("Not authorised");
    }

    const dbToken = await getRefreshTokenByUserId({ userId: decoded.id });

    if (!dbToken || dbToken.refreshToken !== refreshToken) {
        throw new Error("Not authorised");
    }

    await userSignOut({ userId: decoded.id });
};

/**************** CHECK USER SESSION *********************/

module.exports.checkUserSession = async ({ accessToken, refreshToken }) => {

    try {
        jwt.verify(accessToken, process.env.ACCESSTOKEN);
        return { accessToken, refreshToken };
    } catch (_) {}

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN);
    } catch (_) {
        throw new Error("Not authorised");
    }

    const dbToken = await getRefreshTokenByUserId({ userId: decoded.id });

    if (!dbToken || dbToken.refreshToken !== refreshToken) {
        throw new Error("Not authorised");
    }

    const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.ACCESSTOKEN,
        { expiresIn: '15min' }
    );

    const newRefreshToken = jwt.sign(
        { id: decoded.id },
        process.env.REFRESHTOKEN,
        { expiresIn: '7d' }
    );

    await updateRefreshToken({
        id: decoded.id,
        refreshToken: newRefreshToken
    });

    return {
        id: decoded.id,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};

/**************** FAST CHECK USER SESSION *********************/

module.exports.fastCheckUserSession = async ({ accessToken }) => {

    try {
        const payload = jwt.verify(accessToken, process.env.ACCESSTOKEN);
        return payload;
    } catch (e) {
        throw e;
    }
};