
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
    var button = document.createElement("button");
    var text = document.createTextNode("Add task for this member");
    var modal = document.getElementById('addTaskModal');
    var addTaskModalButton = document.getElementById('addTaskModalButton');
    button.setAttribute("id", "addTaskButton");
    button.appendChild(text);             
    document.body.appendChild(button);
    button.addEventListener("click", function(){
        modal.style.display = 'block';
    });
    addTaskModalButton.addEventListener("click", function(e){
        e.preventDefault();
        addTask();
    });
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
  }
  
  function getNewTaskDescription() {
      return document.getElementById('newTaskDescription').value;
  }
  
  function addTask() {
      fetch(
        "/HotelApp/webresources/secured/team/member/task",
            {
                method: 'post',
                body: hotelApp.utils.getFormUrlencodedString({
                    teamId: getUrlQueryParam('team'),
                    employeeId: getUrlQueryParam('member'),
                    description: getNewTaskDescription()
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
  
  function getTasks() {
        fetch(
        "/HotelApp/webresources/secured/team/" + 
        getUrlQueryParam('team') + '/' +
        getUrlQueryParam('member'),
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
                var tasksArray = JSON.parse(text);
                tasksArray.forEach(createTaskEl);
                
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });
        }
  
  function createTaskEl(task) {
    var p = document.createElement("p");
    var t = document.createTextNode(task.description + " " + task.status);
    p.appendChild(t);
    document.body.appendChild(p);
    attachEventListenersToTeamMemberEl(p, task.ID);
  }
  
  function attachEventListenersToTeamMemberEl(el, taskId) {
//    el.addEventListener("click", function(){
//        location.href = '/HotelApp/task.html?team=' + getUrlQueryParam('team') + '&member=' + memberId;
//    });
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
      }).then(getTasks);
  }
}());