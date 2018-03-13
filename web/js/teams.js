(function () {
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
        var viewContainer = document.getElementsByClassName("container")[0];
        var button = document.createElement("button");
        button.classList.add("button");
        var text = document.createTextNode("Create team");
        var modal = document.getElementById('addNewTeamModal');
        var modalAddNewTeamButton = document.getElementById('modalAddNewTeamButton');
        button.setAttribute("id", "addNewTeamButton");
        button.appendChild(text);
        viewContainer.appendChild(button);
        button.addEventListener("click", function () {
            modal.style.display = 'block';
        });
        modalAddNewTeamButton.addEventListener("click", function (e) {
            e.preventDefault();
            addNewTeam();
        });
        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    function getTeams() {
        fetch(
                "/HotelApp/webresources/secured/team", {
                    headers: {
                        "Authorization": base64String,
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )
            .then(
                function (response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status, response);
                        response.text().then(function (text) {
                            console.log(text);
                        });
                        return;
                    }
                    response.text().then(function (teamListArrayString) {
                        JSON.parse(teamListArrayString).forEach(createTeamEl);
                    });
                }
            )
            .catch(function (err) {
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
            function (key) {
                return key + '=' + formBodyObj[key]
            }
        ).join("&");
    }

    function addNewTeam() {
        fetch(
                "/HotelApp/webresources/secured/team/", {
                    method: 'post',
                    body: getFormUrlencodedString({
                        teamName: getNewTeamName(),
                        userId: getUserId()
                    }),
                    headers: {
                        "Authorization": base64String,
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )
            .then(
                function (response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status, response);
                        response.text().then(function (text) {
                            console.log(text);
                        });
                        return;
                    }
                    response.text().then(function (teamId) {
                        location.href = '/HotelApp/team.html?team=' + teamId;
                    });

                }
            )
            .catch(function (err) {
                console.log('Fetch Error :-S', err);
            });
    }

    function createTeamEl(team) {
        var viewContainer = document.getElementsByClassName("container")[0];
        var teamEl = document.createElement("div");
        teamEl.classList.add("listItem");
        var t = document.createTextNode(team.name);
        teamEl.appendChild(t);
        viewContainer.appendChild(teamEl);
        if (window.hotelApp.userInfo.role === "manager") {
            // add delete button
            var deleteButton = document.createElement("button");
            var deleteX = document.createTextNode("x");
            deleteButton.appendChild(deleteX);
            deleteButton.classList.add("delete");
            teamEl.appendChild(deleteButton);
        }
        attachEventListenersToTeamEl(teamEl, deleteButton, team.id);
    }

    function attachEventListenersToTeamEl(el, deleteButton, teamId) {
        el.addEventListener("click", function () {
            location.href = '/HotelApp/team.html?team=' + teamId;
        });
        if (deleteButton) {
            deleteButton.addEventListener("click", function (e) {
                deleteTeam(teamId);
                e.preventDefault();
                e.stopPropagation();
            });
        }
    }

    function deleteTeam(teamId) {
        fetch(
                "/HotelApp/webresources/secured/team/" + teamId, {
                    method: 'delete',
                    headers: {
                        "Authorization": base64String,
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )
            .then(
                function (response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status, response);
                        response.text().then(function (text) {
                            console.log(text);
                        });
                        return;
                    }
                    response.text().then(function () {
                        location.reload();
                    });

                }
            )
            .catch(function (err) {
                console.log('Fetch Error: ', err);
            });
    }

    if (authenticate()) {
        hotelApp.utils.getUserInfo(function (JSONString) {
            if (JSONString) {
                window.hotelApp.userInfo = JSON.parse(JSONString);
                if (window.hotelApp.userInfo.role === "manager") {
                    renderManagerUIElements();
                    return;
                }
            }
        }).then(getTeams);
    }
}());