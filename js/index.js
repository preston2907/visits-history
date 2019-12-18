import axios from 'axios';
import $ from 'jquery';
import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js"
import 'flatpickr/dist/flatpickr.min.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/index.css'

$(document).ready(function () {
    let config = {
        enableTime: true,
        dateFormat: "d-m-Y H:i",
        locale: Russian
    };

    flatpickr("#start_audit_date", config);
    flatpickr("#end_audit_date", config);
    $("#saver_choice_button").on('click', showChoice);
    $("#saver").on('click', saveReport);

    
})

let final_office_array = [];


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
            buildTable(response.data.data, $('#table-result'), true);
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
    let tr_elem = elem.parentNode.parentNode;
    if (elem.classList.contains('btn-primary')) {
        elem.classList.remove('btn-primary');
        elem.classList.add('btn-warning');
        elem.firstChild.data = "Отменить";
        let tempObj = {};
        tempObj.id = tr_elem.getAttribute('id');
        let tr_childs = Array.from(tr_elem.childNodes).filter((elem) => {
            return elem.nodeName == 'TD';
        });
        tempObj.code = tr_childs[0].firstChild.data;
        tempObj.name = tr_childs[1].innerText;

        final_office_array.push(tempObj);
    } else {
        elem.classList.remove('btn-warning');
        elem.classList.add('btn-primary');
        elem.firstChild.data = "Выбрать ";
        final_office_array = final_office_array.filter((elem) => {
            return elem.id.toString() != tr_elem.getAttribute('id').toString();
        })
    }

}



function buildTable(data, elem, isSearch) {


    let rows_array = data.map((elem) => {

        if (isSearch === true) {

            return `<tr id="${elem.id}">
            <td>${elem.code}<br><button type="button" class="btn btn-primary chooser" >Выбрать</button></td>
            <td>${elem.name}</td>
            
            </tr>`
        } else {
            return `<tr id="${elem.id}">
            <td>${elem.code} <br> <button type="button" class="btn btn-danger remover" >Удалить</button></td>
            <td>${elem.name}</td>
            
            </tr>`
        }
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

    let allbuttons = document.querySelectorAll('.chooser');

    allbuttons.forEach((elem) => {
        elem.addEventListener("click", () => chooseOffice(elem));
    })

}

function showChoice() {
    let rows_array = final_office_array.map((elem) => {
        return `
        <div class="form-group form-inline " del-id="${elem.id}">
            <div class="col-sm-4 "> 
                <label class="justify-content-start" >Точка: <b style="margin-left:15px;">${elem.code}</b></label>
                <label class="justify-content-start" ><span><b>${elem.name}</b></span></label>
            </div>
            <textarea class="form-control col-sm-5" name="" id="" rows="3" data-id="${elem.id}" placeholder="Введи текст комментария к посещению"></textarea>
            <div class="col-sm-3 justify-content-center">
            <button type="button" class="btn btn-danger remover">Удалить</button>

          </div>
        </div>
        `
    });

    if (rows_array.length > 0) {

        let str = `
        <h4  class="card-title">Выбраны офисы:</h4>
        ${rows_array.join('')}
        `
        $('.choosed_officess').html(`${str}`);
        if ($(".modal-backdrop").length > -1) {
            $(".modal-backdrop").not(':first').remove();
        }
        $('#choose_office').modal('toggle');


        $('#office_count').val(final_office_array.length)

        let allbuttons = document.querySelectorAll('.remover');

        allbuttons.forEach((elem) => {
            elem.addEventListener("click", () => removeOffice(elem));
        })
    } else {
        alert('Выберите хотя бы один офис!')
    }




}

function removeOffice(elem) {

         let tr_elem = elem.parentNode.parentNode;
        final_office_array = final_office_array.filter((elem) => {
            return elem.id.toString() != tr_elem.getAttribute('del-id').toString();
        })
    
        
        $('#office_count').val(final_office_array.length)
        tr_elem.parentNode.removeChild(tr_elem);
        
        if (final_office_array.length === 0 ) {
            $('.choosed_officess').html('');
        } 
    
}


function saveReport() {

    let final_arr = final_office_array.map((elem)=> {
        return {
            id: elem.id,
            comment: document.querySelector(`textarea[data-id="${elem.id}"]`).value
        }
    })
    console.log(final_arr);

    $.ajax({
        url: 'https://bu-online.beeline.ru/custom_web_template.html?object_id=6758698952191659595&use_mode=save_report',
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        method: "POST",
        data: {
            start_date: $('#start_audit_date').val(),
            finish_date: $('#end_audit_date').val(),
            filial: $('#filial').val(),
            office_array: JSON.stringify(final_arr),
            comment: $('#additional_comment').val()
        }

        }
    )
}
