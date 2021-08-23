const squareSize = 60
const table = document.querySelector('table')
let tdList = []
let json = ''
let boardInfo = {
  Wsize: 0,
  Hsize: 0,
  answerLen: {
    row: {},
    column: {}
  },
  squareInfo: {}
}

/*** boardInfo.squareInfoについて ***

type := var/変数, const/定数, black/黒塗り
usedQuestion := このマスが使われている問題一覧
                'row' or 'column' - 'questionNumber' - 何文字目
answer := マスの答え
input := 入力された文字

squareInfo: {
  '0-0': {
    type: 'var'
    usedQuestion: ['row-1-0']
    answer: 'バ',
    input: ''
  },
  '0-1': {

  }
}
***********************************/

;(async() => {
  json = await fetch('./data/puzzleData.json').then(res => res.json())

  // 初期化
  /*
  document.documentElement.style.setProperty( '--vh', window.innerHeight / 100 + 'px')
  window.addEventListener('resize', () => {
    document.documentElement.style.setProperty( '--vh', window.innerHeight / 100 + 'px')
    console.log(window.innerHeight)
  })
  */

  boardInfo.Wsize = json.initialState[0].length
  boardInfo.Hsize = json.initialState.length
  boardInfo.answerLen = {
    row: Object.fromEntries(Object.entries(json.answer.row).map(([_, ans]) => [_, ans.length])),
    column: Object.fromEntries(Object.entries(json.answer.column).map(([_, ans]) => [_, ans.length]))
  }

  json.initialState.forEach((row, i) => row.forEach((_, j) => boardInfo.squareInfo[`${i}-${j}`] = {usedQuestion: []}))

  for(const [i, row] of json.initialState.entries()) {
    for(const [j, val] of row.entries()) {
      const currentSquareInfo = boardInfo.squareInfo[`${i}-${j}`]
      const type = currentSquareInfo.type 
                 = (val === 'b' ? 'black' : (isNaN(val) ? 'const' : 'var'))

      if(type === 'var') {
        if(val !== ' ') {
          if(json.answer.row[val]) {
            for(let k = 0; k < boardInfo.answerLen.row[val]; k++) {
              boardInfo.squareInfo[`${i}-${j + k}`].usedQuestion.push(`row-${val}-${k}`)
            }
          }
          if(json.answer.column[val]) {
            for(let k = 0; k < boardInfo.answerLen.column[val]; k++) {
              boardInfo.squareInfo[`${i + k}-${j}`].usedQuestion.push(`column-${val}-${k}`)
            }
          }
        }

        const [direction, qNum, num] = currentSquareInfo.usedQuestion[0].split('-')
        currentSquareInfo.answer = json.answer[direction][qNum].split('')[num]
      }
    }
  }

  // 盤面と問題表示
  displayBoard()
  displayQuestion()

  // 盤面ホバーアクション
  tdList = table.querySelectorAll('td')

  for(const td of tdList) {
    const index = [].slice.call(tdList).indexOf(td)
    const num = td.getAttribute('data-num')

    td.addEventListener('mouseover', () => {
      focusSquare(tdList, index, num)
    })

    td.addEventListener('click', () => {
      clickSquare(num)
    })
  }

  // イベントリスナの設定
  showInputAnswerWindow()
  // submitKeyword()
})()

const displayBoard = () => {
  const html = []

  const frame = document.querySelector('.frame')
  if(document.body.clientWidth < 480) {
    frame.style.width = frame.style.height = table.style.width = table.style.height = document.body.clientWidth + 'px'
  } else {
    frame.style.width = frame.style.height = table.style.width = table.style.height = boardInfo.Wsize * squareSize + 'px'
  }

  window.addEventListener('resize', () => {
    if(document.body.clientWidth < 480) {
      const frame = document.querySelector('.frame')
      frame.style.width = frame.style.height = table.style.width = table.style.height = document.body.clientWidth + 'px'
    } else {
      frame.style.width = frame.style.height = table.style.width = table.style.height = boardInfo.Wsize * squareSize + 'px'
    }
  })

  for(const row of json.initialState) {
    html.push('<tr>')
    for(const item of row) {
      if(item === ' ') html.push('<td></td>')
      else if(item === 'b') html.push('<td class = "black"></td>')
      else if(isNaN(item)) html.push(`<td data-val = ${item}></td>`)
      else html.push(`<td data-num = ${item}></td>`)
    }
    html.push('</tr>')
  }

  table.querySelector('tbody').insertAdjacentHTML('afterbegin', html.join(''))
}

const displayQuestion = () => {
  Object.keys(json.question).forEach(direction => {
    const html = []

    Object.keys(json.question[direction]).forEach(key => {
      const span = []
      const [i, j] = getCoordsFromInitialState(key)
      const questionList = (direction === 'row' ? json.question.row : json.question.column)
      const answerLenList = (direction === 'row' ? boardInfo.answerLen.row : boardInfo.answerLen.column)
  
      for(let k = 0; k < answerLenList[key]; k++) {
        const [I, J] = (direction === 'row' ? [i, j + k] : [i + k, j])
        const type = boardInfo.squareInfo[`${I}-${J}`].type
        span.push(`<span data-type = ${type} 
                         data-coords = ${I}-${J}
                         data-val = ${type === 'const' ? json.initialState[I][J] : ''}>
                  </span>`)
      }
  
      html.push(`
        <div class = "question-tile" data-num = "${key}">
          <span>${key}.</span>
          <div>
            <div>${questionList[key]}</div>
            <div class = "keyword">
              ${span.join('')}
            </div>
          </div>
        </div>
      `)
    })

    document.querySelector(`.key-${direction}`).insertAdjacentHTML('beforeend', html.join(''))
  })
}

