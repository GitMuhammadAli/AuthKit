exports.userHome = async (req, res) => {
    const info = req.flash("success");
    const error = req.flash("error");
    const locals = {
        title: "Home",
        discription: "Home",
        message: { success: info, error: error },
    };
    res.render("home/user", { locals, layout: "layouts/main" });
};


exports.adminHome = async (req, res) => {
    const info = req.flash("success");
    const error = req.flash("error");
    const locals = {
        title: "Home",
        discription: "Home",
        message: { success: info, error: error },
    };
    res.render("home/admin", { locals, layout: "layouts/main" });
};


exports.userController = async (req, res) => {

    return res.json({ message: "User Home " });

}
exports.adminController = async (req, res) => {

    return res.json({ message: "admin Home " });

}


