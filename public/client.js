import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { STLLoader } from './jsm/loaders/STLLoader.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { PixelShader } from './jsm/shaders/PixelShader.js';
import { VignetteShader} from './jsm/shaders/VignetteShader.js';
import { OutlinePass} from './jsm/postprocessing/OutlinePass.js';
import Stats from './jsm/libs/stats.module.js'
import {Board,Entity, Brute, Predator, Scout, Guardian, Team} from './public/dg.js';

function toDegrees (angle) {
    return angle * (180 / Math.PI);
}


function toRadians (angle) {
    return angle * (Math.PI / 180);
}

const scene = new THREE.Scene();
var texture0 = new THREE.TextureLoader().load( '/images/background.png' );

scene.background = texture0;
//const axesHelper = new THREE.AxesHelper(500);
//scene.add( axesHelper );
const light1 = new THREE.AmbientLight( 0xFFFFFF,0.2);
const color = 0xFFFFFF;
const light2 = new THREE.DirectionalLight(color, 1);
light2.castShadow = true;
light2.position.set(0, 250, 0);
light2.target.position.set(-4, 0, -4);
const d = 250;
light2.shadow.camera.left = - d;
light2.shadow.camera.right = d;
light2.shadow.camera.top = d;
light2.shadow.camera.bottom = - d;
light2.shadow.mapSize.width = 5002;  
light2.shadow.mapSize.height = 5002; 
light2.shadow.camera.near = 0.5;


scene.add(light1);
scene.add(light2);
//const helper = new THREE.DirectionalLightHelper( light2, 3);
//scene.add( helper );
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );
//camera.position.set(0,0,0);
//const cameraHelper = new THREE.CameraHelper(light2.shadow.camera);
//scene.add(cameraHelper);
/*
function switchSide(){
    if(camera.position.x > 0){
        camera.position.set(-300,150,0);
        document.getElementById("button").innerHTML = "Switch 2 Blue Side";
    }else{
        camera.position.set(300,150,0);
        document.getElementById("button").innerHTML = "Switch 2 Red Side";
    }
}
document.getElementById("button").onclick = switchSide;
*/
const renderer = new THREE.WebGLRenderer();
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio( window.devicePixelRatio )
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);
document.body.appendChild(renderer.domElement);

var composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( scene, camera ) );
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.visibleEdgeColor = new THREE.Color( 0.5, 1, 1 );
composer.addPass( outlinePass );

var pixelPass = new ShaderPass( PixelShader );
pixelPass.uniforms[ 'pixelSize' ].value = 1;//6;
pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
pixelPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
composer.addPass( pixelPass );
//var a = new ShaderPass(VignetteShader );
//composer.addPass( a );

const controls = new OrbitControls(camera, renderer.domElement)
//controls.enableDamping = false
controls.enableZoom = false;
//0.5 is scale (smaller number means closer)
camera.position.set(250*1.25,70*1.25, 0);
//camera.position.set(0,500,0);
//camera.rotateY = 180;

//camera.position.set(300,150,0);
controls.update();
controls.maxPolarAngle = 1.28;

var texture1 = new THREE.TextureLoader().load( '/images/board.png' );
const texture2 = new THREE.MeshPhongMaterial( {color: 0xffffff} );

var materials = [];
materials.push(texture2);
materials.push(new THREE.MeshPhongMaterial({ map: texture1 }));
materials.push(texture2);
const geometry = new THREE.CylinderGeometry( 190, 190, 10, 100 );



const cylinder = new THREE.Mesh( geometry,materials);
cylinder.position.set(0,0,0);
cylinder.receiveShadow = true;

scene.add( cylinder );

function drawPosAttacks(entity){
    let posMoves = [];
    for(let i=0;i<2;i++){
        for(let j=0;j<12;j++){
            let enemy = b.get([i,j]);
            if(entity.isLegalAttack([i,j])){
                if(enemy.team != activeTeam){
                    posMoves.push(drawAttack(i,j));
                }
            }
        }
    }
    return posMoves;
}

function drawPosMoves(entity){
    let posMoves = [];
    for(let i=0;i<2;i++){
        for(let j=0;j<12;j++){
            if(entity.isLegalMove([i,j])){
                posMoves.push(drawMove(i,j));
            }
        }
    }
    return posMoves;
}

