const { updateNotificationQuery, deleteNotificationQuery, insertNotificationQuery } = require("../repository/TableNotification");
const { sendNotificationByType } = require("../utilities");
const { PROJECT_NAME } = require("../utilities/configConstants");
const { ImgModuleConfig } = require("../utilities/imageConstant");
const { generateImageName, storeImageOnServer, removeImage, removeImageFromServer } = require("../utilities/Images");

const getAllNotificationService = async(request) => {
    const { startDate, endDate, commentaryId, sendType } = request.body;
    let result = global.tblNotifications || [];
    if (startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        result = result.filter(item => {
            const createdAt = new Date(item.createdAt).getTime();
            return createdAt >= start && createdAt <= end;
        });
    }
    if (commentaryId) {
        result = result.filter(item => item.commentaryId == commentaryId);
    }
    if (sendType) {
        result = result.filter(item => item.sendType == sendType);
    }
    return result;
};
const getEventListService = async(request) =>{
    let result = global.tblCommentaries.map((item)=>{
        return {
            commentaryId : item.commentaryId,
            eventDate : item.eventDate,
            eventName : item.eventName,
            eventRefId : item.eventRefId
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
    const {notificationId , isSend} = request.body;
    let result;
    
    if(notificationId == 0){
        result = await createNotificationService(request,fastify);
    }
    else {
        result = await updateNotificationService(request,fastify);
    }
    if(isSend){
        //send notification
        sendNotificationByType(result , request,fastify);
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
        const { fullPath, imagePath } = await storeImageOnServer({
            image : image[0],
            project : projectName,
            name : `${name}-${new Date().getTime()}`,
            ...ImgModuleConfig.Notification
        })
        request.body.image = fullPath;
        request.body.imagePath = imagePath;
    }
    if(request.body.icon && request.body.icon.length){
        const { fullPath, imagePath } = await storeImageOnServer({
            image : icon[0],
            project : projectName,
            name : `${name}-icon-${new Date().getTime()}`,
            ...ImgModuleConfig.Notification
        })
        request.body.icon = fullPath;
        request.body.iconPath = imagePath;
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
    console.log(typeof(request.body.isSend))
    const isSend = request.body.isSend == "true" ? true : false;
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
    // console.log(isSend)
    if(global.tblNotifications[index].isSend == true && isSend == false){
        throw new Error("Notification already sent, you can't update it now.");
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
        if(global.tblNotifications[index].image){
            removeImageFromServer({
                path : global.tblNotifications[index].image
            })
        }
        const { fullPath, imagePath } = await storeImageOnServer({
            image : image[0],
            project : projectName,
            name : `${imgName}-${new Date().getTime()}`,
            ...ImgModuleConfig.Notification
        })
        request.body.image = fullPath
        request.body.imagePath = imagePath
    }
    if(icon && icon.length){
        if(global.tblNotifications[index].icon){
            removeImageFromServer({
                path : global.tblNotifications[index].icon
            })
        }
        const { fullPath, imagePath } = await storeImageOnServer({
            image : icon[0],
           project : projectName,
           name : `${imgName}-icon-${new Date().getTime()}`,
           ...ImgModuleConfig.Notification
        })
        request.body.icon = fullPath
        request.body.iconPath = imagePath
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
            if(global.tblNotifications[index].image){
                removeImageFromServer({
                    path : global.tblNotifications[index].image
                })
            }
            if(global.tblNotifications[index].icon){
                removeImageFromServer({
                    path : global.tblNotifications[index].icon
                })
            }
        }
    }
    global.tblNotifications = global.tblNotifications.filter(
        (item)=> !notificationId.includes(item.notificationId)
    );

    return "Notification(s) deleted successfully";
}
const sendNotService = async(request,fastify)=>{
    const {notificationId} = request.body;
    let index = global.tblNotifications.findIndex(
        (item)=> item.notificationId == notificationId
    )
    if(index == -1){
        throw new Error("Notification with this id not found");
    }
    if(!global.tblNotifications[index].isSend){
        await updateIsSendNotQuery({
            notificationId,
            isSend : true
        },request,fastify);
        global.tblNotifications[index].isSend = true;
    }   
    await sendNotificationByType(global.tblNotifications[index],request,fastify);
    return "Notification sent successfully";
}   
module.exports = {
    getAllNotificationService,
    getNotificationByIdService,
    saveNotificationService,
    deleteNotificationService,
    getEventListService,
    sendNotService
}