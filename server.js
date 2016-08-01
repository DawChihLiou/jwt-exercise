var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var jwt        = require('jsonwebtoken');

var config     = require('./config');

var User       = require('./app/models/user');

var port       = process.env.PORT || 8080;

var routes     = express.Router();

mongoose.connect(config.database);

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/setup', function (req, res) {
    // create a dummy user
    var nick = new User({
       name : 'Foo Boo',
       password: 'notapassword',
       admin: true
    });
    
    // save dummy user
    nick.save(function (err) {
        if (err) throw err;
        
        console.log('User saved successfully');
        res.json({ success: true });
    });
});

routes.post('/authenticate', function (req, res) {
    var name = req.body.name;
    var password = req.body.password;
    
    User.findOne({
       name: name,
       password: password
    }, function (err, user) {
        var token;
        
        if (err) throw err;
        
        if (!user) {
            res.json({ sucess: false, message: 'Authenticateion failed. ' + name + ' not found' });
        } else {
            token = jwt.sign(user, app.get('superSecret'), {
                expiresIn: 60*60*24
            });
            
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }
    });
});


routes.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    
    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
           success: false,
           message: 'No token provided'
        });
    }
});

routes.get('/', function (req, res) {
   res.json({ message: 'Welcome to the coolest API on earth!' }); 
});

routes.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        if (err) throw err;
        
        res.json(users)
    });
});


app.use('/api', routes);


app.listen(port);
console.log('magic happens at http://localhost: ' + port);