function setPos(mesh,coords){
    let d = -30*coords[1];
    mesh.rotateY(toRadians(d));
}
const geometry2 = new THREE.CylinderGeometry( 190, 190, 0.01, 100 );
var innerMoveTexture = new THREE.TextureLoader().load( '/images/innerMovePiece.png' );
var outerMoveTexture = new THREE.TextureLoader().load( '/images/outerMovePiece.png' );

var innerMoveMaterial=new THREE.MeshBasicMaterial({map:innerMoveTexture});
innerMoveMaterial.transparent = true;
innerMoveMaterial.opacity = 0.69;
innerMoveMaterial.receiveShadow = true;
var outerMoveMaterial=new THREE.MeshBasicMaterial({map:outerMoveTexture});
outerMoveMaterial.transparent = true;
outerMoveMaterial.opacity = 0.69;
outerMoveMaterial.receiveShadow = true;

var innerAttackTexture = new THREE.TextureLoader().load( '/images/innerAttackPiece.png' );
var outerAttackTexture = new THREE.TextureLoader().load( '/images/outerAttackPiece.png' );
var innerAttackMaterial=new THREE.MeshBasicMaterial({map:innerAttackTexture});
innerAttackMaterial.transparent = true;
innerAttackMaterial.opacity = 0.69;
innerAttackMaterial.receiveShadow = true;
var outerAttackMaterial=new THREE.MeshBasicMaterial({map:outerAttackTexture});
outerAttackMaterial.transparent = true;
outerAttackMaterial.opacity = 0.69;
outerAttackMaterial.receiveShadow = true;

var innerBlueTexture = new THREE.TextureLoader().load( '/images/innerBlue.png' );
var innerBlueMaterial=new THREE.MeshBasicMaterial({map:innerBlueTexture});
innerBlueMaterial.transparent = true;
innerBlueMaterial.opacity = 0.69;

var outerBlueTexture = new THREE.TextureLoader().load( '/images/outerBlue.png' );
var outerBlueMaterial=new THREE.MeshBasicMaterial({map:outerBlueTexture});
outerBlueMaterial.transparent = true;
outerBlueMaterial.opacity = 0.69;

function drawPiece(ray,orbit){
    if(ray == 0){
        var cylinder2 = new THREE.Mesh( geometry2,innerBlueMaterial);

    }else{
        var cylinder2 = new THREE.Mesh( geometry2,outerBlueMaterial);

    }
    cylinder2.position.set(0,5.01,0);
    cylinder2.receiveShadow = true;
    setPos(cylinder2,[ray,orbit]);
    cylinder2.rotateY(toRadians(180));
    scene.add( cylinder2 );
    return cylinder2;
}

function drawMove(ray,orbit){
    if(ray == 0){
        var cylinder2 = new THREE.Mesh( geometry2,innerMoveMaterial);

    }else{
        var cylinder2 = new THREE.Mesh( geometry2,outerMoveMaterial);

    }
    cylinder2.position.set(0,5.01,0);
    cylinder2.receiveShadow = true;
    setPos(cylinder2,[ray,orbit]);
    scene.add( cylinder2 );
    return cylinder2;
}

function drawAttack(ray,orbit){
    if(ray == 0){
        var cylinder2 = new THREE.Mesh( geometry2,innerAttackMaterial);

    }else{
        var cylinder2 = new THREE.Mesh( geometry2,outerAttackMaterial);
      
    }
    cylinder2.position.set(0,5.01,0);
    cylinder2.receiveShadow = true;
    setPos(cylinder2,[ray,orbit]);
    scene.add( cylinder2 );
    return cylinder2;
}

function clearMoves(){
    console.log("hi");
    for(let i=0;i<posMoves.length;i++){
        scene.remove(posMoves[i]);
       
    }
    posMoves = [];
}

function clearAttacks(){
    for(let i=0;i<posAttacks.length;i++){
        scene.remove(posAttacks[i]);
        
    }
    posAttacks = [];
}
var piece;
function clearPiece(){
    scene.remove(piece);
}


//const shadow_material = new THREE.ShadowMaterial();
//shadow_material.opacity = 0.5;
//const shadow_cylinder = new THREE.Mesh( geometry,shadow_material);
//shadow_cylinder.position.set(0,0,0);

