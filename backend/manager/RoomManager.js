const GameUtil = require("../util/GameUtil");

const socketEngine = require('socket.io');

module.exports = (server) => {

    const rooms = [];

    const players = [];

    const io = socketEngine(server, {
        cors: {
            origin: 'http://localhost',
        }
    });

 io.on('connection', (socket) => {

     console.log('user has connected');

     socket.on('join', ({roomId, username, isHost}) => {
        console.log('roomId', roomId);
        console.log('pseudo', username);
        console.log('isHost ?', isHost);
        const player = handleNewPlayer(username, socket.id);

        const {room, joined} = handleRoomJoining(roomId, isHost, player);

        if (!joined) {

            socket.emit('connection-failure')

        } else {
            socket.join(room.id);
            socket.emit('connection-success', {room, player});

            // a remplacer par broadcast pour eviter d'envoyer 2 fois les infos à la room ?
            io.to(room.id).emit('room-updated', room);

            if (!isHost) io.to(room.host.socketId).emit('game-config-asked', socket.id);
        }

     });

     socket.on('game-config-sent', ({gameConfiguration, socketId}) => {
         io.to(socketId).emit('game-config-host', gameConfiguration);
     });


     socket.on('game-config-update', ({gameConfiguration, roomId}) => {
         //TODO V2 broadcast
         io.to(roomId).emit('game-config-updated-sent', gameConfiguration);
     })


     socket.on('quiz-generation-asked', async ({gameConfiguration, roomId}) => {

         const room = findRoom(roomId)[0];
         console.log("le quiz pour la room suivante", room);
         console.log("avec la conf suivante", gameConfiguration);
         const quizQuery = GameUtil.generateQuizQuery(gameConfiguration);
         const quiz = await GameUtil.executeQuizQuery(quizQuery);
        console.log('temon quiz');
         // Creation quiz
         room.game.quiz = quiz;
         room.game.quizLength = quiz.length;

         io.to(room.id).emit('quiz-sent', quiz);
     });

     socket.on('quiz-received', (roomId) => {
         const room = findRoom(roomId)[0];
         room.state = 'question' // inGame
         socket.emit('ask-question');
     });

     socket.on('next-question', (roomId) => {
         const room = findRoom(roomId)[0];
         room.state = 'question';
         socket.emit('ask-question')
     });

     socket.on('player-result', ({result, roomId}) => {
         console.log("player-result event catch");
         const {receivedAllAnswers, room} = handlePlayerResult(socket.id, result);

         room.state = 'answer';

         if (receivedAllAnswers) {
             const eventToEmit = getEventToEmit(room);
             io.to(room.id).emit(eventToEmit, room);
         }
     });

     socket.on('game-reinit',(roomId) => {
         const room = findRoom(roomId)[0];
         reinitRoomGame(room)
     })

     socket.on('disconnect', () => {
         console.log('deconnexion');

         const {hasRoomToBeUpdated, hasScoresToBeDisplayed, room} = handlePlayerDisconnect(socket.id);

         if (hasRoomToBeUpdated) io.to(room.id).emit('room-updated', room);

         if (hasScoresToBeDisplayed) {
             const eventToEmit = getEventToEmit(room);
             io.to(room.id).emit(eventToEmit, room);
         }

     })


 })

    const reinitRoomGame = (room) => {
        room.state = 'lobby';
        room.game = {
            quizLength: 0,
            round: 0,
            quiz: [],
            scores: [
                {
                    player: room.host,
                    value: 0,
                    rank: 0,
                    lastAnswer: null,
                }
            ],
            hasAnswered: []
        }
    };

    const getEventToEmit = (room) => {

        if (room.game.quiz.length > 0) {
            return 'display-scores';
        }

        return 'end-game'
    };

     const handleNewPlayer = (username, socketId) => {
        let player = findPlayer(socketId);

         if (player.length === 0) player = createPlayer(username, socketId)

         else player = player[0];

         console.log("le nouveau joueur", player);
         return player;
     };

    const findPlayer = (socketId) => {
        return players.filter(player => player.socketId === socketId)
    };

    const createPlayer = (username, socketId) => {
        const player = {
            username,
            socketId
        };

        players.push(player);
        return player;
    };


    const handleRoomJoining = (roomId, isHost, player) => {
        let joined = false;
        let room = findRoom(roomId);

        if (room.length > 0) {
            room = room[0]
            joined = playerJoinRoom(player, room);
            //return room;

        } else {

            room = null;

            if (isHost) {
                room = createRoom(roomId, player);
                joined = true
            }
        }

        return {room, joined};
    };

    const findRoom = (roomId) => {
         return rooms.filter(room => room.id === roomId)
    };

    const findRoomByPlayer = (player) => {
        let room = null;

        rooms.forEach((activeRoom) => {
            activeRoom.players.forEach((playerInRoom) => {
                if (playerInRoom.socketId === player.socketId) room = activeRoom;
            })
        });

        return room;
    };

    const createRoom = (roomId, host) => {
       const room = {
           id: roomId,
           host,
           state: 'lobby',
           players: [host],
           game: {
               quizLength: 0,
               round: 0,
               quiz: [],
               scores: [
                       {
                           player: host,
                           value: 0,
                           rank: 0,
                           lastAnswer: null,
                       }
               ],
               hasAnswered: []
           }
       };

       rooms.push(room);

       return room;
    };

    const playerJoinRoom = (player, room) => {
        //TODO V2, PERMETTRE DE REJOINDRE EN COURS DE PARTIE
        if (room.players.length > 8 || room.state !== 'lobby') {
            return false
        }

        room.players.push(player);

        room.game.scores.push({
            player: player,
            value: 0,
            rank: 0,
            lastAnswer: null,
        });

        return true;
    };


    const handlePlayerDisconnect = (socketId) => {

        console.log('la socketId du gars a deco', socketId);
        const player = findPlayer(socketId)[0];
        console.log("le player a deco", player);

        if (!player) return {hasRoomToBeUpdated: false, hasScoresToBeDisplayed: false, room: null};

        let room = findRoomByPlayer(player);
        console.log("la room du mec", room);

        if (!room) return {hasRoomToBeUpdated: false, hasScoresToBeDisplayed: false, room: null};

        let hasRoomToBeUpdated = true;
        playerLeaveRoom(player, room);

        const isRoomDeletable = checkIfRoomIsDeletable(room);

        let hasScoresToBeDisplayed = false;

        if (isRoomDeletable)  {
            deleteRoom(room);
            hasRoomToBeUpdated = false;
        } else {

            const hostHasToBeTransferred = checkIfHostHasToBeTransferred(player, room);
            if (hostHasToBeTransferred) room = changeRoomHost(room);

            if (checkIfAllAnswersReceived(room)) hasScoresToBeDisplayed = true
        }

        deletePlayer(player);

        return {hasRoomToBeUpdated, hasScoresToBeDisplayed,room};
    };


    const playerLeaveRoom = (player, room) => {
       let playerIndex = -1;
       let scoreIndex = -1;


        room.game.scores.forEach((lineScore, index) => {
            if (lineScore.player.socketId === player.socketId) scoreIndex = index
        });

        room.game.scores.splice(scoreIndex, 1);

        room.players.forEach((playerInRoom, index) => {
            if (playerInRoom.socketId === player.socketId) playerIndex = index;
        });

        room.players.splice(playerIndex, 1);
    };

    const checkIfRoomIsDeletable = (room) => {
        return room.players.length === 0;
    };

    const deleteRoom = (room) => {
        console.log('on va delete la room');
        let index = -1;

        rooms.forEach((activeRoom, i) => {
            if (activeRoom.id === room.id) index = i;
        });

        rooms.splice(index, 1);

        index = GameUtil.ROOMS_ID.indexOf(room.id);
        GameUtil.ROOMS_ID.splice(index, 1);
    };

    const checkIfHostHasToBeTransferred = (player, room) => {
        return room.host.socketId === player.socketId;
    };

    const changeRoomHost = (room) => {
        room.host = room.players[0];
        return room;
    };

    const deletePlayer = (player) => {
        let index = -1;
        players.forEach((activePlayer, i) => {
            if (activePlayer.socketId === player.socketId) index = i;
        });

        players.splice(index, 1);

        if (player.username.startsWith('Guest#')) {
            const guestId = player.username.split('#')[1];
            const index = GameUtil.GUEST_IDS.indexOf(guestId);
            GameUtil.GUEST_IDS.splice(index, 1);
        }
    };

    const handlePlayerResult = (socketId, result) => {
        const player = findPlayer(socketId)[0];


        if (player) {

            console.log("player handleplayeresult",player);

            const room = findRoomByPlayer(player);
            console.log('roomScores',room.game.scores);
            //let receivedAllAnswers = true;

            room.game.scores.forEach((scoreLine) => {
                if (scoreLine.player.socketId === player.socketId) {
                    scoreLine.value += Number(result);
                    scoreLine.lastAnswer = result;
                }
            });

            room.game.scores = sortScoresRank(room.game.scores);

            room.game.hasAnswered.push(player.socketId);

            const receivedAllAnswers = checkIfAllAnswersReceived(room);

            console.log("tableau des scores", room.game.scores);

            if (receivedAllAnswers) {
                room.game.quiz.shift();
                room.game.hasAnswered = [];
                room.game.round++;
            }

            return {receivedAllAnswers, room};

        } else {
            return {receivedAllAnswers: false, room: null};
        }
    };

    const checkIfAllAnswersReceived = (room) => {
        let receivedAllAnswers = true;

        room.players.forEach((player) => {
            if(!room.game.hasAnswered.includes(player.socketId)) receivedAllAnswers = false
        });

        return receivedAllAnswers;
    };

    const sortScoresRank = (scores) => {

        scores.sort((a, b) => {
            return b.value - a.value
        });

        scores[0].rank = 1;

        for (let i = 1; i < scores.length; i++) {
            scores[i].rank = i+1;

            if (scores[i-1].value === scores[i].value) scores[i].rank = i;

        }

        return scores;
    }

     //TODO Handle socket.on('error')


};