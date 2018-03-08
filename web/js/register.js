(function() {
    
    var submitEl = document.getElementById('submit');
    function sendRegisterRequest() {
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        var roleEl = document.getElementById('role');
        var role = roleEl.options[roleEl.selectedIndex].value.toLowerCase();
        var password = document.getElementById('password').value;
        var lastName = document.getElementById('lastName').value;
        var firstName = document.getElementById('firstName').value;
        var base64String = hotelApp.utils.createBase64AuthString(email, password);
        console.log(email, password, base64String, role, firstName, lastName);
        
        fetch(
        "/HotelApp/webresources/register",
            {
                method: 'post',
                body: hotelApp.utils.getFormUrlencodedString({
                    firstName: firstName,
                    lastName: lastName,
                    role: role
                }),
                headers:
                {
                    "Authorization": base64String,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        )
          .then(
            function(response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status, response);
                  response.text().then(function (text) {
                    console.log(text);
                  });
                  return;
              }
              response.text().then(function (text) {
                console.log(text);
                if (text === 'false') {
                    window.window.alert('User is already registered');
                    return;
                } 
                if (localStorage.getItem('hotelAppBase64String', base64String)) {
                    localStorage.removeItem('hotelAppBase64String');
                }
                localStorage.setItem('hotelAppBase64String', base64String);
                    window.location = "/HotelApp/teams.html";
                  });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
        return 'register';
    }

    submitEl.addEventListener('click', function (e) {
        sendRegisterRequest();
        e.preventDefault();
    }, false);
}())