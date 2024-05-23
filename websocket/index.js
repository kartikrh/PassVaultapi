// const WebsocketConnection = async function (fastify, ws, opts) {
//   try {
//     // const wss = new WebSocket.Server({ server: fastify.server });
//     console.log("WebSocket Server initialized");
//     wss.on("connection", function connection(ws) {
//       console.log("New client connected");

//       ws.on("message", function incoming(message) {
//         //console.log("received: %s", message);

//         var jsonObject = JSON.parse(message);

//         // Check the event type
//         if (jsonObject.event === "subScribetShortScore") {
//           var data = jsonObject.data;
//           var ids = data.split(",");

//           let Shortcommentry = [];
//           ids.forEach(function (id) {
//             let data = setShortCommenrty(id.trim());
//             Shortcommentry.push(data);
//           });
//           let res = {};
//           res.eventname = jsonObject.event;
//           res.connectionID = jsonObject.connectionID;
//           const jsonString = JSON.stringify(Shortcommentry);
//           res.data = jsonString;
//           ws.send(JSON.stringify(res));
//         }
//       });
//       ws.on("close", function close() {
//         console.log("Client disconnected");
//       });
//     });

//     //return wss;
//     global.wss = wss;
//   } catch (error) {
//     console.log("error in WebsocketConnection:", error);
//   }
// };

const WebsocketConnection = function (fastify, ws, req) {
  console.log("WebSocket connection established");

  ws.on("message", function incoming(message) {
    try {
      // console.log("received: %s", message);

      // Attempt to parse the JSON message
      const jsonObject = JSON.parse(message);

      // Check the event type
      if (jsonObject.event === "subScribetShortScore") {
        const data = jsonObject.data;
        const ids = data.split(",");

        let Shortcommentry = [];
        ids.forEach(function (id) {
          let data = setShortCommenrty(id.trim());
          Shortcommentry.push(data);
        });
        let res = {};
        res.eventname = jsonObject.event;
        res.connectionID = jsonObject.connectionID;
        const jsonString = JSON.stringify(Shortcommentry);
        res.data = jsonString;
        ws.send(JSON.stringify(res));
      }
    } catch (error) {
      // Log the error message and continue
      console.error("Error parsing message:", error.message);
    }
  });
  
  ws.on("close", function close() {
    console.log("Client disconnected");
  });
};

module.exports = {
  WebsocketConnection
};

const setShortCommenrty = (eventId) => {
  const commentary = global.tblCommentaries.find(
    (item) => item.eventRefId === eventId
  );

  if (!commentary) {
    // throw new Error("Commentary with this id not Found");
    console.error("Commentary with this id not Found");
    return null;
  }

  const commentaryTeamsOne = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team1Id &&
      item.currentInnings === commentary.currentInnings
  );

  const commentaryTeamsTwo = global.tblCommentaryTeams.find(
    (item) =>
      item.commentaryId === commentary.commentaryId &&
      item.teamId === commentary.team2Id &&
      item.currentInnings === commentary.currentInnings
  );

  let teamScore1, teamScore2, t1sn, t1n, t2sn, t2n;
  if (commentaryTeamsOne) {
    t1sn = commentaryTeamsTwo.shortName;
    t1n = commentaryTeamsTwo.teamName;
    const wicket1 =
      commentaryTeamsOne.teamWicket === null
        ? 0
        : commentaryTeamsOne.teamWicket;
    const overs1 =
      commentaryTeamsOne.teamOver === null ? 0.0 : commentaryTeamsOne.teamOver;
    teamScore1 = commentaryTeamsOne?.teamScore ?? 0;
    teamScore1 = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
  }

  if (commentaryTeamsTwo) {
    t2sn = commentaryTeamsTwo.shortName;
    t2n = commentaryTeamsTwo.teamName;
    const wicket1 =
      commentaryTeamsTwo.teamWicket === null
        ? 0
        : commentaryTeamsTwo.teamWicket;
    const overs1 =
      commentaryTeamsTwo.teamOver === null ? 0.0 : commentaryTeamsTwo.teamOver;
    teamScore2 = commentaryTeamsTwo?.teamScore ?? 0;
    teamScore2 = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }
  let es = {
    eti: parseInt(commentary.eventTypeId) || "",
    eid: commentary.eventRefId || "",
    en: commentary.eventName || "",
    te1n: t1n || "",
    te2n: t2n || "",
    t1s: teamScore1 || "",
    t2s: teamScore2 || "",
    pt: 0,
    t1set: null,
    t2set: null,
    t1p: null,
    t2p: null,
  };
  return es;
};

module.exports = WebsocketConnection;
