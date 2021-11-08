const tictactoe = {
    init:async (boardConfig)=>{
        document.getElementById(boardConfig.gameStarterTriggerElementId).addEventListener('click',()=>{
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
                let board = document.createElement('div');
                board.id=boardConfig.boardId;
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
    sendClickedSquare: async (squareId)=>{
        let opponentResponse=  fetch('tictactoe.caglarorhan.com',{
            method: 'POST',
            headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
            body: 'signedSquareId='+squareId
        });
        return await opponentResponse.json();
    },
    boardCacheCreate: (boardConfig)=>{
        return new Promise((resolve,reject)=>{})
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
        const container = document.createElement('div');
        container.style.width = containerWidth-1+'%';
        container.style.height = 200+'px';
        container.style.position= 'relative';

        const square = document.createElement('input');
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
    whoseTurn:()=>{}
}
