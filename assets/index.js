// imported from worksheet.js:
// str2Elem()
// elem2Str()
"use strict"

function newCalcFile() {
    pywebview.api.new_calc_file().then(function(calc) {
        $('#calc-file').text(calc)
        str2Elem([''])
    })
}

function openCalcFile() {
    pywebview.api.open_calc_file().then(function(calc) {
        $('#calc-file').text(calc.file)
        str2Elem(calc.content)
    })
}

function saveCalcFile(saveas) {
    pywebview.api.save_calc_file({
        saveas: saveas,
        contents: elem2Str()
    }).then(function(resp) {
        if (resp !== undefined) {
            $('#calc-file').text(resp)
        }
    })
}

// general document file selector
function selectDocFile(which) {
    let direction = which == '#doc-in' ? 'in' : undefined
    pywebview.api.select_doc_file(direction).then(function(resp) {
        // change the displayed entry in the html
        $(which).val(resp);
    })
}

// show messages in a messagebox
function messageBox(title, message) {
    let messageBox = $('#messageBox')
    messageBox.find('.modal-title').text(title)
    let body = messageBox.find('.modal-body')
    if (typeof message === 'string') {
        body.text(message)
    } else {
        // message is an element
        body.text('')
        body.append(message)
    }
    messageBox.modal('show')
}

function sendCalcs(clear, open) {
    let data = {
        'in': $('#doc-in').val(),
        'clear': clear,
        'calc': elem2Str(),
        'out': $('#doc-out').val(),
        'open': open ? true : false
    }

    pywebview.api.send_calcs(data).then(function(resp) {
        messageBox(resp[0], resp[1])
    })
}

// mouse bindings
$('#toolbar-new')       .click(newCalcFile)
$('#toolbar-open')      .click(openCalcFile)
$('#toolbar-save')      .click(function() {saveCalcFile(false)})
$('#toolbar-saveas')    .click(function() {saveCalcFile(true)})
$('#toolbar-exit')      .click(function() {pywebview.api.quit()})
$('#toolbar-help')      .click(function() {let help = $('#help'); help.load('help.html'); messageBox('Help', help)})
$('#toolbar-about')     .click(function() {
                            let about = document.createElement('div')
                            let lines = 'DoCaL 0.4.0\nPython 3.7.1\n\nNew releases can be downloaded from:\nhttps://github.com/K1DV5/DoCaL/releases \n\n© 2019 K1DV5'.split('\n\n')
    for (let i = 0; i < lines.length; i++) {
        let p = document.createElement('p')
        p.textContent = lines[i]
        about.appendChild(p)
    }
                            messageBox('About', about)
                            })
$('.doc-in-button')     .click(function() {selectDocFile('#doc-in')})
$('.doc-out-button')    .click(function() {selectDocFile('#doc-out')})
$('.doc-clear')         .click(function() {sendCalcs(true)})
$('.send-calcs')        .click(function(eve) {sendCalcs(false, $('#open-after').prop('checked')); eve.preventDefault();})

$('#calc-content')      .keydown(function(eve) {if (eve.key == 'Tab') {$(this).val($(this).val() + '\t'); eve.preventDefault()}})
