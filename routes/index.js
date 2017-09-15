var express = require('express');
var router = express.Router();
var passport = require('passport');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'prk',
    password : 'prk',
    database : 'prk'
});

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// register
router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Express' });
});

// logout
router.get('/logout', function(req, res, next) {
    req.session.destroy(); // hapus semua session
    // contoh : req.session.destroy('users');

    res.redirect('/');
});

// post doRegis
router.post('/doRegis', function (req, res, next) {
    var username = req.body.txtUsername;
    var email = req.body.txtEmail;
    var password = req.body.txtPassword;
    var gender = req.body.gender;

    var sql = "insert into users values(?, ?, ?, ?, ?)";
    var values = [null, username, email, password, gender];

    connection.query(sql, values, function (err, results) {
       if(err)
       {
          console.log(err);
          throw err;
       }
       return res.redirect('/');
    });
});

// doLogin
router.post('/doLogin', function (req, res, next) {
   var credential = req.body.credential;
   var password = req.body.txtPassword;

   var sql = "select * from users where (username = ? or email= ? and password = ?)";
   var values = [credential, credential, password];

    connection.query(sql, values, function (err, results) {
        if(err)
        {
            console.log(err);
            throw err;
        }
        if(results.length == 0)
        {
            return res.redirect('/');
        }
        req.session.user = results[0];

        return res.redirect('/home');
    });

});

var authMiddleware = function (req, res, next) {
    if(req.session.user)
    {
        next();
    }
    else
    {
        res.redirect('/');
    }
};

// home
router.get('/home', authMiddleware, function (req, res, next) {
    res.render('home', {user:req.session.user});
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] })); //scope untuk jadi permission agar bisa diambil emailnya

router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    //req.session.user = req.user; //simpen hasil dari API facebook ke session
    //return res.redirect('/home'); //lgsung redirect ke halaman home ketika sudah berhasil login

    // cek email di facebook terdaftar atau tidak
    var sql = "select * from users where email = ?";
    var values = [req.user.emails[0].value];
    //console.log(req.user);
    //return res.send(req.user);

    connection.query(sql, values, function (err, results) {
       if(err)
       {
           console.log(err);
           throw err;
       }

       if(results.length == 0)
       {
           req.session.email = req.user.emails[0].value;
           res.redirect('/register');
       }

       req.session.user = results[0];
       return res.redirect('/home');
    });
});

module.exports = router;
