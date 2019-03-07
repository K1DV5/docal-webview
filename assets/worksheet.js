"use strict";
// the current working para div (pywebview's promise only manipulates globals!)
var currentParaDivs;

function editEntry(eve) {
    let parentDiv = eve.currentTarget.parentElement
    let buttons = parentDiv.querySelectorAll('button')
    eve.currentTarget.style.display = 'none'
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.display = 'inline'
    }
    let textarea = parentDiv.querySelector('textarea')
    textarea.style.display = 'block'
    textarea.focus()
}

function delEntry(eve) {
    let parentDiv = eve.currentTarget.parentElement
    parentDiv.parentElement.removeChild(parentDiv)
}

function addEntry(eve, nextTo) {
    let div = document.createElement('div')
    let eveTarget = eve.currentTarget
    if (eveTarget.classList.contains('add-bel') || nextTo) {
        // render the current one
        renderPara([eveTarget.parentElement.querySelector('div')])
        eveTarget.parentElement.insertAdjacentElement('afterend', div)
    } else if (eveTarget.classList.contains('add-abv')) {
        renderPara([eveTarget.parentElement.querySelector('div')])
        eveTarget.parentElement.insertAdjacentElement('beforebegin', div)
    } else {
        let worksheet = document.getElementById('worksheet')
        worksheet.appendChild(div)
    }
    configNewDiv(div, '', true)
    eve.preventDefault()
}

function moveEntry(eve) {
    let buttonClasses = eve.currentTarget.classList
    let div = eve.currentTarget.parentElement
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

function resizeEntry(eve) {
    if (eve.key == 'Backspace' || eve.key == 'Enter') {
        let textarea = eve.currentTarget
        let linesCount = textarea.value.split('\n').length
        textarea.rows = linesCount
    }
}

function configNewDiv(div, texStr, editable) {
    texStr = texStr || ''
    // config div
    div.className = 'border'
    let textarea = document.createElement('textarea')
    let buttonDone = document.createElement('button')
    let buttonDel = document.createElement('button')
    let buttonAddBel = document.createElement('button')
    let buttonAddAbv = document.createElement('button')
    let buttonMoveUp = document.createElement('button')
    let buttonMoveDn = document.createElement('button')
    let paraDiv = document.createElement('div')
    // insert to div
    div.appendChild(textarea)
    div.appendChild(buttonDone)
    div.appendChild(buttonDel)
    div.appendChild(buttonAddBel)
    div.appendChild(buttonAddAbv)
    div.appendChild(buttonMoveUp)
    div.appendChild(buttonMoveDn)
    div.appendChild(paraDiv)
    // configure the done button
    buttonDone.textContent = 'Done'
    buttonDone.className = 'done-btn btn btn-primary btn-sm'
    buttonDone.addEventListener('click', renderEntry)
    // configure del button
    buttonDel.textContent = 'X'
    buttonDel.className = 'del-btn btn btn-danger btn-sm'
    buttonDel.addEventListener('click', delEntry)
    // configure add buttons
    buttonAddBel.textContent = '+▼'
    buttonAddBel.className = 'add-bel btn btn-secondary btn-sm'
    buttonAddBel.addEventListener('click', addEntry)
    buttonAddAbv.textContent = '+▲'
    buttonAddAbv.className = 'add-abv btn btn-secondary btn-sm'
    buttonAddAbv.addEventListener('click', addEntry)
    //configure move buttons
    buttonMoveUp.textContent = '▲'
    buttonMoveUp.className = 'move-up btn btn-secondary btn-sm'
    buttonMoveUp.addEventListener('click', moveEntry)
    buttonMoveDn.textContent = '▼'
    buttonMoveDn.className = 'move-dn btn btn-secondary btn-sm'
    buttonMoveDn.addEventListener('click', moveEntry)
    // configure input
    // textarea.addEventListener('keydown', resizeEntry)
    // prevents it from creating another entry, comment for now
    // textarea.addEventListener('focusout', renderEntry)
    textarea.value = texStr
    textarea.placeholder = '## Start typing your calculations.'
    textarea.className = 'form-control'
    textarea.rows = 15
    // configure paraDiv
    paraDiv.addEventListener('click', editEntry)
    // what to show
    if (editable || !texStr) {
        paraDiv.style.display = 'none'
        textarea.style.display = 'block'
        textarea.focus()
    } else {
        // hide everything otherthan the paraDiv
        toHide = div.querySelectorAll('div, button')
        for (let i = 0; i < toHide.length; i++) {
            toHide[i].style.display = 'none'
        }
    }
}

function renderPara(paraDivs) {
    currentParaDivs = paraDivs
    // whether only the last calculation is shown in each entry render
    let onlyLast = document.querySelector('#worksheet').childElementCount > 1
    let inputs = [onlyLast, []]
    for (let i = 0; i < currentParaDivs.length; i++) {
        let input = currentParaDivs[i].parentElement.querySelector('textarea');
        if (input.value.trim()) {
            // do something
            inputs[1].push(input.value)
            // hide buttons and textarea
            input.style.display = 'none';
            let buttons = input.parentElement.querySelectorAll('button');
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].style.display = 'none';
            }
        } else {
            // just for maintaining indices
            inputs[1].push(0)
        }
    }
    // process them through python
    pywebview.api.process_and_tex(inputs).then(function(divs) {
        for (let i = 0; i < divs.length; i++) {
            if (divs[i] != 0) {
                currentParaDivs[i].style.display = 'block';
                // remove current content
                currentParaDivs[i].innerHTML = '';
                for (let j = 0; j < divs[i].length; j++) {
                    let para = document.createElement('p');
                    para.textContent = divs[i][j].replace(/\\n/g, '\n').replace(/\r/g, '\\r').replace(/\\\\right/g, '\\right');
                    currentParaDivs[i].appendChild(para);
                }
                renderMathInElement(currentParaDivs[i]);
            }
        }
    })
}

function renderEntry(eve) {
    let worksheet = document.getElementById('worksheet')
    let div = eve.currentTarget.parentElement
    let paraDiv = div.querySelector('div')
    let input = div.querySelector('textarea')
    if (input.value) {
        // only if there is something meaningful
        renderPara([paraDiv])
        let next = eve.currentTarget.parentElement.nextElementSibling
        // add entry below if the user has already started working with multiple entries and other conds
        if (worksheet.children.length > 1 && !next) {
            addEntry(eve, true)
        } else {
            updateEntries()
        }
    }
    eve.preventDefault()
}

// from the string (from file) to the worksheet
function str2Elem(str) {
    let worksheet = document.getElementById('worksheet')
    // remove current content
    worksheet.innerHTML = ''
    let div = document.createElement('div')
    worksheet.appendChild(div)
    configNewDiv(div, str)
}

// from the worksheet to string (for file)
function elem2Str() {
    let entryDivs = document.querySelector('#worksheet').children
    let calc = ''
    for (let i = 0; i < entryDivs.length; i++) {
        calc += '\n\n' + entryDivs[i].querySelector('textarea').value
    }
    return calc
}

document.querySelector('.main-add-btn').addEventListener('click', addEntry)
str2Elem('')

