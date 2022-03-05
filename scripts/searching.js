const getSearchElement = () => Number($('#searchingInput').val());
const writeSearchMessage = (text) => $('#searchResultInfo').html(text);
let isSortedAlready = false;

function getBoldSpan(text) {
  return `<span class="bold_text">${text}</span>`;
}

function showSearchResult(index, element) {
  if (index === null) {
    writeSearchMessage('Please Enter a valid positive number');
    return;
  }
  if (index === -1) {
    writeSearchMessage(`${getBoldSpan(element)} not found in the array`);
    data.removeHighlight();
  } else {
    writeSearchMessage(`${getBoldSpan(element)} found at index : ${getBoldSpan(index)}`);
  }
}

let algorithm = {
  async linear() {
    const value = getSearchElement();
    if (value <= 0) {
      showSearchResult(null, value);
      return;
    }
    let index = -1;
    for (let i = 0; i < data.length; i++) {
      writeSearchMessage(
        `Comparing ${getBoldSpan(value)} with ${getBoldSpan(data[i])} at index : ${getBoldSpan(i)}`,
      );
      await data.highlight(i);
      if (data[i] == value) {
        index = i;
        break;
      }
    }
    showSearchResult(index, value);
  },
  async sleepSort() {
    let j = 0;
    let container = data.getContainer();
    let children = data.getChildren();
    // if (children.length > 100) data.speed = 0;
    // Set a delay to have all 'setTimeout' start at the same time
    let willStartTime = new Date().getTime() + 100;
    for (let i = 0; i < data.length; i++) {
      let element = children[i];
      let timeDiff = willStartTime - new Date().getTime();
      setTimeout((_) => {
        if (data.isFrozen()) return;

        // play animation
        let liWidth = parseFloat(children[0].style.width);
        let targetPostion = children[j].style.left;
        for (let k = j; k < children.length; k++) {
          if (children[k] === element) {
            container.insertBefore(element, children[j]);
            element.style.left = targetPostion;
            break;
          }
          children[k].style.left = parseFloat(children[k].style.left) + liWidth + 'px';
        }
        j++;
      }, timeDiff + data[i] * 20);
    }
    data._isSortedAlready = true;
    return new Promise((resolve) => setTimeout(resolve, 400 * 20));
  },
  async binary() {
    const value = getSearchElement();
    if (value <= 0) {
      showSearchResult(null, value);
      return;
    }
    if(data._isSortedAlready === false){
      setSpeed(0);
      writeSearchMessage('Sorting the array for binary search');
      await this.sleepSort();
      setSpeed(document.querySelector('#speed').value * 10);
      writeSearchMessage('Sorting is done');
      await waitForOneSecond();
    }
    let left = 0;
    let right = data.length - 1;
    let mid = null;
    while (right >= left) {
      mid = left + Math.floor((right - left) / 2);
      writeSearchMessage(
        `Comparing mid : ${getBoldSpan(data[mid])} with ${getBoldSpan(value)} at index : ${getBoldSpan(
          mid,
        )}`,
      );
      await data.highlight(left, mid, right);
      // If the element is present at the middle
      // itself
      if (data[mid] == value) {
        showSearchResult(mid, value);
        return;
      }
      // If element is smaller than mid, then
      // it can only be present in left subarray
      if (data[mid] > value) right = mid - 1;
      // Else the element can only be present
      // in right subarray
      else left = mid + 1;
    }
    // We reach here when element is not
    // present in array
    showSearchResult(-1, value);
  },
  async interpolation() {
    const value = getSearchElement();
    if (value <= 0) {
      showSearchResult(null, value);
      return;
    }
    if(data._isSortedAlready === false){
      setSpeed(0);
      writeSearchMessage('Sorting the array for Interpolation search');
      await this.sleepSort();
      setSpeed(document.querySelector('#speed').value * 10);
      writeSearchMessage('Sorting is done');
      await waitForOneSecond();
    }
    let lo = 0;
    let hi = data.length - 1;
 
    // Since array is sorted, an element present
    // in array must be in range defined by corner
    while (lo <= hi && value >= data[lo] && value <= data[hi])
    {
        if (lo == hi)
        {
            if (data[lo] == value) showSearchResult(lo, value);
            else showSearchResult(-1, value);
            return;
        }
        // Probing the position with keeping
        // uniform distribution in mind.
        pos = lo + Math.floor(((hi - lo) / (data[hi] - data[lo])) * (value - data[lo]));;
          writeSearchMessage(
            `Comparing pos : ${getBoldSpan(data[pos])} with ${getBoldSpan(value)} at index : ${getBoldSpan(
              pos,
              )}`,
            );  
            await data.highlight(lo, pos, hi);
 
        // Condition of target found
        if (data[pos] == value)
            return showSearchResult(pos, value);
 
        // If value is larger, value is in upper part
        if (data[pos] < value)
            lo = pos + 1;
 
        // If value is smaller, value is in the lower part
        else
            hi = pos - 1;
    }
    showSearchResult(-1, value);
  },
};
function waitForOneSecond() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}
// Changes the speed of the animation in head→style
// If not present, then creates new style element
const setSpeed = (speed) => {
  data.setSpeed(speed);
  let style = document.querySelector('style#transition-duration');
  if (!style) {
    style = document.createElement('style');
    style.id = 'transition-duration';
    document.head.appendChild(style);
  }
  style.innerText = `#searchingBarContainer li {transition-duration: ${speed / 1000}s};`;
};

