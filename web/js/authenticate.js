(function () {
    function authenticate() {
        var base64String = localStorage.getItem('hotelAppBase64String');
        return base64String ? true : false;
    }

    function requestTeamData() {
        // call team api

        // fill the page content with the user's team data
    }

    if (!authenticate()) {
        console.log('User is not authenticated');
        return;
    }

    console.log('User is authenticated and could see the team view content');
}())
