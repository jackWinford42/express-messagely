const express = require("express");
const User = require("../models/user");
const ExpressError = require("../expressError")
const jwt = require("jsonwebtoken");
const db = require("../db");
const bcrypt = require("bcrypt");
const router = new express.Router();

const SECRET_KEY = "oh-so-secret";
const JWT_OPTIONS = { expiresIn: 60 * 60 };
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function(req, res, next) {
    try {
        const { username, password } = req.body;
        const result = await db.query(
            `SELECT password FROM users WHERE username = $1`,
            [username]);
        const user = result.rows[0];
    
        if (user) {
            if (await bcrypt.compare(password, user.password) === true) {
                await User.updateLoginTimestamp(username)
                let token = jwt.sign({ username }, SECRET_KEY);
                return res.json({ token });
            }
        }
        throw new ExpressError("Invalid user/password", 400);
    } catch (err) {
        return next(err);
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function(req, res, next) {
    try {
        const newUser = await User.register(req.body)
        const username = newUser.username
        await User.updateLoginTimestamp(username)
        let token = jwt.sign({username}, SECRET_KEY);
        return res.json({token});
    } catch (err) {
        return next(err);
    }
})

module.exports = router;