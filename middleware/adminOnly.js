export default function adminOnly(req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send("Access denied. Admins only.");
  }
  next();
}
