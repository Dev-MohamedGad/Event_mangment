

// Global Error middleware
export const globalError = (err, req, res, next) => {
    if (err) {
         res.status(err['cause'] || 500).json({
            error_msg: 'Catch error',
            message: err.message,
        })
        next()
    }
}
