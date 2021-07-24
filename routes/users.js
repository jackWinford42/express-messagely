const express = require("express");
const User = require("../models/user");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");

const router = new express.Router();
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async function(req, res, next) {
    try {
        const allUsers = await User.all();
        return res.json({users: allUsers});
    } catch (err) {
        return next(err);
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async function(req, res, next) {
    try {
        const { username } = req.body;
        const aUser = await User.get(username);
        return res.json({user: aUser});
    } catch (err) {
        return next(err);
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async function(req, res, next) {
    try {
        const { username } = req.body;
        const toUserMessages = await User.messagesTo(username);
        return res.json({messages: toUserMessages});
    } catch (err) {
        return next(err);
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async function(req, res, next) {
    try {
        const { username } = req.body;
        const fromUserMessages = await User.messagesFrom(username);
        return res.json({messages: fromUserMessages});
    } catch (err) {
        return next(err);
    }
})

module.exports = router;