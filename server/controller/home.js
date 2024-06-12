exports.userHome = async (req, res) => {
const info = req.flash("success");
const error = req.flash("error");
const locals = {
    title: "Home",
    discription: "Home",
    message: { success: info, error: error },
};
res.render("users/home", { locals, layout: "layouts/main" });
};


