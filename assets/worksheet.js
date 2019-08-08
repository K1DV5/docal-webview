"use strict";

var currentFocus;
var currentFocusInput;
var currentParaDivs;
var scrollTop;
const worksheet = document.getElementById('worksheet')
const inputOnly = document.querySelector('.insert-menu-btn')
const optionsForm = document.querySelector('.calc-entry-options')

function focusEntry(div, input) {
    if (currentFocus) {
        currentFocus.classList.remove('border-primary')
    }
    currentFocus = div
    div.classList.add('border-primary')
    if (input) {
        input.focus()
        currentFocusInput = input
        for (let i = 0; i < inputOnly.length; i++) {
            inputOnly[i].disabled = false
        }
    }
}

function editEntry(eve) {
    scrollTop = worksheet.scrollTop
    let target = eve.currentTarget
    let paraDiv = target.querySelector('.render')
    let input = target.querySelector('.input')
    paraDiv.style.display = 'none'
    input.style.display = 'block'
    focusEntry(target, input)
}

function delEntry() {
    if (currentFocus) {
        var next = currentFocus.nextElementSibling
        var prev = currentFocus.previousElementSibling
        worksheet.removeChild(currentFocus)
        currentFocus = null
    }
    if (next) {
        focusEntry(next, next.querySelector('.input'))
    } else if (prev) {
        focusEntry(prev, prev.querySelector('.input'))
    }
}

function addEntry(type) {
    if (type == 'excel') {
        var div = newXlDiv()
    } else {
        var div = newDiv('', type)
    }
    if (worksheet.children.length && currentFocus) {
        currentFocus.insertAdjacentElement('afterend', div)
    } else {
        worksheet.appendChild(div)
    }
    focusEntry(div, div.querySelector('.input'))
}

function moveEntry(eve) {
    let buttonClasses = eve.currentTarget.classList
    let div = currentFocus
    if (div) {
        if (buttonClasses.contains('move-up')) {
            let moved = div.previousElementSibling
            // if there is one before
            if (moved) {
                worksheet.removeChild(moved)
                div.insertAdjacentElement('afterend', moved)
            }
        } else {
            let moved = div.nextElementSibling
            // if there is one after
            if (moved) {
                worksheet.removeChild(moved)
                div.insertAdjacentElement('beforebegin', moved)
            }
        }
        focusEntry(currentFocus, currentFocus.querySelector('.input'))
        eve.preventDefault()
    }
}

function insertChars(character, withUndersc) {
    if (currentFocusInput && currentFocusInput.style.display == 'block' && currentFocusInput.parentElement == currentFocus) {
        let input = currentFocusInput
        character = withUndersc? '_' + character : character
        input.value = input.value.substring(0, input.selectionStart) + character + input.value.substring(input.selectionStart)
    }
}

// for prepClickInsert
function insertToMenu(menu, items, withUndersc) {
    let trow = document.createElement('tr')
    for (let i = 0; i < items.length; i++) {
        let charac = document.createElement('td')
        charac.value = items[i][0]
        charac.innerHTML = items[i][1]
        charac.addEventListener('click', function() {insertChars(charac.value, withUndersc); menu.selectedIndex = 0})
        trow.appendChild(charac)
        if ((i + 1) % 8 == 0) {
            menu.appendChild(trow)
            trow = document.createElement('tr')
        }
    }
    menu.appendChild(trow)
}

function updateEntries() {
    let entryDivs = worksheet.children
    let paraDivs = []
    for (let i = 0; i < entryDivs.length; i++) {
        paraDivs.push(entryDivs[i].querySelector('.render'))
    }
    renderPara(paraDivs)
}

// prepare click insert items (convenience)
function prepClickInsert() {
    pywebview.api.click_insert_items().then(function(items) {
        let greekList = document.querySelector('#greek-letters')
        insertToMenu(greekList, items['greek'])
        let accentsList = document.querySelector('#math-accents')
        insertToMenu(accentsList, items['accent'], true)
        // let primesList = document.querySelector('#prime-characters')
        // insertToMenu(primesList, items['prime'], true)
    })
}

function resizeEntry(input) {
    // to prevent jumping to the top:
    scrollTop = worksheet.scrollTop
    input.style.height = 'auto'
    input.style.height = input.scrollHeight + 'px'
    worksheet.scrollTop = scrollTop
}


