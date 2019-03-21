"use strict";
// the current working para div (pywebview's promise only manipulates globals!)
var currentParaDivs;
var currentFocus;
var currentFocusInput;
const optionsForm = document.querySelector('.calc-entry-options')

function focusEntry(div, input) {
    if (currentFocus) {
        currentFocus.classList.remove('border-primary')
    }
    currentFocus = div
    div.classList.add('border-primary')
    if (input) {
        input.focus()
    }
}

function editEntry(eve) {
    let target = eve.currentTarget
    let paraDiv = target.querySelector('div')
    paraDiv.style.display = 'none'
    let input = target.querySelector('.input')
    input.style.display = 'block'
    focusEntry(target, input)
}

function delEntry() {
    let worksheet = document.querySelector('#worksheet')
    worksheet.removeChild(currentFocus)
}

function addEntry(eve, nextTo) {
    let div = document.createElement('div')
    let eveTarget = eve.currentTarget
    let worksheet = document.getElementById('worksheet')
    if (worksheet.children.length && currentFocus) {
        if (eveTarget.classList.contains('add-bel') || nextTo) {
            // render the current one
            renderPara([currentFocus.querySelector('div')])
            currentFocus.insertAdjacentElement('afterend', div)
        } else {
            renderPara([currentFocus.querySelector('div')])
            currentFocus.insertAdjacentElement('beforebegin', div)
        }
    } else {
        worksheet.appendChild(div)
    }
    configNewDiv(div, '', true)
    focusEntry(div, div.querySelector('.input'))
    eve.preventDefault()
}

function moveEntry(eve) {
    let buttonClasses = eve.currentTarget.classList
    let div = currentFocus
    let worksheet = document.getElementById('worksheet')
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

function updateEntries() {
    let entryDivs = document.getElementById('worksheet').children
    let paraDivs = []
    for (let i = 0; i < entryDivs.length; i++) {
        paraDivs.push(entryDivs[i].querySelector('div'))
    }
    renderPara(paraDivs, true)
}

function resizeEntry(arg) {
    let input = arg.currentTarget
    input.style.height = '1px'
    input.style.height = input.scrollHeight + 'px'
}

function renderEntry(eve) {
    if (eve.key == 'Enter') {
        let input = eve.currentTarget
        if (input.value.trim()) {
            let lineNo = input.value.slice(0, input.selectionStart).split('\n').length - 1
            let currentLine = input.value.split('\n')[lineNo]
            if (currentLine.match(/^\s*[^#]+/)) {
                let div = eve.currentTarget.parentElement
                let paraDiv = div.querySelector('div')
                // only if there is something meaningful
                renderPara([paraDiv])
                let next = eve.currentTarget.parentElement.nextElementSibling
                // add entry below if the user has already started working with multiple entries and other conds
                if (!next) {
                    addEntry(eve, true)
                } else {
                    updateEntries()
                }
                eve.preventDefault()
            }
        }
    } else if (eve.key == 'Escape') {
        let input = eve.currentTarget
        if (input.value.trim()) {
            input.style.display = 'none'
            input.parentElement.querySelector('div').style.display = 'block'
            eve.preventDefault()
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
        let input = currentFocusInput
        let lineNo = input.value.slice(0, input.selectionStart).split('\n').length - 1
        let lines = input.value.split('\n')
        lines[lineNo] = lines[lineNo].split('#')[0].trim() + ' # ' + options.join(', ')
        input.value = lines.join('\n')
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
