
class Board{
    constructor(){
       

        this.grid = [];
        for(var i=0;i<2;i++){
        this.grid.push([0,0,0,0,0,0,0,0,0,0,0,0]);
        } 
        // grid[0] represents inner orbit, grid [1] represents outer orbit
    }
    set(coords,obj){
        this.grid[coords[0]][coords[1]] = obj;
    }
    get(coords){
        return this.grid[coords[0]][coords[1]];
    }
}
module.exports.Board = Board;

class Entity{
    constructor(coords, team,name,b){    
        // [ray, orbit]
        this.b = b;
        this.coords = coords;
        (this.coords);
        this.b.set(this.coords,this);
        //for the Brute's attack 
        this.moved = false;
        this.dead = false;

        this.team = team;

        this.name = name;
  
        this.team.join(this);
    }

   
    rayDist(coords1,coords2){
        return coords1[0] == coords2[0] ? 0 : 1;
    }
    orbitDist(coords1,coords2){
        return Math.min(Math.abs(coords1[1] - coords2[1]), Math.abs(12-Math.max(coords1[1],coords2[1])+ Math.min(coords1[1],coords2[1])) );
    }
    diagonalDist(coords1,coords2){
        //(coords1,coords2);
       
        if(coords1[0] != coords2[0] && this.orbitDist(coords1,coords2) == 1){
       
            return 1;
        }
        return -1;
    }
    isLegalMove(coords){
        if(this.b.get(coords) != 0){
            return false;
        }
        return true;
      //overrided by child export class
    }
    isLegalAttack(coords){
        if(this.b.get(coords) == 0){
            return false;
        }
        return true;
    }
    move(coords){
        this.b.set(this.coords,0);
        this.b.set(coords,this);
        this.moved = true; 
        this.coords = coords; 
        return true;
    }
    attack(coords){
        this.b.set(this.coords,0);
        let attacked = this.b.get(coords);
        if(attacked != 0){
            attacked.isDead();
            this.b.set(coords,this);
            this.moved = true;  
            this.coords = coords;
            return true;
        }
    }
    isDead(){
        this.dead = true;
        this.team.members.pop(this);
    }
}
  
  
class Brute extends Entity{
    isLegalMove(coords){
        if(!super.isLegalMove(coords)){
            return false;
        }
        if(  (this.rayDist(this.coords,coords) == 1 && this.orbitDist(this.coords,coords) == 0)  || this.orbitDist(this.coords,coords) == 1 || this.diagonalDist(this.coords,coords) == 1){
            return true;
        }else if(this.coords[0] == 1 && coords[0] == 1 && (this.coords[1]+6 == coords[1] || this.coords[1]-6 == coords[1]) ){
            return true;
        }
        ("-");
        return false;
    }

    isLegalAttack(coords){
       (this.coords);
        if(!super.isLegalAttack(coords)){
            return false;
        }
        if(this.b.get(coords).moved == false){
            ("cannot attack hasnt moved");
            return false;
        }
        if(  (this.rayDist(this.coords,coords) == 1 && this.orbitDist(this.coords,coords) == 0)  || this.orbitDist(this.coords,coords) == 1 || this.diagonalDist(this.coords,coords) == 1){
            return true;
        }
     
        return false;
    }
}
module.exports.Brute = Brute;
  
class Predator extends Entity{
    isLegalMove(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalMove(coords)){
            return false;
        }
        if(this.rayDist(this.coords,coords) == 1 && this.orbitDist(this.coords,coords) == 0){
            return true;
        }
        if(this.orbitDist(this.coords,coords) == 2 && this.rayDist(this.coords,coords) == 0){
            return true;
        }
        return false;
    }
    isLegalAttack(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalAttack(coords)){
            return false;
        }
        //1 space in Ray, then 2 spaces in Orbit (like an L-shape).
        if(this.orbitDist(this.coords,coords) == 2 && this.rayDist(this.coords,coords) == 1){
            let temp = this.coords[0] == 1 ? 0 : 1;
            let temp2 = 1;
            if(this.b.get([temp,this.coords[1]]) != 0){
                return false;
            }
            if(coords[1] < this.coords[1]){
                temp2 = -1;
            }
            if(this.b.get([coords[0],this.coords[1]+1*temp2]) != 0){
                return false;

            } 
            return true;
        }
    }
}

module.exports.Predator = Predator;

class Scout extends Entity{
    isLegalMove(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalMove(coords)){
            return false;
        }
        if(coords == this.coords){
            return true;
        }
    
        if(this.diagonalDist(this.coords,coords) == 1){
            return true;
        }else if(this.orbitDist(this.coords,coords) == 2 && this.rayDist(this.coords,coords) == 0){
            if(this.b.get([this.coords[0],Math.max(this.coords[1],coords[1])-1]) != 0){
                return false;
            }
            return true;
        }
        return false;
        //This piece can move off the start point and back again.
    }
    isLegalAttack(coords){
     /*
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        */
        if(!super.isLegalAttack(coords)){
            return false;
        }
        if(this.rayDist(this.coords,coords) == 1 && this.coords[1] == coords[1]){
            return true;
        }
        return false;
    }
}
module.exports.Scout = Scout;

class Guardian extends Entity{
    isLegalMove(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalMove(coords)){
            return false;
        }
        //1 space in Ray, then 2 spaces in Orbit (like an L-shape).
        if(this.orbitDist(this.coords,coords) == 2 && this.rayDist(this.coords,coords) == 1){
            let temp = this.coords[0] == 1 ? 0 : 1;
            let temp2 = 1;
            if(this.b.get([temp,this.coords[1]]) != 0){
                return false;
            }
            if(coords[1] < this.coords[1]){
                temp2 = -1;
            }
            if(this.b.get([coords[0],this.coords[1]+1*temp2]) != 0){
                return false;
            } 
            return true;
        }
        //This piece can move off the start point and back again.
    }
    isLegalAttack(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalAttack(coords)){
            return false;
        }
        //2 spaces in Orbit.
        if(this.orbitDist(this.coords,coords) == 2 && this.rayDist(this.coords,coords) == 0){
            return true;
        }
        //make sure nothing is in between this.coords and coords

    }
}
module.exports.Guardian = Guardian;
class Team{
    constructor(name){
          //the one difference from client-side dg.js
        this.id = null;

        this.name = name;
        this.members = [];
        this.counter = 3;
    }
    
    join(member){   
        this.members.push(member);
     
    }

    contains(member){
        return member in this.members;
    }

    assignID(id){
        if(this.id == null){
            this.id = id;
            return true;
        }
        return false;
    }
}

module.exports.Team = Team;
