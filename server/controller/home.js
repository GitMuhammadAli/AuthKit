exports.userHome = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const user = req.user;
  const locals = {
    title: "User Home",
    description: "User Home",
    message: { success: info, error: error },
    user: user, // Pass user information to the template
  };
  res.render("home/user", { locals, layout: "layouts/user" });
};

exports.adminHome = async (req, res) => {
  const info = req.flash("success");
  const error = req.flash("error");
  const user = req.user;
  const locals = {
    title: "Admin Home",
    description: "Admin Home",
    message: { success: info, error: error },
    user: user, // Pass user information to the template
  };
  res.render("home/admin", { locals, layout: "layouts/user" });
};

exports.userController = async (req, res) => {
  return res.json({ message: "User Home" });
};

exports.adminController = async (req, res) => {
  return res.json({ message: "Admin Home" });
};
