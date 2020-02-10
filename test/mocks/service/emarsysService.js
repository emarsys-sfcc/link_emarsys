'use strict';

module.exports = {
    call: function (endpoint, requestBody, requestMethod) {
        switch(endpoint) {
            case 'field':
                return {
                    status: 'OK',
                    object: JSON.stringify({data:[{"id": 48,"name": "Date of first registration","application_type": "special","string_id": "registration_date"},
                    {"id": 29,"name": "Days since last email sent","application_type": "special","string_id": "days_since_last_email_sent"},
                    {"id": 31,"name": "Opt-In","application_type": "special","string_id": "optin"},
                    {"id": 1,"name": "First Name","application_type": "shorttext","string_id": "first_name"},
                    {"id": 2,"name": "Last Name","application_type": "shorttext","string_id": "last_name"},
                    {"id": 9,"name": "Title","application_type": "singlechoice","string_id": "title"}]})
                }
            case 'field/31/choice':
                return {
                    status: 'OK',
                    object: JSON.stringify({data:[
                        {"id": 31, "choice":"title"}]})
                }

            case 'settings/autoimports':
                return {
                    status: 'OK',
                    object: JSON.stringify({data:[]})
                }
            case 'event':
                return {
                    status: 'OK',
                    object: JSON.stringify({data:[{"id":"5633","name":"single"},{"id":"5634","name":"double"},{"id":"5636","name":"single account"},{"id":"5637","name":"double account"},{"id":"5638","name":"single checkout"}]})
                }
            case 'source':
                return {
                    status: 'OK',
                    object: JSON.stringify({data:[{"id":"5633","name":"single"},{"id":"5634","name":"double"},{"id":"5636","name":"single account"},{"id":"5637","name":"double account"},{"id":"5638","name":"single checkout"}]})
                }
            case 'source/create':
                return {
                    status: 'OK',
                    object: JSON.stringify({data:[{"id":"5633","name":"single"},{"id":"5634","name":"double"},{"id":"5636","name":"single account"},{"id":"5637","name":"double account"},{"id":"5638","name":"single checkout"}]})
                }
            case 'contact/getdata':
                return {
                    status: 'OK',
                    object: JSON.stringify({data: {
                        result:[{"3":"test@tes.com", "31":"2"}],
                        errors:[]
                        }})
                }
                case 'contact':
                    return {
                        status: 'OK',
                        object: JSON.stringify({data: {
                            result:[]
                            }})
                    }
            case 'field/translate/en':
                return {
                    status: 'OK',
                    object: JSON.stringify({data:[]})
                }
            case 'event/5634/trigger':
                return {
                    status: 'OK',
                    object: JSON.stringify({data:[]})
                }
            default: 
                return {
                    status: 'ERROR',
                    errorMessage:JSON.stringify({"replyCode":1,"replyText":"ERROR"}),
                    object: JSON.stringify({data:[]})
                }
        }
    }
};