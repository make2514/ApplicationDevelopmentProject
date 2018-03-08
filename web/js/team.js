
(function() {
  var base64String = localStorage.getItem('hotelAppBase64String');
  function authenticate() {
    return base64String ? true : false;
  }
  
  function getUrlQueryParam(key) {
      var params = (new URL(document.location)).searchParams;
      return params.has(key) ? params.get(key) : undefined;
  }
  
  function renderManagerUIElements() {
    var viewContainer = document.getElementsByClassName("container")[0];
    var button = document.createElement("button");
    button.classList.add("button");
    var text = document.createTextNode("Add member");
    var modal = document.getElementById('addMemberModal');
    var addMemberModalButton = document.getElementById('addMemberModalButton');
    button.setAttribute("id", "addMemberButton");
    button.appendChild(text);
    viewContainer.appendChild(button);
    button.addEventListener("click", function(){
        modal.style.display = 'block';
    });
    addMemberModalButton.addEventListener("click", function(e){
        e.preventDefault();
        addMember();
    });
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
  }
  
  function getTeamId() {
      return getUrlQueryParam('team');
  }
  
  function getUserEmail() {
      return document.getElementById('newMemberEmail').value;
  }
  
  function addMember() {
      fetch(
        "/HotelApp/webresources/secured/team/member",
            {
                method: 'post',
                body: hotelApp.utils.getFormUrlencodedString({
                    teamId: getTeamId(),
                    userEmail: getUserEmail()
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
              response.text().then(function (result) {
                console.log(result);
              });
              location.reload();
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
  }
  
  function getTeamMembers() {
        fetch(
        "/HotelApp/webresources/secured/team/" + getUrlQueryParam('team'),
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
                console.log(JSON.parse(text)[0]);
                var teamMembersArray = JSON.parse(text);
                teamMembersArray.forEach(createTeamMemberEl);
                
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
    }
  
  function createTeamMemberEl(member) {
    var viewContainer = document.getElementsByClassName("container")[0];
    var memberEl = document.createElement("div");
    memberEl.classList.add("listItem");
    var t = document.createTextNode(member.firstName + " " + member.lastName);
    memberEl.appendChild(t);
    viewContainer.appendChild(memberEl);
    attachEventListenersToTeamMemberEl(memberEl, member.ID);
  }
  
  function attachEventListenersToTeamMemberEl(el, memberId) {
    el.addEventListener("click", function(){
        location.href = '/HotelApp/task.html?team=' + getUrlQueryParam('team') + '&member=' + memberId;
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
      }).then(getTeamMembers);  
  }
}());