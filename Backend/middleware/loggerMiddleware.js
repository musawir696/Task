const logger = (req, res, next) => {
    const start = Date.now();
    
   
    const oldSend = res.send;

    res.send = function (data) {
        res.locals.body = data; // Store body in locals
        return oldSend.apply(res, arguments);
    };

    // After the response is finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 200 ? '\x1b[32m' : '\x1b[0m';
        const method = req.method;
        const url = req.originalUrl;

        console.log(`${color}${method} ${url} ${status}\x1b[0m - ${duration}ms`);
        
       
        if (status >= 400 && res.locals.body) {
            try {
                const parsedBody = JSON.parse(res.locals.body);
                const message = parsedBody.message || parsedBody.error || 'No error message';
                console.log(`\x1b[31mError Message: ${message}\x1b[0m`);
            } catch (e) {
               
                console.log(`\x1b[31mError Context: ${res.locals.body.toString().substring(0, 50)}\x1b[0m`);
            }
        }
    });

    next();
};

module.exports = logger;