//shadow_cylinder.receiveShadow = true;
//scene.add( shadow_cylinder );

const b = new Board();
//const characters = new THREE.Group();
let team1 = new Team("team1",0xFF0000,0xFF6666);//red
let team2 = new Team("team2",0x0000FF,0x6666FF);//blue

var activeTeam = team2;

const loader = new STLLoader();
//team1
const KintanStrider = new Brute([0,6],team1,"KintanStrider","images/kintan_strider.stl",b,scene,outlinePass); 

const NgOk = new Predator([1,7],team1,"NgOk","images/NG_OK.stl",b,scene,outlinePass);
const Houjix = new Scout([0,7],team1,"Houjix","images/Houjix.stl",b,scene,outlinePass);
const Monnok = new Guardian([1,6],team1,"Monnok","images/monnok.stl",b,scene,outlinePass);

//team2, clockwise asignment of indices for orbitsfkyea
const MantellianSavrip = new Brute([0,0],team2,"MantellianSavrip","images/Mantellian_Savrip.stl",b,scene,outlinePass);
const KLorSlug = new Predator([1,1],team2,"KLorSlug","images/K_LOR_SLUG.stl",b,scene,outlinePass);
const Ghhhk = new Scout([1,0],team2,"Ghhhk","images/Ghhhk.stl",b,scene,outlinePass);
const GrimtaashTheMolator = new Guardian([0,1],team2,"GrimtaashTheMolator",'images/grimtaash.stl',b,scene,outlinePass);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render();
}
/*
const stats = Stats();
document.body.appendChild(stats.dom);
*/

const raycaster = new THREE.Raycaster();
//const rayHelper = new THREE.CameraHelper(raycaster.frustum.camera);
//scene.add(rayHelper);
const pointer = new THREE.Vector2();
var pickedObject = null;
var pickedObjectMaterial = null;


//centered on 0,0
function isInCircle(r,x,z){
    //equation of circle: r^2 = x^2 + y^2
 // (x,y);

    var z_max = Math.abs( Math.sqrt(Math.pow(r,2)-Math.pow(x,2)) );
    var z_min = -z_max;
    var x_max = Math.abs( Math.sqrt(Math.pow(r,2)-Math.pow(z,2)) );;
    var x_min = -x_max;
    if(z_max > z && z > z_min && x_max > x && x > x_min){
        return true;
    }
    return false;
}

var mouse_x;
var mouse_y;
var entity_orbit;
var entity_ray;

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
function action(coordX, coordY,entity){
    if(entity.team != activeTeam){
        ("Not your turn",activeTeam.name);
        return;
    }

    if(entity.isLegalAttack([coordX,coordY])){  
       // clearPiece();
        clearAttacks();
        console.log(1);
        clearMoves();
    
        if(pickedObject != null){
            pickedObject.mesh.material = new THREE.MeshStandardMaterial( {color:pickedObject.team.color} ) ;
        }
         //attack 
        entity.attack([coordX,coordY]);
        //restart sudden death

        if(!canAttackChain(entity)){
            activeTeam = activeTeam == team1 ? team2 : team1;
            /*
            if(activeTeam == team1){
                camera.position.set(-300,150,0);
            }else{
                camera.position.set(300,150,0);
            }
            */
            attackChain = false;
    
            clearAttacks();
        }else{
            attackChain = true;
            drawPosAttacks(pickedObject);
            
        }
        entity.team.counter = 3;
        if(team1.members.length == 0 || team2.members.length == 0){
            window.setTimeout(function a(){
                alert("Game Over!");
            },100);
        }
    }else if(entity.isLegalMove([coordX,coordY]) ){
        clearMoves();
      //  clearPiece();
        console.log(2);
        clearAttacks();

        if(pickedObject != null){
            pickedObject.mesh.material = new THREE.MeshStandardMaterial( {color:pickedObject.team.color} ) ;
        }
        entity.move([coordX,coordY]);
        activeTeam = activeTeam == team1 ? team2 : team1;
        /*
        if(activeTeam == team1){
            camera.position.set(-300,150,0);
        }else{
            camera.position.set(300,150,0);
        }
        */
        if(entity.team.members.length == 1){
            entity.team.counter -= 1;
            if(entity.team.counter == 0){
                window.setTimeout(function a(){
                    alert("Game Over! (by sudden death)");
                },100);
            }
        }

       
    }else{
        console.log("Invalid");
        return false;
    }   
    return true;
}
var posMoves = [];
var posAttacks = [];

