(async() => {
  const squareSize = 60
  const data = await fetch('./data/puzzleData.json').then(res => res.json())

  const table = document.querySelector('table')
  const tbody = table.querySelector('tbody')
  const html = []

  table.style.width = data.initialState[0].length * squareSize + 'px'
  table.style.height = data.initialState.length * squareSize + 'px'

  for(const row of data.initialState) {
    html.push('<tr>')
    for(const item of row) {
      if(item === ' ') html.push('<td></td>')
      else if(item === 'b') html.push('<td class = "black"></td>')
      else if(isNaN(item)) html.push(`<td data-val = ${item}></td>`)
      else html.push(`<td data-num = ${item}></td>`)
    }
    html.push('</tr>')
  }

  table.insertAdjacentHTML('afterbegin', html.join(''))
})()