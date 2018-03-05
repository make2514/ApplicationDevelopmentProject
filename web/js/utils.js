/* global hotelApp */

hotelApp.utils = (function () {
    
    function getUserInfo(callback) {
        return fetch(
            "http://localhost:8080/HotelApp/webresources/secured/user",
                {
                    headers:
                    {
                        "Authorization": getBase64String(),
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )
            .then(
              function(response) {
                if (response.status !== 200) {
                    hotelApp.utils.logErrorSentFromBackend(response);
                    return false;
                }
                response.text().then(callback);
              }
            );
//            .catch(function(err) {
//              console.log('Fetch Error', err);
//            });
    }
    
    function isAuthenticated() {
        var base64String = localStorage.getItem('hotelAppBase64String');
        return base64String ? true : false;
    }
    
    function getBase64String() {
        return localStorage.getItem('hotelAppBase64String');
    }
    
    function logErrorSentFromBackend(response) {
        console.log(
                'Error sent from backend. Status Code: ' +
                response.status, response);
    }
    
    return {
        isAuthenticated: isAuthenticated,
        getBase64String: getBase64String,
        logErrorSentFromBackend: logErrorSentFromBackend,
        getUserInfo: getUserInfo
    };
}())