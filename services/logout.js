export const logout = (req,res,next)=>{
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
}