const { ZodError } = require('zod');

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = validateRequest;