let init = (_) => {
  // Get HTML elements
  let containerNode = document.querySelector('#searchingBarContainer');
  let startNode = document.querySelector('#start');
  let stopNode = document.querySelector('#stop');
  let shuffleNode = document.querySelector('#shuffle');
  let algorithmNode = document.querySelector('#algorithm');
  let amountNode = document.querySelector('#amount');
  let speedNode = document.querySelector('#speed');

  data.init(containerNode);
  setSpeed(speedNode.value);
  data.render(parseInt(amountNode.value));

  // Play Button Event Listener
  startNode.addEventListener('click', (event) => {
    data.unfreeze();
    data.removeHighlight();

    startNode.disabled = true;
    startNode.classList.toggle('disable');
    let algo = algorithmNode.value;

    algorithm[algo]()
      .then(function (v) {})
      .catch((error) => {
        console.log('error : ' + error);
      })
      .finally((_) => {
        startNode.disabled = false;
        startNode.classList.toggle('disable');
      });
  });

  stopNode.addEventListener('click', (event) => {
    data.freeze();
  });

  algorithmNode.addEventListener('change', (event) => {
    data.freeze();
  });

  shuffleNode.addEventListener('click', (event) => {
    data.freeze();
    data.render(data.length);
  });

  speedNode.addEventListener('input', (event) => {
    setSpeed(parseInt(event.currentTarget.value));
  });

  amountNode.addEventListener('input', (event) => {
    let length = parseInt(event.currentTarget.value);
    data.render(length > 800 ? 800 : length);
  });

  $("#comparsionGraph").on('click', function () {
    $('.modal_popup').addClass('show');
    document.getElementById('active').click();
  });

  ((_) => {
    let sign = true,
      delay = 100;
    document.querySelector('#amount').addEventListener('keydown', (event) => {
      data.freeze();

      if (sign === false) return;
      if (event.key === 'ArrowUp') {
        let length = parseInt(event.currentTarget.value) + 10;
        if (length > 900) length = 900;
        event.currentTarget.value = length;
        data.render(length);

        sign = false;
        setTimeout((_) => (sign = true), delay);
      } else if (event.key === 'ArrowDown') {
        let length = parseInt(event.currentTarget.value) - 10;
        if (length < 0) length = 0;
        event.currentTarget.value = length;
        data.render(length > 900 ? 900 : length);

        sign = false;
        setTimeout((_) => (sign = true), delay);
      }
    });
  })();

  ((_) => {
    let sign = true,
      delay = 10;
    document.querySelector('#speed').addEventListener('keydown', (event) => {
      if (sign === false) return;

      if (event.key === 'ArrowUp') {
        let speed = parseInt(event.currentTarget.value) + 100;
        event.currentTarget.value = speed;
        setSpeed(speed);

        sign = false;
        setTimeout((_) => (sign = true), delay);
      } else if (event.key === 'ArrowDown') {
        let speed = parseInt(event.currentTarget.value) - 100;
        if (speed < 0) speed = 0;
        event.currentTarget.value = speed;
        setSpeed(speed);

        sign = false;
        setTimeout((_) => (sign = true), delay);
      }
    });
  })();
};
init();

let myChartArea = document.getElementById('graphRegion');

let myChart;
const searchings = [
    'Linear',
    'Binary',
    'Interpolation',
];

const chartData = {
    labels: searchings,
    datasets: [
      {
        label: 'Time',
        backgroundColor: 'rgb(0, 99, 132)',
        borderColor: 'rgb(0, 99, 132)',
        data: [0,0,0],
        stack: 'Stack 1',
        pointStyle: 'circle',
        pointRadius: 6,
      },
      {
        label: 'Space',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0,0,0],
        stack: 'Stack 2',
        pointStyle: 'circle',
        pointRadius: 6,
      },
    ],
};

const footer = (tooltipItems) => {
  let label = tooltipItems[0].dataset.label;
  let tooltipFunctionCall = "space";
  if(label === 'Time') tooltipFunctionCall = $("#active").attr('data-case');
  return `${label} Complexity : ${searchingCasesTooltip[tooltipFunctionCall][tooltipItems[0].dataIndex]}`;
}

function plotChart() {
  const config = {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Time - Space Searching comparison graph',
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            footer: footer,
          }
        }
      },
      responsive: true,
    },
  };
  
  myChart = new Chart(myChartArea,config);
}

plotChart();

function switchActiveSearchingCase(current){
    document.getElementById('active').id = '';
    current.id = 'active';
    updateNumberOfElements(Number($("#rangeInput").val()));
}

const searchingCases = {
    average: [
        (n) => n,
        (n) => Math.log(n),
        (n) => Math.log(Math.log(n)),
    ],
    worst: [
        (n) => n,
        (n) => Math.log(n),
        (n) => n
    ],
    best: [
        (n) => 1,
        (n) => 1,
        (n) => 1
    ]
}
const searchingCasesTooltip = {
  average: [
    'O(n)',
    'O(log n)',
    'O(log (log n))'
  ],
  worst: [
    'O(n)',
    'O(log n)',
    'O(n)'
  ],
  best: [
    'O(1)',
    'O(1)',
    'O(1)'
  ],
  space: [
    'O(1)',
    'O(1)',
    'O(1)'
  ]
}

let time = [0,0,0];
let space = [0,0,0];

function getChartData(numberOfElements){
    const caseFunc = searchingCases[$("#active").attr('data-case')];
    for(let i = 0; i < searchings.length; i++){
        time[i] = Math.round(caseFunc[i](numberOfElements));
        space[i] = 1;
    }
}
function updateChart() {
    myChart.data.datasets[0].data = time;
    myChart.data.datasets[1].data = space;
    myChart.update();
}

function updateNumberOfElements(value){
    $("#numberOfElements").html(value);
    getChartData(Number(value));
    updateChart();
}