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

function sendCalcs(clear, open) {
    let data = {
        'in': $('#doc-in').val(),
        'clear': clear,
        'calc': elem2Str(),
        'out': $('#doc-out').val(),
        'open': open
    }

    pywebview.api.send_calcs(data).then(function(resp) {
        alert(resp[1])
    })
}

// mouse bindings
$('#toolbar-new')       .click(newCalcFile)
$('#toolbar-open')      .click(openCalcFile)
$('#toolbar-save')      .click(function() {saveCalcFile(false)})
$('#toolbar-saveas')    .click(function() {saveCalcFile(true)})
$('#toolbar-exit')      .click(function() {pywebview.api.quit()})
$('#toolbar-about')     .click(function() {
                            alert('DoCaL 0.4.0\nPython 3.7.1\n\nNew releases can be downloaded from:\nhttps://github.com/K1DV5/DoCaL/releases \n\n© 2019 K1DV5')
                            })
$('.doc-in-button')     .click(function() {selectDocFile('#doc-in')})
$('.doc-out-button')    .click(function() {selectDocFile('#doc-out')})
$('.doc-clear')         .click(function() {sendCalcs(true)})
$('.send-calcs')        .click(function(eve) {sendCalcs(false, $('#open-after').prop('checked')); eve.preventDefault();})

// key bindings
// $(window)               .keydown(function(eve) {if (eve.key == 's' && eve.ctrlKey) {saveCalcFile(false)}})
// $(window)               .keydown(function(eve) {if (eve.key == 'o' && eve.ctrlKey) {openCalcFile()}})
// $(window)               .keydown(function(eve) {if (eve.ctrlKey) alert(eve.keyCode)})
$('#calc-content')      .keydown(function(eve) {if (eve.key == 'Tab') {$(this).val($(this).val() + '\t'); eve.preventDefault()}})
