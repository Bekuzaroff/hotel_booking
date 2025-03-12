const async_handler = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(err => next(err));
    }
}
module.exports = async_handler;