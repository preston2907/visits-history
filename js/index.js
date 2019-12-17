import axios from 'axios';

$(document).ready(function () {
    let config = {
        enableTime: true,
        dateFormat: "d-m-Y H:i",
        locale: "ru"
    };

    $("#start_audit_date").flatpickr(config);
    $("#end_audit_date").flatpickr(config);

})

let final_office_array = [];
let dataArray = [
    {
        "id": "0x56E0452B480123AD",
        "code": "Office_А98000",
        "name": "г. Москва, ул.Пресненский Вал, д.1/2 с2"
    },
    {
        "id": "0x56E045350582610B",
        "code": "Office_059000",
        "name": "г.Москва, Ленинградское ш., д.8,стр.1"
    },
    {
        "id": "0x56E0454441897069",
        "code": "Office_103000",
        "name": "г. Москва, Проезд Стратонавтов, 9"
    },
    {
        "id": "0x56E045604AB82313",
        "code": "Office_П38000",
        "name": "г.Москва, ул. Правобережная, д.1б (ТЦ Капитолий)"
    },
    {
        "id": "0x56E0452B447F6277",
        "code": "Office_А99000",
        "name": "г. Москва, ул. Таганская д.1"
    },
    {
        "id": "0x56E0455144B01166",
        "code": "Office_926000",
        "name": "г.Москва, ул.Хлобыстова, д.26, стр.2"
    },
    {
        "id": "0x56E04527274E5F59",
        "code": "Office_Q38000",
        "name": "г. Москва, Алтуфьевское ш., д. 88а"
    },
    {
        "id": "0x56E045457E85520F",
        "code": "Office_910000",
        "name": "г.Москва, Дмитровское ш., д.24А, стр.1"
    },
    {
        "id": "0x56E0455D699D33F5",
        "code": "Office_А55000",
        "name": "г.Москва, пр-д. Локомотивный, д.2б, стр.1"
    },
    {
        "id": "0x56E0455E7ACB50BE",
        "code": "Office_П15000",
        "name": "г.Москва, ул. Бутырская, д.97, стр.7"
    }
];

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
            console.log(response.data.data);
            buildTable(response.data, $('#table-result'))
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
        typingTimer = setTimeout(() => { searchOffice(search_input.value) }, typingInterval)
    }

}

let chooseOffice = (elem) => {
    tr_elem = elem.parentNode.parentNode;
    if (elem.classList.contains('btn-primary')) {
        elem.classList.remove('btn-primary');
        elem.classList.add('btn-warning');
        elem.firstChild.data = "Отменить";
        let tempObj = {};
        tempObj.id = tr_elem.getAttribute('id');
        tr_childs = Array.from(tr_elem.childNodes).filter((elem)=> {
            return elem.nodeName == 'TD';
        });
        tempObj.code = tr_childs[0].innerText;
        tempObj.name = tr_childs[1].innerText;

        final_office_array.push(tempObj);
    } else {
        elem.classList.remove('btn-warning');
        elem.classList.add('btn-primary');  
        elem.firstChild.data = "Выбрать ";
        final_office_array = final_office_array.filter((elem)=> {
            return elem.id.toString() != tr_elem.getAttribute('id').toString();
        })
    }
    
}



function buildTable(data, elem) {
    

    let rows_array = data.data.map((elem) => {

        return `<tr id="${elem.id}">
                    <td>${elem.code} <br> <button type="button" onclick="chooseOffice(this)" class="btn btn-primary">Выбрать !</button></td>
                    <td>${elem.name}</td>
                    
                </tr>`
    })

    let str = `
    <table class="table">
    <thead>
      <tr>
        <th>Код точки</th>
        <th>Адрес</th>
      </tr>
    </thead>
    <tbody>
      ${rows_array.join('')}
    </tbody>
  </table>`;

    elem.html(`${str}`);

}


