module.exports.errorHandler = async(err,req, res , next)=>{

    const errCode = err.statusCode || 500;
    return res.status(errCode).json({message: err.message}); // Then letter I will use professional logger to separate user/prod logs /messages VS development logs/messages
}
