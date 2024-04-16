import ONE_SIGNAL_CONFIG from "../config/notificationconfig.js";
import NotificatiionService from "../service/pushNotificationService.js";

class NotificationController{
    static sendNotification = (req,res,next) =>{
        var message = {
            app_id: ONE_SIGNAL_CONFIG.APP_ID,
            content: {"en":"Test Push Notification"},
            included_segments:["All"],
            content_available: true,
            small_icon:"ic_notification_icon",
            data:{
                PushTitle:"CUSTOM NOTIFICATION",
            }
        }
    
        NotificatiionService.sendNotification(message,(error,results) =>{
           if(error) {
            return next(error);
           }
           return res.status(200).send({
            message: "Success",
            data: results,
           });
        })
    }
    
    static sendNotificationToDevice = (req,res,next) =>{
        var message = {
            app_id: ONE_SIGNAL_CONFIG.APP_ID,
            content: {"en":"Test Push Notification"},
            included_segments:["included_player_ids"],
            include_player_ids: req.body.devices,
            content_available: true,
            small_icon:"ic_notification_icon",
            data:{
                PushTitle:"CUSTOM NOTIFICATION",
            }
        }
    
        NotificatiionService.sendNotification(message,(error,results) =>{
           if(error) {
            return next(error);
           }
           return res.status(200).send({
            message: "Success",
            data: results,
           });
        })
    }
}

export default NotificationController;




