const { updateNotificationQuery, deleteNotificationQuery, insertNotificationQuery } = require("../repository/TableNotification");
const { sendNotification } = require("../utilities");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { generateImageName, storeImageOnServer, removeImage, removeImageFromServer } = require("../utilities/Images");

const getAllNotificationService = async(request) =>{
    let result = global.tblNotifications;
    return result || [];
}
const getEventListService = async(request) =>{
    let result = global.tblCommentaries.map((item)=>{
        return {
            commentaryId : item.commentaryId,
            eventDate : item.eventDate,
            eventName : item.eventName
        }
    });
    return result || [];
}
const getNotificationByIdService = async(request) =>{
    let result = global.tblNotifications.find(
        (item)=> item.notificationId == request.body.notificationId
    )
    return result || null;
}
const saveNotificationService = async(request,fastify) =>{
    const {notificationId , isSendNow} = request.body;
    let result;
    if(notificationId == 0){
        result = await createNotificationService(request,fastify);
    }
    else {
        result = await updateNotificationService(request,fastify);
    }
    if(isSendNow){
        //send notification
        sendNotification(result , request,fastify);
    }   
    return result;
    
}
const createNotificationService = async(request,fastify)=>{
    // validate commentaryId
    const {commentaryId , image , icon , title} = request.body;
    if(commentaryId){
        let index = global.tblCommentaries.findIndex((item)=>item.commentaryId == commentaryId);
        if(index == -1){
            throw new Error("Commmentary with this id not found.")
        }
    }
    // store image
    let projectName =global.tblConfigs.find(
        (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
      ).value;
    let name = generateImageName({
        name : title
    })
    let imgUrl , iconUrl;

    if(image && image.length){ 
        imgUrl = await storeImageOnServer({
            image : image[0],
            project : projectName,
            name : `${name}-${new Date().getTime()}`,
            ...ImgModuleConfig.Notification
        })
        request.body.image = imgUrl;
    }
    if(request.body.icon && request.body.icon.length){
        iconUrl = await storeImageOnServer({
            image : icon[0],
            project : projectName,
            name : `${name}-icon-${new Date().getTime()}`,
            ...ImgModuleConfig.Notification
        })
        request.body.icon = iconUrl;
    }

    let data = await insertNotificationQuery({
        ...request.body,
        userId:request.userTokenInfo.WrUserId
    },request,fastify);

    global.tblNotifications.push(data[0]);

    return data[0];


}
const updateNotificationService =  async (request,fastify)=>{
    const {notificationId ,title, commentaryId , image , icon} = request.body;
    if(commentaryId){
        let cIndex = global.tblCommentaries.findIndex((item)=>item.commentaryId == commentaryId);
        if(cIndex == -1){
            throw new Error("Commentary with this id not found.")
        }
    }
    let index = global.tblNotifications.findIndex(
        (item)=> item.notificationId == notificationId
    );
    if(index == -1){
        throw new Error("Notification with this id not found");
    }
    // remove old image and store new 
    let imgName, projectName;
    projectName = global.tblConfigs.find(
      (item) => item.key.toLowerCase() === PROJECT_NAME.toLowerCase()
    ).value;
    imgName = generateImageName({
        name :title
    })
    if(image && image.length){
        removeImageFromServer({
            path : global.tblNotifications[index].image
        })
        let path = await storeImageOnServer({
            image : image[0],
            project : projectName,
            name : `${imgName}-${new Date().getTime()}`,
            ...ImgModuleConfig.Notification
        })
        request.body.image = path
    }
    if(icon && icon.length){
        removeImageFromServer({
            path : global.tblNotifications[index].icon
        })
        let path = await storeImageOnServer({
            image : icon[0],
           project : projectName,
           name : `${imgName}-icon-${new Date().getTime()}`,
           ...ImgModuleConfig.Notification
        })
        request.body.icon = path
    }
    
    let data = await updateNotificationQuery({
        ...request.body,
        userId:request.userTokenInfo.WrUserId
    },request,fastify);

    global.tblNotifications[index] = data[0];
    return data[0];

}
const deleteNotificationService = async(request,fastify)=>{
    const {notificationId} = request.body;
    await deleteNotificationQuery(request,fastify);
    for(let not of request.body.notificationId){
        let index = global.tblNotifications.findIndex(
            (item)=> item.notificationId == not
        )
        if(index != -1){
            removeImageFromServer({
                path : global.tblNotifications[index].image
            })
            removeImageFromServer({
                path : global.tblNotifications[index].icon
            })
        }
    }
    global.tblNotifications = global.tblNotifications.filter(
        (item)=> !notificationId.includes(item.notificationId)
    );

    return "Notification(s) deleted successfully";
}

module.exports = {
    getAllNotificationService,
    getNotificationByIdService,
    saveNotificationService,
    deleteNotificationService,
    getEventListService
}