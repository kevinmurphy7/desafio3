import passport from "passport";
import { hashData, compareData } from "./utils.js";
import { usersManager } from "./dao/managers/UsersManager.js";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";

const SECRETJWT = "jwtSecret";

passport.use('signup', new LocalStrategy(
    { passReqToCallback: true, usernameField: 'email' },
    async (req, email, password, done) => {
        try {
            const { first_name, last_name } = req.body;
            if (!first_name || !last_name || !email || !password) {
                return done(null, false);
            }
            const hashedPassword = await hashData(password);

            const role = (email === "adminCoder@coder.com") ? 'admin' : 'user';

            const createdUser = await usersManager.createUser({ ...req.body, password: hashedPassword,role});
            done(null, createdUser);
        } catch (error) {
            done(error);
        }
    }));

passport.use('login', new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
        try {
            if (!email || !password) {
                done(null, false);
            }

            const user = await usersManager.getUserByEmail(email);
            if (!user) {
                return done(null, false);
            }

            const isPasswordValid = await compareData(password, user.password);
            if (!isPasswordValid) {
                return done(null, false);
            }

            done(null, user)
        } catch (error) {
            done(error);
        }
    }));

passport.use('github', new GithubStrategy(
    {
        clientID: "Iv1.f6f6908d6d4afeaa",
        clientSecret: "a27e9968af4b3ac117715b6be58d439884d5d5ee",
        callbackURL: "http://localhost:8080/api/sessions/callback",
    },
    async (accessToken, refreshToker, profile, done) => {
        try {
            const userDB = await usersManager.getUserByEmail(profile._json.email);

            if (userDB) {
                if (userDB.isGithub) {
                    return done(null, userDB);
                } else {
                    return done(null, false);
                }
            }

            const infoUser = {
                first_name: profile._json.name.split(' ')[0],
                last_name: profile._json.name.split(' ')[1],
                email: profile._json.email,
                password: " ",
                isGithub: true
            };
            if(infoUser.email === "adminCoder@coder.com") {
                infoUser.role = 'admin';
            }
            const createdUser = await usersManager.createUser(infoUser);
            done(null, createdUser);

        } catch (error) {
            done(error)
        }
    }))

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usersManager.getUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

const fromCookies = (req) => req.cookies.token;

passport.use('jwt', new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([fromCookies]),
    secretOrKey: SECRETJWT,
}, (jwt_payload, done) => {
    done(null, jwt_payload);
}));