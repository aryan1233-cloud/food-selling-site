// middleware/auth.js

export function ensureLoggedIn(req, res, next) {
  if (req.session.user) return next();
  req.session.error = "Please log in first.";
  res.redirect("/auth/login");
}

export function ensureAdmin(req, res, next) {
  if (req.session.user?.isAdmin) return next();
  req.session.error = "Admins only.";
  res.redirect("/auth/login");
}
