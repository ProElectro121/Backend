import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'

const app = express();

mongoose.connect('mongodb://0.0.0.0:27017' , {
    dbName: 'backendDatabseUser',
})
.then(() => {
    console.log('databse connected');
}).catch((error) => {
    console.log('error in connection. The error is' , error);
}).finally(() => {
    console.log('something happened whether connection made or not');
})

const UserSchema = new mongoose.Schema({
    name: String ,
    email: String ,
    password: String
});

const User = mongoose.model("User" , UserSchema);


app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// app.get('/' , (req , res) => {
//     const curPath = path.join(path.resolve() , './index.html');
//     console.log(curPath);
//     res.sendFile(curPath)
// });

app.set('view engine' , 'ejs');

// app.get('/' , (req , res) => {
//     res.render('index' , {
//         name: {
//             age: 21 ,
//             city: 'kanpur'
//         } ,
//         branch: 'information technology'
//     });
// });

const isAunthicated = async (req , res , next) => {
    const {token} = req.cookies;

    console.log(req.body)

    // console.log('hi')
    // console.log(req.user)
    // console.log('hi')


    if(token) {
        const decodedToken = jwt.verify(token, "SecertHaiBhai");
        req.user = await User.findById(decodedToken._id);
        
        next();
    }
    else {
        res.render('login');
    }
}

app.get('/' , isAunthicated, (req , res) => {
    const {name} = req.user
    console.log(name)
    res.render('logout' , {name});
})

// app.get('/' , (req , res) => {
//     const {token} = req.cookies
//     if(token) {
//         res.render('logout');
//     }
//     else {
//         res.render('login');
//     }
// })

app.get('/logout' , (req , res) => {
    res.cookie('token' , null , {
        httpOnly: false ,
        expires: new Date(Date.now())
    });
    res.redirect('/');
});

// app.get('/app' ,  (req , res) => {
//     message.create({
//         name: 'Puspendra' ,
//         email: 'puspendrayadav149@gmail.com'
//     }).then(() => {
//         res.send('Info added to the database');
//     }).catch((error) => {
//         res.send(toString(error));
//     })
// })



// app.post('/contact' , (req , res) => {
//    console.log(req.body);
//    const {name , email} = req.body;
//    message.create({name , email});
//    res.redirect('success');
// });

app.get('/register' , (req , res) => {
    res.render('register');
})

app.post('/register' , async (req , res) => {

    const {name , email , password} = req.body;

    const isUserExist = await User.findOne({email});
    if(isUserExist) {
        console.log('user exist please login');
        return res.redirect('login')
    }
    else {
        console.log('user does not exist. Creating one');
    }

    const newUser = await User.create({
        name , 
        email , 
        password
    })
    const token = jwt.sign({_id: newUser._id} , "SecertHaiBhai");
    res.cookie('token' , token , {
        httpOnly: true ,
        expires: new Date(Date.now() + 60*1000)
    })
    res.redirect('/');
});


app.post('/login' , async (req , res) => {
    // res.cookie('token' , 'newvalue' , {
    //     httpOnly: true ,
    //     expires: new Date(Date.now() +  30000)
    // });
    const {name , email , password} = req.body;

    const isUserExist = await User.findOne({email});
    if(!isUserExist) {
        console.log('register first');
        return res.redirect('register')
    }
    else {
        console.log('user exist');
    }

    // const newUser = await User.create({
    //     name , 
    //     email
    // })

    const prevPassword = isUserExist.password;

    if(prevPassword !== password) {
        console.log('Enter correct password');
        return res.render('login');
    }
    else {
        console.log('password match. Login the user');
    }

    

    const token = jwt.sign({_id: isUserExist._id} , "SecertHaiBhai");
    res.cookie('token' , token , {
        httpOnly: true ,
        expires: new Date(Date.now() + 60*1000)
    })
    res.render('logout' , {name: 'puspendra'});
    res.redirect('/');
});





app.listen(5000 , () => {
    console.log('app is lisening');
})