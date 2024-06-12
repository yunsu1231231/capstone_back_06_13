const checkLoggedIn = (req, res, next) => {
  
    if (!req.decoded) {  
      res.status(401).send('Unauthorized');  
      return;
    }
 
    next(); 
};

module.exports = checkLoggedIn;
