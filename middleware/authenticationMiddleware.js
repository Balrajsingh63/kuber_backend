const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
class AuthenticationMiddlware {
    getToken(req, res, next) {
        const { authorization } = req.headers;
        try {

            if (!authorization) return res.status(401).send({ error: 'you must be logged in' })
            const token = authorization.replace('Bearer ', "");
            jwt.verify(token, process.env.privateKey, async (err, payload) => {
                console.log({ payload });

                if (err) return res.status(401).send({ error: 'you must be logged in' })
                const userData = payload;
                const user = await User.findById(userData._id);

                if (user) req.user = user;
                else return res.status(401).send({ error: 'you must be logged in' })
                next();
            })
        } catch (err) {
            console.log({ err });
            res.status(400).send("too bad its an err")
        }
    }
}
module.exports = new AuthenticationMiddlware();