const focusSquare = (tdList, index, num) => {
  table.querySelectorAll('td[class|="focus"]').forEach(item => item.classList.remove('focus-both', 'focus-row', 'focus-column'))
  
  if(num) {
    const rowNum = boardInfo.answerLen.row[`${num}`] ? boardInfo.answerLen.row[`${num}`] : 0
    const columnNum = boardInfo.answerLen.column[`${num}`] ? boardInfo.answerLen.column[`${num}`] : 0
    
    if(rowNum) for(let i = 1; i < rowNum; i++) tdList[index + i].classList.add('focus-row')
    if(columnNum) {
      tdList[index].classList.add(rowNum ? 'focus-both' : 'focus-column')
      for(let i = 1; i < columnNum; i++) tdList[index + i * boardInfo.Wsize].classList.add('focus-column')
    } else {
      tdList[index].classList.add('focus-row')
    }
  }
}

const clickSquare = (num) => {
  const activeQuestion = document.querySelector('.active-question')
  activeQuestion.innerHTML = ''

  document.querySelectorAll(`.question-list .question-tile[data-num="${num}"]`).forEach(question => {
    const clone = question.cloneNode(true)
    clone.classList.add(question.parentNode.classList)
    activeQuestion.insertAdjacentElement('beforeend', clone)

    clone.addEventListener('click', () => question.click())
  })
}

const getCoordsFromInitialState = (val) => {
  for(const [i, row] of json.initialState.entries()) {
    for(const [j, square] of row.entries()) {
      if(square === val) return [i, j]
    }
  }
  console.error('Invalid argument.')
}

const showInputAnswerWindow = () => {
  const questionList = document.querySelector('.question-list')

  document.querySelectorAll('.question-tile').forEach(question => {
    question.addEventListener('click', (e) => {
      const num = question.querySelector('span').textContent
      const desc = question.querySelector('div > div').textContent
      const placeholder = []
      const coords = []

      noScroll()

      question.querySelectorAll('.keyword span').forEach(span => {
        const val = span.getAttribute('data-val')

        if(span.getAttribute('data-type') == 'const') {
          placeholder.push(val)
          coords.push('')
        } else {
          placeholder.push(val === '' ? '＿' : val)
          coords.push(span.getAttribute('data-coords'))
        }
      })

      const html = `
        <div class = "back">
          <form class = "input-window ${e.currentTarget.parentNode.classList}">
          <span>×</span>
            <div class = "question">
              <span>${num}</span>
              <div>${desc}</div>
            </div>
            <div class = "entry-field">
              <input type = "text" name = "${coords.join(',')}" autocomplete = "off" maxlength = "${coords.length}" pattern = "^[ぁ-んァ-ンヴーｦ-ﾝ]+$" placeholder = "${placeholder.join('')}">
            </div>
            <input type = "submit" value = "決定">
          </form>
        </div>
      `
      questionList.insertAdjacentHTML('afterend', html)
      if(document.querySelector('.entry-field input')) document.querySelector('.entry-field input').focus()

      document.querySelector('form').onsubmit = (e) => {
        e.preventDefault()
        const input = e.target.querySelector('input')
        const value = hiraganaToKatakana(input.value).split('')

        input.name.split(',').forEach((coords, index) => {
          if(coords) {
            const [i, j] = coords.split('-').map(index => Number.parseInt(index))
            tdList[i * boardInfo.Wsize + j].setAttribute('data-val', value[index] || '')
            document.querySelectorAll(`span[data-coords="${coords}"]`).forEach(span => span.setAttribute('data-val', value[index] || ''))
          }
        })
        e.target.parentNode.remove()
        allowScroll()
      }

      document.querySelector('.back').addEventListener('click', (e) => {
        if(e.target.classList.contains('back')) {
          document.querySelector('.back').remove()
          allowScroll()
        }
      })
      document.querySelector('.input-window > span').addEventListener('click', () => {
        document.querySelector('.back').remove()
        allowScroll()
      })
    })
  })
}

const noScroll = () => {
  document.addEventListener('touchmove', disableScroll, { passive: false })
  document.addEventListener('wheel', disableScroll, { passive: false })
  document.body.style.overflow = 'hidden'
}

const allowScroll = () => {
  document.removeEventListener('touchmove', disableScroll, { passive: false })
  document.removeEventListener('wheel', disableScroll, { passive: false })
  document.body.style.overflow = 'visible'
}

function disableScroll(e) {
  e.preventDefault()
}

const hiraganaToKatakana = (src) => {
  return src.replace(/[\u3041-\u3096]/g, match =>  {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}