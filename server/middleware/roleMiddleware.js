const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized, user not found"));
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role: ${req.user.role} is not authorized to access this route`));
    }
    next();
  };
};

export { authorizeRoles };
