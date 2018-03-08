// TODO: Fix server err when the base64String is corrupted, for example:
// when Basic is changed to Basic1
(function() {
  var emailEl = document.getElementById('email');
  var passwordEl = document.getElementById('password');
  var submitEl = document.getElementById('submit');
  submitEl.addEventListener('click', function(event) {
      event.preventDefault();
      login(emailEl.value, passwordEl.value);
  }, false);
  console.log(emailEl, passwordEl);
  
  function login(email, password) {
    var base64String = "Basic " + window.btoa(email + ':' + password);
    fetch(
    "/HotelApp/webresources/secured/login",
        {
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
            localStorage.setItem('hotelAppBase64String', base64String);
            window.location = "/HotelApp/teams.html";
          });
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
    }
}())