function newDiv(content, type) {
    let div = document.createElement('div')
    // config div
    div.className = 'rounded border my-1 p-1 type-' + type
    div.tabIndex = '0'
    div.addEventListener('focus', function() {focusEntry(div)})
    div.addEventListener('dblclick', editEntry)
    div.innerHTML = '<textarea placeholder="' + (type == 'ascii' ? '' : '## ') + 'Type your calculations here.' + '" class="form-control input" style="display: block">' + content + '</textarea><div style="display: none;" class="render"></div>'
    let input = div.children[0]
    let paraDiv = div.children[1]
    input.addEventListener('input', function() {resizeEntry(input)})
    input.addEventListener('keypress', renderEntry)
    input.addEventListener('focus', function() {currentFocusInput = input; focusEntry(div)})
    // configure paraDiv
    paraDiv.addEventListener('click', function () {focusEntry(div)})
    return div
}

function newXlDiv(data) {
    let div = document.createElement('div')
    div.className = 'rounded border my-1 p-1 type-excel'
    div.addEventListener('dblclick', editEntry)

    div.innerHTML = [
        '<div class="input container-fluid">',
        '<div class="row">',
        '    <div class="col-sm-6 px-0">',
        '        <label for="xl-file">Excel file</label>',
        '        <div class="input-group input-group-sm">',
        '            <input type="text" class="form-control" id="xl-file" placeholder="Path/to/file">',
        '            <div class="input-group-append">',
        '                <button class="btn btn-outline-secondary xl-browse" type="button">Browse</button>',
        '                <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
        '                    <span class="sr-only">Toggle Dropdown</span>',
        '                </button>',
        '                <div class="dropdown-menu">',
        '                    <a class="dropdown-item xl-browse">Browse</a>',
        '                    <a class="dropdown-item xl-open">Open</a>',
        '                </div>',
        '            </div>',
        '        </div>',
        '    </div>',
        '    <div class="col-sm-3">',
        '        <label for=xl-range">Sheet No.</label>',
        '        <div class="input-group input-group-sm">',
        '            <input type="text" class="form-control" id="xl-sheet" placeholder="1">',
        '        </div>',
        '    </div>',
        '    <div class="col-sm-3 px-0">',
        '        <label for=xl-range">Range</label>',
        '        <div class="input-group input-group-sm">',
        '            <input type="text" class="form-control" id="xl-range" placeholder="[auto]">',
        '        </div>',
        '    </div>',
        '</div>',
        '</div>',
        '<div class="render"></div>',
    ].join('')
    excelAttrib(div, data)
    let input = div.children[0]
    input.addEventListener('focus', function() {currentFocusInput = input; focusEntry(div)})
    input.addEventListener('keypress', renderEntry)
    div.addEventListener('click', function () {currentFocusInput = input; focusEntry(div)})
    let browseButtons = div.querySelectorAll('.xl-browse')
    let fileInput = div.querySelector('#xl-file')
    for (let i = 0; i < browseButtons.length; i++) {
        browseButtons[i].addEventListener('click', function() {chooseExcel(fileInput)})
    }
    div.querySelector('.xl-open').addEventListener('click', function() {pywebview.api.open_document([fileInput.value])})
    return div
}

function chooseExcel(fileInput) {
    pywebview.api.open_excel_file().then(function(fname) {
        if (fname) {
            fileInput.value = fname
        }
    })
}

function renderEntry(eve) {
    if (currentFocusInput) {
        if (eve.type == 'click') {
            let div = currentFocusInput.parentElement
            let next = div.nextElementSibling
            // add entry below if the user has already started working with multiple entries and other conds
            if (!next) {
                let paraDiv = div.querySelector('.render')
                renderPara([paraDiv])
            } else {
                updateEntries()
            }
            eve.preventDefault()
        } else if (eve.key == 'Esc') {
            // ignore the editting one and close it
            let input = eve.currentTarget
            let paraDiv = input.parentElement.querySelector('.render')
            input.style.display = 'none'
            paraDiv.style.display = 'block'
            eve.preventDefault()
        }
        worksheet.scrollTop = scrollTop
        for (let i = 0; i < inputOnly.length; i++) {
            inputOnly[i].disabled = true
        }
    }
}

function configNewDiv(div, texStr, editable) {
    texStr = texStr || ''
    // config div
    div.className = 'rounded border my-1 p-1'
    div.tabIndex = '0'
    div.addEventListener('focus', function() {focusEntry(div)})
    div.addEventListener('dblclick', editEntry)
    let input = document.createElement('textarea')
    let paraDiv = document.createElement('div')
    // insert to div
    div.appendChild(input)
    div.appendChild(paraDiv)
    // configure input
    input.value = texStr
    input.placeholder = '## Start typing your calculations.'
    input.className = 'form-control input'
    input.addEventListener('input', resizeEntry)
    input.addEventListener('keydown', renderEntry)
    input.addEventListener('focus', function() {currentFocusInput = input; focusEntry(div)})
    input.style.height = '1px'
    input.style.height = input.scrollHeight + 'px'
    // configure paraDiv
    paraDiv.addEventListener('click', focusEntry(div))
    // what to show
    if (editable || !texStr) {
        paraDiv.style.display = 'none'
        input.style.display = 'block'
    } else {
        paraDiv.style.display = 'block'
        input.style.display = 'none'
    }
}

