const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

// load up the user model
const {
  users,
  tags,
  likes
} = require("../models/index.js");

module.exports = function(passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken()
  ]);
  opts.secretOrKey = process.env.SECRET_KEY;

  passport.use(
    new JwtStrategy(opts, async function(jwt_payload, done) {
      try {
        const user = await users.findOne({
          where: {
            id: jwt_payload.id
          },
          include: [
            {
              model: tags,
              as: "tags",
              attributes: ["id", "name"]
            },
            {
              model: likes,
              as: "likes",
              attributes: ["entityId", "referenceId"]
            }
          ]
        });

        if (user) {
          return done(null, user);
        }

        return done({
          error: "user not found"
        });
      } catch (e) {
        ILogger.error(e);
      }
    })
  );
};
