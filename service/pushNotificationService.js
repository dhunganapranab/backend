import ONE_SIGNAL_CONFIG from "../config/notificationconfig.js";
import https from 'https';

class NotificatiionService{
    static sendNotification = async(data,callback) =>{
        var headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic "+ONE_SIGNAL_CONFIG.API_KEY,
        };
        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers,
        };

        var req = https.request(options, function(res){
            res.on('data', function(data){
                console.log(JSON.parse(data));

            return callback(null, JSON.parse(data));
            })
        })

        req.write(JSON.stringify(data));
        req.end();
    }
}
export default NotificatiionService;