function renderPara(paraDivs, flush) {
    currentParaDivs = paraDivs
    // whether the previously defined vars are flushed
    flush = flush || paraDivs.length > 1
    let inputs = [flush, []]
    for (let i = 0; i < currentParaDivs.length; i++) {
        let input = currentParaDivs[i].parentElement.querySelector('.input');
        if (input.value.trim()) {
            inputs[1].push(input.value)
            // hide buttons and input
            input.style.display = 'none';
            currentParaDivs[i].style.display = 'block'
        } else {
            // just for maintaining indices
            inputs[1].push(0)
        }
    }
    // process them through python
    pywebview.api.process_and_tex(inputs).then(function(divs) {
        for (let i = 0; i < divs.length; i++) {
            if (divs[i] != 0) {
                // remove current content
                currentParaDivs[i].innerHTML = '';
                for (let j = 0; j < divs[i].length; j++) {
                    let line = divs[i][j].replace(/\\n/g, '\n').replace(/\r/g, '\\r').replace(/\\\\r/g, '\\r');
                    let para = document.createElement('p');
                    let tagRegex = '\\[#TAG\\]([\\w\\d]+)'
                    let badgeStr = '<span class="badge badge-primary">#$1</badge>'
                    para.innerHTML = line.replace(new RegExp('^' + tagRegex, 'g'), badgeStr).replace(new RegExp(tagRegex), '<br/>' + badgeStr)
                    currentParaDivs[i].appendChild(para);
                }
                renderMathInElement(currentParaDivs[i]);
            }
        }
    })
}

// from the string (from file) to the worksheet
function str2Elem(chunks) {
    let worksheet = document.getElementById('worksheet')
    // remove current content
    worksheet.innerHTML = ''
    for (let i = 0; i < chunks.length; i++) {
        let div = document.createElement('div')
        worksheet.appendChild(div)
        configNewDiv(div, chunks[i].replace(/\\n/g, '\n'), true)
    }
}

// from the worksheet to string (for file)
function elem2Str() {
    let entryDivs = document.querySelector('#worksheet').children
    let calc = ''
    for (let i = 0; i < entryDivs.length; i++) {
        calc += '\n' + entryDivs[i].querySelector('.input').value
    }
    return calc
}

function insertOptions() {
    if (currentFocusInput && currentFocusInput.style.display == 'block') {
        let input = currentFocusInput
        let lineNo = input.value.slice(0, input.selectionStart).split('\n').length - 1
        let lines = input.value.split('\n')
        let baseLine = lines[lineNo].split('#')[0]
        if (baseLine) {
            let options = []
            let steps = ''
            let optionInputs = optionsForm.querySelectorAll('.option')
            for (let i = 0; i < optionInputs.length; i++) {
                let current = optionInputs[i]
                let currentClasses = current.classList
                if (currentClasses.contains('option-unit') && current.value) {
                    options.push(current.value)
                } else if (currentClasses.contains('option-note') && current.value) {
                    options.push('# ' + current.value)
                } else if (currentClasses.contains('option-step') && current.checked) {
                    steps += current.value
                } else if (currentClasses.contains('option-inline') && current.checked) {
                    options.push('$')
                } else if (currentClasses.contains('option-horizontal') && current.checked) {
                    options.push('-')
                } else if (currentClasses.contains('option-hidden') && current.checked) {
                    options.push(';')
                }
            }
            if (steps) {
                options.push(steps)
            }
            lines[lineNo] = lines[lineNo].split('#')[0].trim() + (options.length ? ' # ' + options.join(', ') : '')
            input.value = lines.join('\n')
        }
    }
}

document.querySelector('.add-bel').addEventListener('click', addEntry)
document.querySelector('.add-abv').addEventListener('click', addEntry)
document.querySelector('.move-up').addEventListener('click', moveEntry)
document.querySelector('.move-dn').addEventListener('click', moveEntry)
document.querySelector('.del-btn').addEventListener('click', delEntry)
document.querySelector('.calc-entry-options textarea').addEventListener('input', resizeEntry)
document.querySelector('.insert-options-btn').addEventListener('click', insertOptions)
str2Elem([''])
