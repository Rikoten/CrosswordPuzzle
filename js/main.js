const squareSize = 60
const table = document.querySelector('table')
let json = '', Wsize = 0, Hsize = 0

;(async() => {
  json = await fetch('./data/puzzleData.json').then(res => res.json())

  // 盤面表示
  const tbody = table.querySelector('tbody')
  Wsize = json.initialState[0].length
  Hsize = json.initialState.length
  const html = []

  table.style.width = Wsize * squareSize + 'px'
  table.style.height = Hsize * squareSize + 'px'

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

  tbody.insertAdjacentHTML('afterbegin', html.join(''))

  // 盤面ホバーアクション
  const tdList = table.querySelectorAll('td')

  for(const td of tdList) {
    const index = [].slice.call(tdList).indexOf(td)
    const num = td.getAttribute('data-num')

    td.addEventListener('mouseover', () => {
      focusSquare(tdList, index, num)
    })

    td.addEventListener('click', () => {

    })
  }
})()

const displayQuestion = () => {

}

const focusSquare = (tdList, index, num) => {
  (table.querySelectorAll('td[class|="focus"]')).forEach(item => item.classList.remove('focus-both', 'focus-row', 'focus-column'))
  
  if(num) {
    const rowNum = json.answer.row[`${num}`] ? json.answer.row[`${num}`].length : 0
    const columnNum = json.answer.column[`${num}`] ? json.answer.column[`${num}`].length : 0
    
    if(rowNum) for(let i = 1; i < rowNum; i++) tdList[index + i].classList.add('focus-row')
    if(columnNum) {
      tdList[index].classList.add(rowNum ? 'focus-both' : 'focus-column')
      for(let i = 1; i < columnNum; i++) tdList[index + i * Wsize].classList.add('focus-column')
    } else {
      tdList[index].classList.add('focus-row')
    }
  }
}