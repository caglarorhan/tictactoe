import {boardConfig, firebaseConfig} from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,onAuthStateChanged   } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const user = auth.currentUser;
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
    } else {
        // User is signed out
        // ...
    }
});


const cE = (eType, eId)=>{let e = document.createElement(eType); e.id=eId; return e;};
const tictactoe = {
    init:async (boardConfig)=>{
        let gameStarter = cE("button",boardConfig.gameStarterTriggerElementId);
        gameStarter.innerHTML = "Start Game";
        document.getElementById(boardConfig.boardContainer).append(gameStarter);
        gameStarter.addEventListener('click',()=>{
            if(document.getElementById(boardConfig.boardId)){return false}
            tictactoe.initBoard(boardConfig)
                .then(board=>{

                })
                .catch(err=>{
                    console.log(`
                There was a problem. Board couldn't be created!
                Reason is: ${err}
                `)
                })
        })

    },
    initBoard: async (boardConfig)=>{
        return new Promise((resolve,reject)=>{
            try{
                let boardArray;
                let boardContainer;
                boardArray = Array(Math.pow(boardConfig.boardSize,2)).fill(null,0);
                let containerWidth=Math.floor(100/boardConfig.boardSize);
                let board = cE('div',boardConfig.boardId);
                console.log('BOARD ID:',boardConfig.boardId);
                console.log('BOARD WIDTH:',boardConfig.boardWidth);
                board.style.cssText=`
                width:${boardConfig.boardWidth}px; 
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;`;
                boardContainer = !boardConfig.boardContainer ?document.body : document.getElementById(boardConfig.boardContainer);

                boardContainer.append(board);
                boardArray.forEach((element,index)=>{
                    board.append(tictactoe.gimmeNewSquare(containerWidth,index))
                });
                tictactoe.boardEventListener(boardConfig)
                    .then(isListened=>{
                        resolve(board)
                    })
                    .catch(err=>{
                        reject(err)
                    })
                }
            catch(err){
                reject(err)
            }


        })
    },
    boardEventListener:async (boardConfig)=>{
        return new Promise((resolve,reject)=>{
            try{
                const signs = document.querySelectorAll(`#${boardConfig.boardId} input`);
                signs.forEach((sign)=>{
                    sign.addEventListener('click',(e)=>{
                        if(e.target.classList.length===0){
                            tictactoe.sendClickedSquare(e.target.id)
                                .then(result=>{
                                e.target.classList.add('X');
                            })
                                .catch(err=>{
                                    console.log(`Error occured:${err}`)
                                })
                        }
                    })
                })
                resolve(true);
            }
            catch(err){
                reject(err);
            }
        })
    },
    gimmeNewSquare:(containerWidth,index)=>{
        const container = cE('div');
        container.style.width = containerWidth-1+'%';
        container.style.height = 200+'px';
        container.style.position= 'relative';

        const square = cE('input');
        square.type = 'checkbox';
        square.id=index;
        square.style.cssText=`
        width: 100%;
        height: 100%;
        -webkit-appearance: initial;
        appearance: initial;
        border: 1px solid #000;
        position: relative;
        background: antiquewhite;
        `;
        container.append(square);
        return container
    },
    createSignUpIn:()=>{
        if(document.getElementById('signOutContainer')){
            document.getElementById('signOutContainer').remove();
        }
        let signUpInContainer = cE('div','signUpInContainer');
        let email=cE('input','email');
        let password = cE('input','password'); password.type='password';
        let signUpInButton = cE('button','signUpInButton');
        signUpInButton.innerText = 'Sign Up/In';
        signUpInContainer.append(email);
        signUpInContainer.append(password);
        signUpInContainer.append(signUpInButton);
        document.getElementById(boardConfig.boardContainer).append(signUpInContainer);
        signUpInButton.addEventListener('click', () => {
            tictactoe.createUserWithEmailAndPassword(auth,email.value, password.value)
        })
    },
    createSignOut:()=>{
        if(document.getElementById('signUpInContainer')){
            document.getElementById('signUpInContainer').remove();
        }
        let signOutContainer = cE('div','signOutContainer');
        let signOutButton = cE('button','signOutButton');
        signOutButton.innerText = 'Sign Out';
        signOutButton.style.cssText=`position:fixed; top:5px; right:5px;`;
        tictactoe.init(boardConfig).then(board=>{
            // board created
        })
        signOutContainer.append(signOutButton);
        document.getElementById(boardConfig.boardContainer).append(signOutContainer);
        signOutButton.addEventListener('click', () => {
            tictactoe.signOut();
        })
    },
    signOut:()=>{
        auth.signOut()
            .then(()=>{
                tictactoe.createSignUpIn();
            })
            .catch(err=>{
                console.log(`Error occured:${err}`)
            })
    },
    createUserWithEmailAndPassword:(auth, email, password)=>{
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                // console.log(userCredential);
                // const user = userCredential.user;
                tictactoe.createSignOut();
            })
            .catch((error) => {
                // const errorCode = error.code;
                // const errorMessage = error.message;
                // // ..
                tictactoe.signInWithEmailAndPassword(auth, email, password)
            });
    },
    signInWithEmailAndPassword:(auth, email, password)=>{
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                // console.log(userCredential);
                // const user = userCredential.user;
                tictactoe.createSignOut();
            })
            .catch((error) => {
                // const errorCode = error.code;
                // const errorMessage = error.message;
                // // ..
            });
    },
}

window.onload = () => {
    tictactoe.createSignUpIn()
}
