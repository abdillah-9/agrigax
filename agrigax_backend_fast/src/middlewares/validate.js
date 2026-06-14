module.exports = (schema) => {
    return async (req, res, next) => {
        try {
            const value = await schema.validateAsync(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });

            req.body = value;
            return next();
        } catch (e) {
            return next(e);
        }
    };
};
