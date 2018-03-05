(function() {
  /* 
   * 1. Check if user is manager or member
   * 2. render UI accordingly
   * 
   * */
    
  var base64String = localStorage.getItem('hotelAppBase64String');
  function authenticate() {
    return base64String ? true : false;
  }
  
  function renderManagerUIElements() {
    var button = document.createElement("button");
    var text = document.createTextNode("Create team");
    var modal = document.getElementById('addNewTeamModal');
    var modalAddNewTeamButton = document.getElementById('modalAddNewTeamButton');
    button.setAttribute("id", "addNewTeamButton");
    button.appendChild(text);             
    document.body.appendChild(button);
    button.addEventListener("click", function(){
        modal.style.display = 'block';
    });
    modalAddNewTeamButton.addEventListener("click", function(e){
        e.preventDefault();
        addNewTeam();
    });
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
  }
  
  function getTeams() {
        fetch(
        "http://localhost:8080/HotelApp/webresources/secured/team",
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
                var res = text.split(",");
                res.forEach(createTeamEl);
                
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
    }
    
  function getNewTeamName() {
      var input = document.getElementById('newTeamName');
      return input.value;
  }
  
  function getUserId() {
      return window.hotelApp.userInfo.ID;
  }
  
  function getFormUrlencodedString(formBodyObj) {
      return Object.keys(formBodyObj).map(
              function(key) { return key + '=' + formBodyObj[key]}
              ).join("&");
  }
  
  function addNewTeam() {
        var newTeamName = getNewTeamName();
        fetch(
        "http://localhost:8080/HotelApp/webresources/secured/team/add",
            {
                method: 'post',
                body: getFormUrlencodedString({
                    teamName: getNewTeamName(),
                    userId: getUserId()
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
              location.href = '/HotelApp/team.html?team=' + newTeamName;
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
  }
  
  function createTeamEl(team) {
    var p = document.createElement("p");
    var t = document.createTextNode(team);      
    p.appendChild(t);                             
    document.body.appendChild(p);
    attachEventListenersToTeamEl(p);
  }
  
  function attachEventListenersToTeamEl(el) {
    el.addEventListener("click", function(){
        location.href = '/HotelApp/team.html?team=' + el.textContent;
    });
  }
  
  if (authenticate()) {
      hotelApp.utils.getUserInfo(function(JSONString) {
          if (JSONString) {
              window.hotelApp.userInfo = JSON.parse(JSONString);
              if (window.hotelApp.userInfo.role === "manager") {
                  renderManagerUIElements();
                  return;
              }
          }
      });
      getTeams();
  }
}());