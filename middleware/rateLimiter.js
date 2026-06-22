const { rateLimit } = require('express-rate-limit')

exports.rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 2,
    message: 'too many request, please try again after 1mins'
})
// exports.loginRateLimiter = rateLimit({
//     windowMs: 5 * 60 * 1000,
//     max: 2,
//     message: 'too many request, please try again after 5mins'
// })
// exports.createStaffRateLimiter = rateLimit({
//     windowMs: 5 * 60 * 1000,
//     max: 2,
//     message: 'too many request, please try again after 5mins'
// })

