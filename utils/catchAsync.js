module.exports = (fn) => {
  return (req, res, next) => {
    //fn(req,res,next).catch(err => next(err))
    fn(req, res, next).catch(next);
  };
};

// https://expressjs.com/en/guide/error-handling.html
