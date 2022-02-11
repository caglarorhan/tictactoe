import {boardConfig, firebaseConfig} from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,onAuthStateChanged   } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js"
import { getFirestore, doc, setDoc, updateDoc, arrayUnion} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const user = auth.currentUser;
const db = getFirestore();

// User profile
if (user !== null) {
    // The user object has basic properties such as display name, email, etc.
    const displayName = user.displayName;
    const email = user.email;
    const photoURL = user.photoURL;
    const emailVerified = user.emailVerified;

    // The user's ID, unique to the Firebase project. Do NOT use
    // this value to authenticate with your backend server, if
    // you have one. Use User.getToken() instead.
    const uid = user.uid;
}

// Observing the state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        console.log(user.uid);
        console.log(user.email);
        tictactoe.createSignOut(user);
        // ...
    } else {
        // User is signed out
        // ...
        tictactoe.createSignUpIn();
    }
});

const cE = (eType, eId)=>{let e = document.getElementById(eId)??document.createElement(eType); e.id=eId??eType+'_'+ (Math.random()*Math.random()); return e;};
const tictactoe = {
    init:async (boardConfig, user)=>{
        tictactoe.user = user;
        let newGameSessionSetter = cE('button','newGameSessionSetter');
        let boardSizeInput = cE("input",'board_size'); boardSizeInput.type='number'; boardSizeInput.min=3; boardSizeInput.max=10; boardSizeInput.value=boardConfig.boardSize;
        let boardSizeLabel = cE("label",'board_size_label'); boardSizeLabel.innerText='Board Size:';
        let emoLabel = cE("label",'emo_label'); emoLabel.innerText='Emoji:';
        let isGamePrivateLabel = cE("label",'is_game_private_label'); isGamePrivateLabel.innerText='Is Game Private:';
        let isGamePrivateInput = cE("input",'is_game_private'); isGamePrivateInput.type='checkbox';
        let emoSelect = cE("select",'emo'); boardConfig.emo.forEach(emo=>{
            let option = cE("option",emo); option.value=emo; option.innerText=emo;
            emoSelect.appendChild(option);
        });

        newGameSessionSetter.innerText='Set A New Game';
        newGameSessionSetter.addEventListener('click',()=>{
            let boardSize = boardSizeInput.value;
            let emo = emoSelect.value;
            tictactoe.createNewGameSession(user,boardSize,emo);
        });


        document.getElementById(boardConfig.boardContainer).append(boardSizeLabel);
        document.getElementById(boardConfig.boardContainer).append(boardSizeInput);
        document.getElementById(boardConfig.boardContainer).append(emoLabel);
        document.getElementById(boardConfig.boardContainer).append(emoSelect);
        document.getElementById(boardConfig.boardContainer).append(isGamePrivateLabel);
        document.getElementById(boardConfig.boardContainer).append(isGamePrivateInput);
        document.getElementById(boardConfig.boardContainer).append(newGameSessionSetter);





    },
    initBoard: async (boardConfig)=>{
        return new Promise((resolve,reject)=>{
            try{
                let boardArray;
                let boardContainer;
                let boardSize = document.getElementById('board_size');
                boardArray = Array(Math.pow(boardSize.value,2)).fill(null,0);
                let board = cE('div',boardConfig.boardId);
                console.log('BOARD ID:',boardConfig.boardId);
                console.log('BOARD ONE SQUARE WIDTH:',boardConfig.boardOneSquareWidth);
                console.log(`BOARD WIDTH: ${boardConfig.boardOneSquareWidth*boardSize.value}`)
                board.style.cssText=`
                width:${boardConfig.boardOneSquareWidth*boardSize.value}px; 
                height:${boardConfig.boardOneSquareWidth*boardSize.value}px; 
                display: flex;
                flex-wrap: wrap;`;
                boardContainer = !boardConfig.boardContainer ?document.body : document.getElementById(boardConfig.boardContainer);
                boardContainer.append(board);
                boardArray.forEach((element,index)=>{
                    board.append(tictactoe.gimmeNewSquare(boardConfig.boardOneSquareWidth,index))
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
    putEmoji: (squareId,emoji)=>{
        let theSquare = document.querySelector(`#${boardConfig.boardId} #squareContainer_${squareId}`);
        let emojiContainer = cE('div','emoji_container');
            emojiContainer.style.cssText=`  width:100%;
                                height:100%;
                                position:absolute;
                                font-size:${document.getElementById(squareId).offsetWidth/2}px;
                                left:10%;
                                top:10%;
                                `;

            emojiContainer.innerText = emoji;
            theSquare.append(emojiContainer);
    },
    boardEventListener:async (boardConfig)=>{
        return new Promise((resolve,reject)=>{
            try{
                const signs = document.querySelectorAll(`#${boardConfig.boardId} input`);
                signs.forEach((sign)=>{
                    sign.addEventListener('click',(e)=>{
                        if(e.target.classList.length===0){
                            let moveData = {userId:tictactoe.user.uid,squareId:e.target.id}
                            tictactoe.sendMoveDataToServer(moveData)
                                .then(result=>{
                                    // assume result is true (from server)
                                    // TODO: update local board and localStorage

                                    tictactoe.updateGameDataWithMove(tictactoe.gameSessionId,moveData)
                                        .then(result=>{
                                            resolve(true)
                                        })
                                        .catch(err=>{
                                            reject(err)
                                        })
                                    // TODO: insert users emoji into this square
                                    // TODO: check if any user wins

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
    sendMoveDataToServer: async (moveData)=>{
        return new Promise((resolve,reject)=>{
            const thisGameDoc = doc(db, "game_sessions", tictactoe.gameSessionId);
            updateDoc(thisGameDoc, {
                moves: arrayUnion(moveData)
            }).then(result => {
                resolve(true)
            }).catch(err => {
                reject(err)
            })
        })

    },
    gimmeNewSquare:(boardOneSquareWidth,index)=>{
        const container = cE('div','squareContainer_'+index);
        container.style.width = boardOneSquareWidth+'px';
        container.style.height = boardOneSquareWidth+'px';
        container.style.position= 'relative';

        const square = cE('input',index);
        square.type = 'checkbox';
        square.style.cssText=`
        width: 100%;
        height: 100%;
        -webkit-appearance: initial;
        appearance: initial;
        border: 1px solid #000;
        position: relative;
        background: antiquewhite;
        margin: 0;
        `;
        container.append(square);
        return container
    },
    createSignUpIn:()=>{
        document.getElementById(boardConfig.boardContainer).innerHTML='';
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
    createSignOut:(user)=>{
        document.getElementById(boardConfig.boardContainer).innerHTML='';
        let signOutContainer = cE('div','signOutContainer');
        let signOutButton = cE('button','signOutButton');
        signOutButton.innerText = 'Sign Out';
        signOutButton.style.cssText=`position:fixed; top:5px; right:5px;`;
        tictactoe.init(boardConfig,user).then(board=>{
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
    createNewGameSession:async (user)=>{
        console.log(user);
        console.log(`Creating new game session for ${user.email}`);
        let isGamePrivate= document.getElementById('is_game_private').checked;
        let userEmoji = document.getElementById('emo').value;
        let gameSessionCreationMoment = Date.now();
        let gameSessionId = user.uid+'_'+ gameSessionCreationMoment;
        tictactoe.gameSessionId = gameSessionId;

        let gameData = {
            owner: user.uid,
            set_moment: gameSessionCreationMoment,
            status: 'justSet',
            game_props: {isGamePrivate:isGamePrivate, boardSize:boardConfig.boardSize},
            players: [{userId: user.uid, userEmoji: userEmoji}],
            moves:[]
        };
        // moves {userId: user.uid, squareId: squareId}
        let theGameSet = await setDoc(doc(db, "game_sessions", gameSessionId), gameData)
            await tictactoe.saveGameData(gameSessionId,gameData);
            await tictactoe.startGame(user,gameSessionId);

    },
    startGame:async (user, gameSessionId)=>{
        console.log(`Game is ready to start for ${user.email}`);
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
    saveGameData:async (gameSessionId,gameData)=>{
        console.log(`Game is saving into localStorage...`);
        let gameDataWithGameSessionId = {gameSessionId: gameSessionId, ...gameData};
        let gameDataString = JSON.stringify(gameDataWithGameSessionId);
        localStorage.setItem(gameSessionId,gameDataString);
        //            players: [{userId: user.uid, userEmoji: userEmoji}],
        //             moves:[{userId: user.uid, squareId: squareId}]
    },
    readGameData:async (gameSessionId)=>{
        console.log(`Game is reading from localStorage...`);
        let gameDataString = localStorage.getItem(gameSessionId);
        return JSON.parse(gameDataString);
    },
    updateGameDataWithMove:async (gameSessionId,moveData)=>{
        // moveData {userId: user.uid, squareId: squareId}
        let currentGameData = await tictactoe.readGameData(gameSessionId);
        let updatedGameData = {...currentGameData, moves:[...currentGameData.moves,moveData]};
        await tictactoe.saveGameData(gameSessionId,updatedGameData);
    },
}


