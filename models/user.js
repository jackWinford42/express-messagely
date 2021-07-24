/** User class for message.ly */

const db = require("../db");
const bcrypt = require("bcrypt");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.query(
      `INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    //console.log(current_timestamp)
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING last_login_at`,
      [username]);

    if (!result.rows[0]) {
      throw new ExpressError(`No such message: ${id}`, 404);
    }

    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT 
      username,
      first_name,
      last_name,
      phone
      FROM users`
    )
    return results.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT
      username,
      first_name,
      last_name,
      phone,
      last_login_at,
      join_at
      FROM users
      WHERE username=$1`,
      [username]);
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const messages = await db.query(
      `SELECT
      to_username,
      id,
      body,
      sent_at,
      read_at
      FROM messages
      WHERE from_username=$1`,
      [username]);
    const toUsername = messages.rows[0].to_username
    const toUser = await db.query(
      `SELECT
      username,
      first_name,
      last_name,
      phone
      FROM users
      WHERE username=$1`,
      [toUsername]);
    const messageDict = messages.rows
    for (const index in messageDict) {
      messageDict[index].to_username = toUser.rows[0]
    }
    return messageDict;
  }


  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const messages = await db.query(
      `SELECT
      id,
      from_username,
      body,
      sent_at,
      read_at
      FROM messages
      WHERE to_username=$1`,
      [username]);
    const fromUsername = messages.rows[0].from_username
    const fromUser = await db.query(
      `SELECT
      username,
      first_name,
      last_name,
      phone
      FROM users
      WHERE username=$1`,
      [fromUsername]);
    const messageDict = messages.rows
    for (const index in messageDict) {
      messageDict[index].from_username = fromUser.rows[0]
    }
    return messageDict;
  }
}

module.exports = User;