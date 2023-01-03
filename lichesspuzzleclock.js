// ==UserScript==
// @name     LichessPuzzleClock
// @version  1.0
// @downloadURL https://rafaelnajera.github.io/lichesspuzzleclock/lichesspuzzleclock.js
// @match https://lichess.org/training*
// @exclude-match https://lichess.org/training/history
// @exclude-match https://lichess.org/training/themes
// @exclude-match https://lichess.org/training/dashboard*
// @exclude-match https://lichess.org/training/of-player
// @require https://code.jquery.com/jquery-3.6.0.min.js
// @inject-into content
// @grant GM_addStyle
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==


// User Settings

const timeOutBlitz = getUserSetting('timeOutBlitz', 10)
const timeOutRapid = getUserSetting('timeOutRapid', 30)
const timeOutClassic = getUserSetting('timeOutClassic', 180)



let autoStartMode = getUserSetting('autoStartMode', 'no')
let autoFailOnTimeout = getUserSetting('autoFailOnTimeOut', false)
let autoStart = autoStartMode !== 'no'


const darkColorScheme = {
    countingUp: 'silver',
    countingDown: 'yellow',
    puzzleEnd: 'gray',
    timeOut: 'red',
    enabledButton: 'rgb(186, 186, 186)',
    disabledButton: 'rgb(96,96,96)'
}

const lightColorScheme = {
    countingUp: '#424242',
    countingDown: '#e36920',
    puzzleEnd: 'gray',
    timeOut: 'red',
    enabledButton: 'black',
    disabledButton: 'rgb(200,200,200)'
}


// -----------------------------------------------
// Script body

const STATE_WAITING = 0
const STATE_COUNTING_UP = 1
const STATE_COUNTING_DOWN = 2
const STATE_PUZZLE_TIMEOUT = 3
const STATE_PUZZLE_END = 4

const classCountingUp = 'chrono'
const classCountingDown = 'timer'
const classTimeout = 'timeout'
const classPuzzleEnd = 'end'

const pollingInterval = 30

// global variables
let startingTimestamp = -1
let timeout
let state

let colorScheme

let buttonBlitz
let buttonRapid
let buttonClassic
let buttonInfinite
let clockElement
let autoFailCheckbox
let autoSelect



$( () => {
    colorScheme = $('body').hasClass('dark') ? darkColorScheme : lightColorScheme
    GM_addStyle(getStyles())
    $('#top').after(getHtml())
    buttonBlitz = $(`div.puzzleClock button.blitz`)
    buttonRapid = $(`div.puzzleClock button.rapid`)
    buttonClassic = $(`div.puzzleClock button.classic`)
    buttonInfinite =$(`div.puzzleClock button.infinite`)
    clockElement = $('div.clock')
    autoFailCheckbox = $(`div.puzzleClock input.autoFailCheckbox`)
    autoSelect = $(`div.puzzleClock select.autoSelect`)

    buttonBlitz.on('click', genOnClickTimerButton(timeOutBlitz))
    buttonRapid.on('click', genOnClickTimerButton(timeOutRapid))
    buttonClassic.on('click', genOnClickTimerButton(timeOutClassic))
    buttonInfinite.on('click', genOnClickInfiniteButton())

    autoFailCheckbox.on('click', genOnClickAutoFailCheckbox())
    autoSelect.on('change', genOnChangeAutoSelect())

   goToInitialState()
   setInterval(managerThread, pollingInterval)

})

// -----------------------------------------------


/**
 * Gets a user setting from storage, sets it in storage if it's not already there
 * @param {string}setting
 * @param {any}defaultValue
 */
function getUserSetting(setting, defaultValue) {
    let v = GM_getValue(setting, null)
    if (v === null) {
        GM_setValue(setting, defaultValue)
        return defaultValue
    }
    return v
}

function getTimeOutButtons() {
    return [ buttonBlitz, buttonRapid, buttonClassic]
}

function genOnClickTimerButton(timeOut) {
    return () => {
        if (state !== STATE_WAITING) {
            return
        }
        toState(STATE_COUNTING_DOWN, timeOut)
    }
}

function genOnClickInfiniteButton() {
    return ()  => {
        switch (state) {
            case STATE_WAITING:
            case STATE_COUNTING_DOWN:
                toState(STATE_COUNTING_UP)
                break
        }
    }
}

function genOnClickAutoFailCheckbox() {
    return () =>  {
        autoFailOnTimeout = autoFailCheckbox.is(':checked')
        GM_setValue('autoFailOnTimeOut', autoFailOnTimeout)
    }
}

