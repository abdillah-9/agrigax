module.exports.formatUser = (user) => ({
  id: String(user.id),
  username: user.username,
  fullName: user.full_name,
  email: user.email || null,
  phone: user.phone,
  role: user.active_role,
  isVerified: Boolean(user.is_verified),
  isSuspended: Boolean(user.is_suspended),
  createdAt: user.created_at,
});

module.exports.sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  const payload = { success: true, message };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

module.exports.sendPaginated = (res, data, pagination, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};
