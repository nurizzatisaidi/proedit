const bcrypt = require('bcryptjs');

const password = 'Admin@123'; // The admin's password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed Password:', hashedPassword);
    }
});