function genOnChangeAutoSelect() {
    return () => {
        let selectedOption = autoSelect.find(':selected').val()
        GM_setValue('autoStartMode', selectedOption)
        autoStartMode = selectedOption
    }
}

function goToInitialState() {
    if (autoStart) {
        let initialTimer = -1
        switch(autoStartMode) {
            case 'blitz':
                initialTimer = timeOutBlitz
                break

            case 'rapid':
                initialTimer = timeOutRapid
                break

            case 'classic':
                initialTimer = timeOutClassic
                break
        }
        if (initialTimer !== -1) {
            toState(STATE_COUNTING_DOWN, initialTimer)
        } else {
            startingTimestamp = -1
            toState(STATE_COUNTING_UP)
        }
    } else {
        toState(STATE_WAITING)
    }
}

function toState(newState, param = -1) {
    //console.log(`Going from state ${state} to ${newState}, param = ${param}`)
    switch(newState) {
        case STATE_WAITING:
            clockElement.html(getClockHtml(STATE_WAITING, 0))
                .removeClass([classCountingUp, classCountingDown, classTimeout, classPuzzleEnd])
            timeout = -1
            startingTimestamp = -1
            getTimeOutButtons().forEach( (btn) => {
                btn.prop('disabled', false)
            })
            buttonInfinite.prop('disabled', false)
            state = STATE_WAITING
            break

        case STATE_COUNTING_UP:
            timeout = -1
            if (startingTimestamp === -1) {
                startingTimestamp = new Date()
            }
            clockElement.removeClass([classCountingDown, classTimeout, classPuzzleEnd]).addClass(classCountingUp)
            getTimeOutButtons().forEach( (btn) => {
                btn.prop('disabled', true)
            })
            state = STATE_COUNTING_UP
            break

        case STATE_COUNTING_DOWN:
            timeout = param*1000
            startingTimestamp = new Date()
            clockElement.removeClass([classCountingUp, classTimeout, classPuzzleEnd]).addClass(classCountingDown)
            getTimeOutButtons().forEach( (btn) => {
                btn.prop('disabled', true)
            })
            buttonInfinite.prop('disabled', false)
            state = STATE_COUNTING_DOWN
            break

        case STATE_PUZZLE_TIMEOUT:
            clockElement.removeClass(classCountingDown).addClass(classTimeout)
            buttonInfinite.prop('disabled', true)
            if (autoFailOnTimeout) {
                makePuzzleFail()
            }
            state = STATE_PUZZLE_TIMEOUT
            break

        case STATE_PUZZLE_END:
            clockElement.removeClass([classCountingUp, classCountingDown, classTimeout])
                .addClass(classPuzzleEnd)

            buttonInfinite.prop('disabled', true)
            state = STATE_PUZZLE_END
            break
    }

}

function  getClockHtml(state, timeInMilliseconds) {
    let withDecimals = state === STATE_COUNTING_DOWN && timeInMilliseconds < 10000
    let timeHtml = getTimeHtml(timeInMilliseconds, withDecimals)
    switch (state) {
        case STATE_WAITING:
            return '--:--'

        case STATE_COUNTING_DOWN:
            return `&raquo; ${timeHtml}`

        case STATE_COUNTING_UP:
            return `+ ${timeHtml}`

        case STATE_PUZZLE_TIMEOUT:
            return `&otimes; ${timeHtml}`

        case STATE_PUZZLE_END:
            return `&oplus; ${timeHtml}`
    }


}

function managerThread() {
    let currentTimestamp
    let timeInClock
    switch(state) {
        case STATE_WAITING:
            // nothing to do
            break

        case STATE_COUNTING_DOWN:
            if (!isSolvingPuzzle() || isPuzzleWrong()) {
                // puzzle ended
                toState(STATE_PUZZLE_END)
                break
            }
            currentTimestamp = new Date()
            timeInClock = timeout - (currentTimestamp - startingTimestamp)
            if (timeInClock < 0) {
                timeInClock = currentTimestamp - startingTimestamp
                toState(STATE_PUZZLE_TIMEOUT)
                clockElement.html(getClockHtml(STATE_PUZZLE_TIMEOUT, timeInClock))
            } else {
                clockElement.html(getClockHtml(STATE_COUNTING_DOWN, timeInClock))
            }
            break

        case STATE_COUNTING_UP:
            currentTimestamp = new Date()
            timeInClock = currentTimestamp - startingTimestamp
            clockElement.html(getClockHtml(STATE_COUNTING_UP, timeInClock))
            if (!isSolvingPuzzle() || isPuzzleWrong()) {
                // puzzle ended
                toState(STATE_PUZZLE_END, timeInClock)
                break
            }
            break

        case STATE_PUZZLE_TIMEOUT:
            currentTimestamp = new Date()
            timeInClock = currentTimestamp - startingTimestamp
            clockElement.html(getClockHtml(STATE_PUZZLE_TIMEOUT, timeInClock))
            if (!isSolvingPuzzle() || isPuzzleWrong()) {
                // puzzle ended
                toState(STATE_PUZZLE_END, timeInClock)
                break
            }
            break

        case STATE_PUZZLE_END:
            if (!isPuzzleWrong() && isSolvingPuzzle()) {
                goToInitialState()
            }
            break
    }
}


