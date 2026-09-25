import jwt from "jsonwebtoken";

export const generateAccessToken = (
    userId
) => {
    return jwt.sign(
        {
            userId,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    );
};

export const generateRefreshToken = (
    userId
) => {
    return jwt.sign(
        {
            userId,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    );
};
export const generateAuthPayload = async (
    user
) => {
    const id = user._id || user.id;
    const accessToken =
        generateAccessToken(id);

    const refreshToken =
        generateRefreshToken(id);

    user.refreshToken =
        refreshToken;

    if (typeof user.save === "function") {
        await user.save();
    }

    return {
        accessToken,
        refreshToken,
        user: {
            id,
            name: user.name,
            email: user.email,
        },
    };
};