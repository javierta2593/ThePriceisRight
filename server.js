var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io'),
    io = io.listen(server),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

// body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//directory where files all lie in
app.use('/', express.static(__dirname + '/'));

// home page
app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});









var users = {};
var userPlaying = {};
var numPlayers = 0;
var roundStarted = false;
var picked = "";

function pickRandomProperty() {
    var result;
    var count = 0;
    for (var prop in users)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

// Socket.io 
io.on('connection', function(socket){
 
    socket.on("join", function(username, callback){
        users[socket.id] = username;
        console.log(users[socket.id] + ' has connected' + socket.id);

        numPlayers += 1;

        if(roundStarted === false)
        {
            if(numPlayers >= 6)
            {
                roundStarted = true;

                for (i = 0; i < 5; i++) //pick 5 random users
                {
                    var chosen = true;

                    while(chosen === true)
                    {
                        picked = pickRandomProperty();
                        if(!userPlaying.hasOwnProperty(picked))
                        {
                            chosen = false;
                        }
                    }
                    console.log("picked: " + picked);
                    userPlaying[picked] = picked;
                }       
                for (var key in users) 
                {
                    var playing = false;
                    if (users.hasOwnProperty(key)) 
                    {
                        for(var key2 in userPlaying)
                        {

                            if(userPlaying.hasOwnProperty(key2))
                            {


                                if(key === userPlaying[key2])
                                {
                                    playing = true;
                                    io.to(key).emit("playing");
                                }
                            }
                        }
                    }
                    if(playing === false)
                    {
                        io.to(key).emit("spectating");
                    }
                }
            }
            else
            {
                socket.emit("waiting-room");
            }                
        }
        else
        {
            socket.emit("spectating");
        }
    });


    socket.on("disconnect", function(){
        console.log(users[socket.id] + " has left the server.");
        //io.emit("update-users", users[socket.id]);
        delete users[socket.id];
        //io.emit("update-people", users);
    });

});

// Express and Socket.io both listening on port 3000
server.listen(3000, function(){
  console.log('listening on *:3000');
});



console.log("server is now listening");
