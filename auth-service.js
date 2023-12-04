const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
    },
    password: String,
    email: String,
    loginHistory: [{ 
        dateTime: Date, 
        userAgent: String }]
})

let User; 

module.exports.initialize = ()=>  {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://dantheoo12:MncYFZiuXuvoNS8a@seneca.w0ttvh0.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); 
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {
            bcrypt.hash(userData.password, 10).then( hash =>{
            userData.password = hash;
        })
        .then(() => {
            let newUser = new User(userData);
            newUser.save().then(() => {
                resolve();
            })
            .catch((err) => {
                if (err.code == 11000) {
                    reject( "Username already taken");
                }
                else {
                    reject(`There was an error creating the user: ${err}`);
                }
            })
        })
        .catch((err) =>{
            reject("There was an error encrypting the password");
        });
    }})
}

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName}).exec()
        .then((foundUsers) => {
            if (foundUsers.length == 0) { 
                reject(`Unable to find user: ${userData.userName}`);
            }

            bcrypt.compare(userData.password, foundUsers[0].password).then((found) => {
                if (!found) {
                    reject(`Incorrect Password for user: ${userData.userName}`);
                }
                else { 
                    foundUsers[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                    User.updateOne(
                        {userName: foundUsers[0].userName},
                        {$set: {loginHistory: foundUsers[0].loginHistory}}
                    ).exec()    
                    .then(() => { 
                        resolve(foundUsers[0]);
                    })
                    .catch((err) => {
                        reject(`There was an error verifying the user: ${err}`);
                    })
                }
             })
        })
        .catch((err) => {
            reject(`Cannot find user: ${userData.userName}`);
        })
    })
}