const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const dg = require('./serverDg');
const path = require('path')


app.use(express.static(__dirname+'/public'));
console.log(path.join(__dirname,'node_modules/three/build'));
app.use('/build/',express.static(path.join(__dirname,'node_modules/three/build'))   );
app.use('/jsm/',express.static(path.join(__dirname,'node_modules/three/examples/jsm')));
app.use('/images/',express.static(path.join(__dirname,'images')));
app.use('/public/',express.static(path.join(__dirname,'public')));



const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
 
});

app.get('/gameover.html',(req,res)=>{
  console.log(__dirname + "/gameover.html");
  res.sendFile(__dirname + "/gameover.html");
})

//establish connection
var roomNo = 1;
var usersNo = 0;
io.on('connection', (socket) => {
  console.log("hi");
  socket.join("room-"+roomNo);
  io.sockets.in("room-"+roomNo).emit('connectToRoom', "You are in room no. "+roomNo);
  //var users = io.sockets.adapter.rooms["room-"+roomNo];
  if(usersNo == 0){
    console.log("user1 defined");
    user1ID = socket.id;
    team1.assignID(socket.id);
    socket.emit('assignTeam',"team1");
    usersNo += 1;
  }else if(usersNo == 1){
    console.log("user2 defined");
    user2ID = socket.id; 
    team2.assignID(socket.id);
    socket.emit('assignTeam',"team2");
  }else{
    socket.disconnect();
  }
  
  //Send this event to everyone in the room.
  

  socket.on('disconnect', function () {
    console.log('A user disconnected');
  });

  socket.on('action',(entityX,entityY,coordX,coordY)=>{
   
    var entity = b.get([entityX,entityY]);
    if(socket.id != activeTeam.id){
      console.log("eatpeee");
      return false;
    }
    console.log("eatppoo");
    //validates move by comparing against sever-side gamestate
    isLegalAction(socket,entity,coordX,coordY);
       //returns gamestate to users

  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});


//establish sever-side gamestate


var user1ID;
var user2ID;
const b = new dg.Board();
const team1 = new dg.Team("team1");//blue
const team2 = new dg.Team("team2");//blue
var activeTeam = team2;

//(coords, team,name,b)    
const KintanStrider = new dg.Brute([0,6],team1,"KintanStrider",b); 

const NgOk = new dg.Predator([1,7],team1,"NgOk",b);
const Houjix = new dg.Scout([0,7],team1,"Houjix",b);
const Monnok = new dg.Guardian([1,6],team1,"Monnok",b);

//team2, clockwise asignment of indices for orbitsfkyea
const MantellianSavrip = new dg.Brute([0,0],team2,"MantellianSavrip",b);
const KLorSlug = new dg.Predator([1,1],team2,"KLorSlug",b);
const Ghhhk = new dg.Scout([1,0],team2,"Ghhhk",b);
const GrimtaashTheMolator = new dg.Guardian([0,1],team2,"GrimtaashTheMolator",b);


function canAttackChain(entity){
  //enemy coords [coordX,coordY]
  for(let i=0;i<2;i++){
      for(let j=0;j<12;j++){
          let enemy = b.get([i,j]);
          if(entity.isLegalAttack([i,j])){
              if(enemy.team != activeTeam){
                  return true;
              }
          }
      }
  }
  return false;
}
var attackChain = false;

function isLegalAction(socket,entity,coordX, coordY){
  if(entity.team != activeTeam){
    console.log("Not your turn",entity.team.name,"its'",activeTeam.name,"turn");
    return false;
  }
  if(entity.isLegalAttack([coordX,coordY])){  
    //attack 
    var entityX = JSON.parse(JSON.stringify(entity.coords[0]));
    var entityY = JSON.parse(JSON.stringify(entity.coords[1]));
    entity.attack([coordX,coordY]);
    if(!canAttackChain(entity)){
        activeTeam = activeTeam == team1 ? team2 : team1;
        attackChain = false;
    }else{
        attackChain = true;
    }
    entity.team.counter = 3;
    if(team1.members.length == 0 || team2.members.length == 0){
      console.log("Gameoever");
    //  app.use(express.static("./gameover.html"));
      io.sockets.emit("gameOver",true);
    }
    io.sockets.emit('validatedAttack',entityX,entityY,coordX,coordY,activeTeam.name);
    return true;
  }else if(entity.isLegalMove([coordX,coordY]) ){
    var entityX = JSON.parse(JSON.stringify(entity.coords[0]));
    var entityY = JSON.parse(JSON.stringify(entity.coords[1]));
   
    entity.move([coordX,coordY]);
    activeTeam = activeTeam == team1 ? team2 : team1;
   
    if(entity.team.members.length == 1){
        entity.team.counter -= 1;
        if(entity.team.counter == 0){
          console.log("Game Over! (by sudden death)");
        }
    }
    io.sockets.emit('validatedMove',entityX,entityY,coordX,coordY,activeTeam.name);
    return true;
   
  }else{
    console.log("Invalid");
    return false;
  }   
}