function getTimeHtml(timeInMilliseconds, withDecimals) {
    let timeMinutes = Math.floor(timeInMilliseconds / 60000)
    let timeSeconds = Math.floor((timeInMilliseconds % 60000) / 1000)
    let timeMillis = timeInMilliseconds % 1000
    let timeSecondsStr;
    if (timeSeconds < 10) {
        timeSecondsStr = "0" + timeSeconds;
    } else {
        timeSecondsStr = "" + timeSeconds;
    }
    let decString = withDecimals ? `<small>${Math.floor(timeMillis / 100)}</small>` : ''

    return `${timeMinutes}:${timeSecondsStr}${decString}`
}

function isSolvingPuzzle() {
    let element = document.querySelector('div.view_solution');
    return (element !== null);
}

function isPuzzleWrong() {
    let element = document.querySelector('div.icon');
    return (element !== null && element.innerHTML === "✗");
}

function makePuzzleFail() {
    let button = document.querySelector('div.view_solution a');
    if (button !== null) {
        button.click();
    }
}


function getHtml() {
    return `<div class="puzzleClock">
        <div class="tb">
            <div class="tb-group">
                <button class="blitz" title="Blitz Timer, ${timeOutBlitz}s">B</button>
                <button class="rapid" title="Rapid Timer, ${timeOutRapid}s">R</button> 
                <button class="classic" title="Classic Timer, ${timeOutClassic}s">C</button>
            </div>
            <div class="tb-group">
                <button class="infinite" title="No time limit">&infin;</button>
            </div>
           
        </div>
        <div class="clock">--:--</div>
        <div class="tb">
            <div class="tb-group withTopPadding">
                 <input title="Auto Fail Puzzle on Timeout" type="checkbox" ${autoFailOnTimeout ? "checked" : ''} class="autoFailCheckbox"/> <label>AF</label>
            </div>
            <div class="tb-group withTopPadding">
                <label>Auto:</label>
                <select title="Auto Start" class="autoSelect" >
                   <option title="Do no start automatically" value="no" ${autoStartMode === 'no' ? 'selected' : ''}>no</option>
                   <option title="Auto start Blitz timer" value="blitz" ${autoStartMode === 'blitz' ? 'selected' : ''}>B</option>
                   <option title="Auto start Rapid timer" value="rapid" ${autoStartMode === 'rapid' ? 'selected' : ''}>R</option>
                   <option title="Auto start Classic timer" value="classic" ${autoStartMode === 'classic' ? 'selected' : ''}>C</option>
                   <option title="Auto start normal clock" value="infinite" ${autoStartMode === 'infinite' ? 'selected' : ''}>&infin;</option>
                </select>
            </div>
        </div>
     </div>`
}

function getStyles() {
    return `
    .pcHidden {
        display: none;
    }
    
div.puzzleClock {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%; 
    font-size:12pt;
}

.puzzleClock div.tb {
    display: flex;
    flex-direction: row
}

.puzzleClock div.tb-group {
    margin-right: 2em;
}

.puzzleClock button {
    color: ${colorScheme.enabledButton};
    border: 1px solid ${colorScheme.enabledButton};
    border-radius: 3px;
    margin: 5px;
    background: none;
    padding: 1px 8px;
}

.puzzleClock select {
    padding:0;
}

.puzzleClock button:disabled {
    color: ${colorScheme.disabledButton};
    border: 1px solid ${colorScheme.disabledButton};
}


.puzzleClock div.clock {
    font-size: 1.5em;
    margin-left: 3em;
    margin-right: 3em;
}

.puzzleClock div.clock.${classCountingDown} {
    color: ${colorScheme.countingDown};
}

.puzzleClock div.clock.${classCountingUp} {
    color: ${colorScheme.countingUp};
}

.puzzleClock div.clock.${classPuzzleEnd} {
    color: ${colorScheme.puzzleEnd};
}

.puzzleClock div.clock.${classTimeout} {
    color: ${colorScheme.timeOut};
}

.puzzleClock div.clock small {
    font-size: 0.5em;
}
.withTopPadding {
    padding-top: 4px;
}
`
}