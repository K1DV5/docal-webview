// imported from worksheet.js:
// str2Elem()
// elem2Str()
"use strict"

function newCalcFile() {
    pywebview.api.new_calc_file().then(function() {
        str2Elem([''])
    })
}

function openCalcFile() {
    pywebview.api.open_calc_file().then(function(content) {
        if (content) {
            str2Elem(content)
        }
    })
}

function saveCalcFile(saveas) {
    pywebview.api.save_calc_file({
        saveas: saveas,
        contents: elem2Str()
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
        body.html(message)
    } else {
        // message is an element
        body.text('')
        body.append(message)
    }
    messageBox.modal('show')
}

function sendCalcs(clear) {
    let data = {
        'in': $('#doc-in').val(),
        'clear': clear,
        'calc': elem2Str(),
        'out': $('#doc-out').val(),
        'level': $('.log-level').val()
    }

    pywebview.api.send_calcs(data).then(function(resp) {
        let log = resp[1].join('<br/>')
        messageBox(resp[0], log)
    })
}

// mouse bindings
$('#toolbar-new')       .click(newCalcFile)
$('#toolbar-open')      .click(openCalcFile)
$('#toolbar-save')      .click(function() {saveCalcFile(false)})
$('#toolbar-saveas')    .click(function() {saveCalcFile(true)})
$('#toolbar-exit')      .click(function() {pywebview.api.quit()})
$('#toolbar-help')      .click(function() {pywebview.api.open_help()})
$('#toolbar-about')     .click(function() {
    let docalVersion = '1.0.3' // REPLACE THIS (to be replaced by the build script)
    let about = document.createElement('div')
    about.innerHTML = 
    '<h3>docal <h6>' + docalVersion + '</h6></h3> \
    <p>Python 3.7.1</p> \
    <p>New releases can be downloaded from:<br/> \
    <span style="color: blue;">https://github.com/K1DV5/docal-webview/releases</p> \
    <p>© 2019 K1DV5</p> \
    '
    messageBox('About', about)
})

$('.doc-in-button')     .click(function() {selectDocFile('#doc-in')})
$('.doc-out-button')    .click(function() {selectDocFile('#doc-out')})
$('.doc-in-open')       .click(function() {pywebview.api.open_document([$('#doc-in').val(), false])})
$('.doc-out-open')      .click(function() {pywebview.api.open_document([$('#doc-out').val(), true])})
$('.doc-clear')         .click(function() {sendCalcs(true)})
$('.send-calcs')        .click(function(eve) {sendCalcs(false); eve.preventDefault();})

$('#calc-content')      .keydown(function(eve) {if (eve.key == 'Tab') {$(this).val($(this).val() + '\t'); eve.preventDefault()}})
