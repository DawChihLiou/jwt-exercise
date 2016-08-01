var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var jwt        = require('jsonwebtoken');

var config     = require('./config');

var User       = require('./app/models/user');

var port       = process.env.PORT || 8080;

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


app.listen(port);
console.log('magic happens at http://localhost: ' + port);