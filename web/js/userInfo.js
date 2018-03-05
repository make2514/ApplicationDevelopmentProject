/* global fetch, hotelApp */

hotelApp.userInfo = function() {
    if (hotelApp.utils.isAuthenticated()) {
      fetch(
          "http://localhost:8080/HotelApp/webresources/secured/user",
              {
                  headers:
                  {
                      "Authorization": hotelApp.utils.getBase64String(),
                      "Content-Type": "application/x-www-form-urlencoded"
                  }
              }
          )
            .then(
              function(response) {
                if (response.status !== 200) {
                    hotelApp.utils.logErrorSentFromBackend(response);
                    return;
                }
                response.text().then(function (text) {
                    console.log(text);
                });
              }
            )
            .catch(function(err) {
              console.log('Fetch Error', err);
            });
    }
};


