const { getCompEventByIdQuery } = require("../repository/TableCompetitionEvent");
const { generateEventId } = require("../utilities");
const { cloneCommentaryService } = require("./commentry");

const saveEventervice = async (request ,fastify)=>{
  // get event by competition id
  let comp = global.tblCompetitions.find((item) => item.competitionId == request.body.competitionId);
  if(!comp){
    throw new Error("No Competition Found with this Id")
  }
  const compEvent = await getCompEventByIdQuery(request , fastify);
  console.log("compEvent", compEvent);
  if(!compEvent){
    throw new Error("No Event Found for this competition")
  }
  // now clone this event and store in db
  if(!request.body.eventRefId){
    let id = generateEventId();
    request.body.eventRefId = id;
  }
  request.body = {
    ...request.body,
    commentaryId : compEvent.commentaryId,
  }
  let com = await cloneCommentaryService(request,fastify)

  return {
    commentaryId : com.commentaryId,
    eventRefId : com.eventRefId,
    eventName : com.eventName,
    eventDate : com.eventDate,
  };
}
module.exports = {
    saveEventervice
}