window.addEventListener('mousedown', function(event){

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    // get the list of objects the ray intersected
    var intersectedObjects = raycaster.intersectObjects(scene.children,true);
    //ring radii: 31.45,99.35,150
    if(intersectedObjects.length != 0){
        if(intersectedObjects[0].object == cylinder){
            console.log('cylinder');
            //if hits dejarik, return
            var x = intersectedObjects[0].point.x;
            var y = intersectedObjects[0].point.y;
            var z = intersectedObjects[0].point.z;
            if(isInCircle(40,z,x)){
                return;
            }
            //check which orbit
            if(isInCircle(125,z,x)){
                mouse_x = 0;
            }else {
                mouse_x = 1;
            }
            //check angle (angles are clockwise)
            var r = Math.sqrt(Math.pow(x,2)+Math.pow(z,2));
            //  sin(angle)
            // r^2 = x^2 + y^2
            var angle = toDegrees(Math.asin(z/r));
            if(z > 0 && x > 0){
            }else if(z < 0 && x > 0){
                angle = 90*3 + (90 + angle);
            }else if(z < 0 && x < 0){
                angle = 180 + Math.abs(angle);
            }else{
                angle = 90 + (90 - angle);
            }
            for(var i=0;i<12;i++){
                if(i*30 < angle && angle < 30+i*30){
                    if(i == 11){
                        mouse_y = 0;
                    }else{
                        mouse_y = i+1;
                    }
                    break;
                }
            }
            if(pickedObject != null){
                
                if(action(mouse_x, mouse_y,pickedObject)){
        

                        clearMoves();
                        console.log(3);
                    clearAttacks();
                    pickedObject.material = new THREE.MeshStandardMaterial( {color:pickedObject.team.color});
                }
                
                
               
            }
        }else{ 
            clearAttacks();
            clearMoves();
           
            if(pickedObject != null){
                pickedObject.material = pickedObjectMaterial;
                    
                   
              
             
            }
            var x = intersectedObjects[0].point.x;
            var y = intersectedObjects[0].point.y;
            var z = intersectedObjects[0].point.z;
            if(isInCircle(40,z,x)){
                return;
            }
            //check which orbit
            if(isInCircle(125,z,x)){
                entity_orbit = 0;
            }else {
                entity_orbit = 1;
            }
            //angles are clockwise
            //check angle 
            var r = Math.sqrt(Math.pow(x,2)+Math.pow(z,2));
            //  sin(angle)
            // r^2 = x^2 + y^2
            var angle = toDegrees(Math.asin(z/r));
            //q1
            if(z > 0 && x > 0){
            }else if(z < 0 && x > 0){
                //q2
                angle = 90*3 + (90 + angle);
            }else if(z < 0 && x < 0){
                //q3
                angle = 180 + Math.abs(angle);
            }else{
                //q4
                angle = 90 + (90 - angle);
            }
            for(var i=0;i<12;i++){
                if(i*30 < angle && angle < 30+i*30){
                    if(i == 11){
                        entity_ray = 0;
                    }else{
                        entity_ray = i+1;
                    }
                    break;
                }
            }
            let temp = b.get([entity_orbit,entity_ray]);
            if(temp.team == activeTeam){
                if(pickedObject != null){
                    pickedObject.mesh.material = new THREE.MeshStandardMaterial( {color:pickedObject.team.color} ) ;
                //    clearPiece();
                  
                   
                }
                pickedObject = b.grid[entity_orbit][entity_ray];
               posMoves = drawPosMoves(pickedObject);
                posAttacks = drawPosAttacks(pickedObject);
                pickedObject.mesh.material = new THREE.MeshStandardMaterial( {color:pickedObject.team.colorWhenSelected} ) ;
                //chicken
             //   piece = drawPiece(pickedObject.coords[0],pickedObject.coords[1]);
                
            }else if(pickedObject != null){ 
                action(entity_orbit,entity_ray,pickedObject);
            }
        }  
    }
});


function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
   // stats.update()
}

function render() {
    composer.render(scene, camera)
}
window.setTimeout(function(){
    animate();
    render();
},1000);