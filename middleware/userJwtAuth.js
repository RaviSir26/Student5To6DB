import jwt from 'jsonwebtoken';

const userAuth = async(req, res, next)=>{

    try {
        let bearerHeader = req.headers['authorization'];
        
        if(typeof bearerHeader != 'undefined'){
            let token = bearerHeader.split(' ')[1];
            let user = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(user);
            res.token = user;
            next();
        }
        else{
            res.status(401).json({message: 'Token Not Set'});
        }
    } catch (error) {
        res.status(403).json({message: 'Invalid or Expired Token'});
    }
}

export default userAuth;