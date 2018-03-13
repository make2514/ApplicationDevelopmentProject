
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
    var text = document.createTextNode("Add task for this member");
    var modal = document.getElementById('addTaskModal');
    var addTaskModalButton = document.getElementById('addTaskModalButton');
    button.setAttribute("id", "addTaskButton");
    button.appendChild(text);             
    viewContainer.appendChild(button);
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
  
  function deleteTask(taskId) {
      fetch(
        "/HotelApp/webresources/secured/team/member/task/" + taskId,
            {
                method: 'delete',
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
    var viewContainer = document.getElementsByClassName("container")[0];
    var taskEl = document.createElement("div");
    taskEl.classList.add("listItem");
    var t = document.createTextNode(task.description);
    taskEl.appendChild(t);
    viewContainer.appendChild(taskEl);
    if (window.hotelApp.userInfo.role === "manager") {
        // add delete button
        var deleteButton = document.createElement("button");
        var deleteX = document.createTextNode("x");
        deleteButton.appendChild(deleteX);
        deleteButton.classList.add("delete");
        taskEl.appendChild(deleteButton);
    }
    
    attachEventListenersToTeamMemberEl(taskEl, deleteButton, task.id);
  }
  
  function getTaskStatus(statusNum) {
      if (statusNum === "0")
          return "To-do";
      else if (statusNum === "1")
          return "Doing";
      else {
          return "Done";
      }
  }
  
  function attachEventListenersToTeamMemberEl(el, deleteButton, taskId) {
    if (deleteButton) {
      deleteButton.addEventListener("click", function(e){
          deleteTask(taskId);
          e.preventDefault();
          e.stopPropagation();
      });
    }
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