"use strict";
// the current working para div (pywebview's promise only manipulates globals!)
var currentParaDivs;
var currentFocus;

function editEntry(eve) {
    let parentDiv = eve.currentTarget.parentElement
    eve.currentTarget.style.display = 'none'
    let textarea = parentDiv.querySelector('textarea')
    textarea.style.display = 'block'
    textarea.focus()
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
    div.querySelector('textarea').focus()
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
    currentFocus.querySelector('textarea').focus()
    eve.preventDefault()
}

function updateEntries() {
    let entryDivs = document.getElementById('worksheet').children
    let paraDivs = []
    for (let i = 0; i < entryDivs.length; i++) {
        paraDivs.push(entryDivs[i].querySelector('div'))
    }
    renderPara(paraDivs)
}

function resizeEntry(arg) {
    let textarea = arg.currentTarget
    textarea.style.height = '1px'
    textarea.style.height = textarea.scrollHeight + 'px'
}

function renderEntry(eve) {
    if (eve.key == 'Enter') {
        let input = eve.currentTarget
        if (input.value) {
            let lineNo = input.value.slice(0, input.selectionStart).split('\n').length - 1
            let currentLine = input.value.split('\n')[lineNo]
            if (currentLine.match(/^\s*\w+[\w\d]*.*=.*$/)) {
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
    }
}

function configNewDiv(div, texStr, editable) {
    texStr = texStr || ''
    // config div
    div.className = 'rounded border'
    let textarea = document.createElement('textarea')
    let paraDiv = document.createElement('div')
    // insert to div
    div.appendChild(textarea)
    div.appendChild(paraDiv)
    // configure input
    textarea.value = texStr
    textarea.placeholder = '## Start typing your calculations.'
    textarea.className = 'form-control'
    textarea.addEventListener('input', resizeEntry)
    textarea.addEventListener('keydown', renderEntry)
    textarea.addEventListener('focus', function() {currentFocus = div})
    textarea.style.height = '1px'
    textarea.style.height = textarea.scrollHeight + 'px'
    // configure paraDiv
    paraDiv.addEventListener('click', editEntry)
    // what to show
    if (editable || !texStr) {
        paraDiv.style.display = 'none'
        textarea.style.display = 'block'
    } else {
        paraDiv.style.display = 'block'
        textarea.style.display = 'none'
    }
}

function renderPara(paraDivs) {
    currentParaDivs = paraDivs
    // whether the previously defined vars are flushed
    let flush = paraDivs.length > 1
    let inputs = [flush, []]
    for (let i = 0; i < currentParaDivs.length; i++) {
        let input = currentParaDivs[i].parentElement.querySelector('textarea');
        if (input.value.trim()) {
            inputs[1].push(input.value)
            // hide buttons and textarea
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
                    let para = document.createElement('p');
                    para.textContent = divs[i][j].replace(/\\n/g, '\n').replace(/\r/g, '\\r').replace(/\\\\r/g, '\\r');
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
        calc += '\n' + entryDivs[i].querySelector('textarea').value
    }
    return calc
}

document.querySelector('.add-bel').addEventListener('click', addEntry)
document.querySelector('.add-abv').addEventListener('click', addEntry)
document.querySelector('.move-up').addEventListener('click', moveEntry)
document.querySelector('.move-dn').addEventListener('click', moveEntry)
document.querySelector('.del-btn').addEventListener('click', delEntry)
str2Elem([''])

