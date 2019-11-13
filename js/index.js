import axios from 'axios';




function searchOffice(name) {
console.log("search fired");

    let config = {
        crossdomain: true,
        withCredentials: true,
        params: {
            search_name: name,
            use_mode: 'search_office'
        },
        onUploadProgress: function (progressEvent) {
            console.log('Отправил запрос');
        },
    };

    axios.get('https://bu-online.beeline.ru/custom_web_template.html?object_id=6758698952191659595', config
    )
        .then(function (response) {
            console.log(response);
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
        });

}



let search_input = document.getElementById('office_search');
let typingTimer;
let typingInterval = 1000;

search_input.onkeyup = function () {
    if (this.value.length >= 5) {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(()=>{searchOffice(search_input.value)}, typingInterval)
    }

}

