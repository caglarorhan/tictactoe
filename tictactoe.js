const tictactoe = {
    init:async (boardConfig)=>{
        tictactoe.initBoard(boardConfig)
            .then(board=>{

        })
            .catch(err=>{
                console.log(`
                There was a problem. Board couldn't be created!
                Reason is: ${err}
                `)
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
                resolve(board)}
            catch(err){
                reject(err)
            }


        })
    },
    boardEventListener:(boardConfig)=>{
        const signs = document.querySelectorAll(`#${boardConfig.boardId} input`);
        signs.forEach((sign)=>{
            sign.addEventListener('click',(e)=>{
                if(e.target.classList.length===0){
                    e.target.classList.add('X');
                }
            })
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
