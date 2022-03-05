let algorithm = {
  async bubble() {
    for (let i = data.length; i >= 0; i--) {
      let swapped = false;
      for (let j = 0; j < i - 1; j++) {
        await data.highlight(j, j + 1);
        if (data[j] > data[j + 1]) {
          await data.swap(j, j + 1);
          swapped = true;
        }
      }
      if (!swapped) return;
    }
  },

  async selection() {
    let left = 0,
      right = data.length - 1;
    while (left < right) {
      let j = left;
      for (let i = left; i <= right; i++) {
        if (data[j] > data[i]) {
          j = i;
        }

        await data.highlight(left, i, j);
      }
      if (j) {
        await data.swap(left, j);
      }
      left++;

      j = right;
      for (let i = right; i >= left; i--) {
        if (data[i] > data[j]) {
          j = i;
        }

        await data.highlight(right, i, j);
      }
      if (j) {
        await data.swap(j, right);
      }
      right--;
    }
  },

  async quick(start = 0, end = data.length - 1) {
    let p = start;
    for (let i = start + 1; i <= end; i++) {
      await data.highlight(p, i);

      if (data[i] < data[p]) {
        await data.insert(i, p);
        p++;
      }
    }

    if (start < p - 1) {
      await this.quick(start, p - 1);
    }
    if (p < end - 1) {
      await this.quick(p + 1, end);
    }
  },

  async insert() {
    for (let i = 1; i < data.length; i++) {
      let j = i - 1,
        k = i;
      await data.highlight(j, k);

      while (j >= 0 && data[k] < data[j]) {
        await data.highlight(j, k);

        await data.insert(k, j);
        k = j;
        j--;
      }
    }
  },

  async merge(left = 0, right = data.length - 1) {
    if (left === right) return;

    let middle = left + Math.floor((right - left) / 2);
    await this.merge(left, middle);
    await this.merge(middle + 1, right);

    middle++;
    while (left <= middle && middle <= right) {
      await data.highlight(left, middle);

      if (data[left] > data[middle]) {
        await data.insert(middle, left);
        middle++;
      }
      left++;
    }
  },

  async heap() {
    let maxHeap = async (i, length) => {
      let l = 2 * i + 1,
        r = 2 * i + 2;
      if (l >= length) return;

      let max = r < length && data[l] <= data[r] ? r : l;
      await data.highlight(i, max);

      if (data[i] < data[max]) {
        await data.swap(i, max);
        await maxHeap(max, length);
      }
    };

    let length = data.length;
    // Create a max heap
    for (let i = Math.floor(length / 2) - 1; i >= 0; i--) {
      await maxHeap(i, length);
    }
    for (let i = length - 1; i >= 0; i--) {
      // Move the maximum number to the end
      await data.swap(0, i);
      // Heap sorting the remaining numbers
      await maxHeap(0, i);
    }
  },
};

let init = (_) => {
  // Get HTML elements
  let containerNode = document.querySelector('#sortingBarContainer');
  let startNode = document.querySelector('#start');
  let stopNode = document.querySelector('#stop');
  let shuffleNode = document.querySelector('#shuffle');
  let algorithmNode = document.querySelector('#algorithm');
  let amountNode = document.querySelector('#amount');
  let speedNode = document.querySelector('#speed');

  // Changes the speed of the animation in head→style
  // If not present, then creates new style element
  let setSpeed = (speed) => {
    data.setSpeed(speed);
    let style = document.querySelector('style#transition-duration');
    if (!style) {
      style = document.createElement('style');
      style.id = 'transition-duration';
      document.head.appendChild(style);
    }
    style.innerText = `#sortingBarContainer li {transition-duration: ${speed / 1000}s};`;
  };

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
      .then(function (v) {
        data.removeHighlight();
      })
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

function swap(arr, xp, yp) {
  var temp = arr[xp];
  arr[xp] = arr[yp];
  arr[yp] = temp;
}

function bubbleSort(arr) {
  let i,
    j,
    n = arr.length;
  for (i = 0; i < n - 1; i++)
    for (j = 0; j < n - i - 1; j++)
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
      }
}

function selectionSort(arr) {
  let i,
    j,
    n = arr.length;
  for (i = 0; i < n - 1; i++) {
    let min = i;
    for (j = i + 1; j < n; j++) if (arr[j] < arr[min]) min = j;
    swap(arr, i, min);
  }
}

function insertionSort(arr) {
  let i,
    j,
    n = arr.length;
  for (i = 1; i < n; i++) {
    let key = arr[i];
    j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
}
function mergeSort(arr) {
  let n = arr.length;
  if (n < 2) return;
  let mid = Math.floor(n / 2);
  let left = arr.slice(0, mid);
  let right = arr.slice(mid);
  mergeSort(left);
  mergeSort(right);
  merge(left, right, arr);
}
function merge(left, right, arr) {
  let i = 0,
    j = 0,
    k = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      arr[k] = left[i];
      i++;
    } else {
      arr[k] = right[j];
      j++;
    }
    k++;
  }
  while (i < left.length) {
    arr[k] = left[i];
    i++;
    k++;
  }
  while (j < right.length) {
    arr[k] = right[j];
    j++;
    k++;
  }
}

function quickSort(origArray) {
  if (origArray.length <= 1) {
    return origArray;
  } else {
    var left = [];
    var right = [];
    var newArray = [];
    var pivot = origArray.pop();
    var length = origArray.length;

    for (var i = 0; i < length; i++) {
      if (origArray[i] <= pivot) {
        left.push(origArray[i]);
      } else {
        right.push(origArray[i]);
      }
    }
    return newArray.concat(quickSort(left), pivot, quickSort(right));
  }
}

var array_length;
function heap_root(input, i) {
  var left = 2 * i + 1;
  var right = 2 * i + 2;
  var max = i;

  if (left < array_length && input[left] > input[max]) {
    max = left;
  }

  if (right < array_length && input[right] > input[max]) {
    max = right;
  }

  if (max != i) {
    swap(input, i, max);
    heap_root(input, max);
  }
}

function swap(input, index_A, index_B) {
  var temp = input[index_A];

  input[index_A] = input[index_B];
  input[index_B] = temp;
}

function heapSort(input) {
  array_length = input.length;
  for (var i = Math.floor(array_length / 2); i >= 0; i -= 1) {
    heap_root(input, i);
  }

  for (i = input.length - 1; i > 0; i--) {
    swap(input, 0, i);
    array_length--;

    heap_root(input, 0);
  }
}

// calculate time between function calls
function timeBetween(func, args) {
  let start = Date.now();
  func(args);
  let end = Date.now();
  return end - start;
}
const sortFunctions = [
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort
];

function getRandomArray() {
  // inputArray = input.value.split(',').map(v => parseInt(v)).filter(v => !isNaN(v));
  return new Array(2500).fill(0).map(() => Math.floor(Math.random() * 1000) + 1);
}

let myChartArea = document.getElementById('graphRegion');
let myChart;
const sortings = [
  'Bubble',
  'Insertion',
  'Selection',
  'Quick',
  'Merge',
  'Heap',
];

const chartData = {
  labels: sortings,
  datasets: [
    {
      label: 'Time',
      backgroundColor: 'rgb(0, 99, 132)',
      borderColor: 'rgb(0, 99, 132)',
      data: [0, 0, 0, 0, 0, 0],
      stack: 'Stack 1',
      pointStyle: 'circle',
      pointRadius: 6,
    },
    {
      label: 'Space',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: [0, 0, 0, 0, 0, 0],
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
  return `${label} Complexity : ${sortingCasesTooltip[tooltipFunctionCall](tooltipItems[0].dataIndex)}`;
}

function plotChart() {
  const config = {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Time - Space Sorting comparison graph',
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

  myChart = new Chart(myChartArea, config);
}

plotChart();

function switchActiveSortingCase(current) {
  document.getElementById('active').id = '';
  current.id = 'active';
  updateNumberOfElements(Number($("#rangeInput").val()));
}
const sortingCases = {
  average: [
    (n) => n * n,
    (n) => n * n,
    (n) => n * n,
    (n) => n * Math.log(n),
    (n) => n * Math.log(n),
    (n) => n * Math.log(n)
  ],
  worst: [
    (n) => n * n,
    (n) => n * n,
    (n) => n * n,
    (n) => n * n,
    (n) => n * Math.log(n),
    (n) => n * Math.log(n)
  ],
  best: [
    (n) => n,
    (n) => n,
    (n) => n * n,
    (n) => n * Math.log(n),
    (n) => n * Math.log(n),
    (n) => n * Math.log(n)
  ]
}
const sortingCasesTooltip = {
  average: function (i) {
    switch (true) {
      case i < 3: return 'O(n^2)';
      case i >= 3: return 'O(log n)';
    }
  },
  worst: function (i) {
    switch (true) {
      case i < 4: return 'O(n^2)';
      case i >= 4: return 'O(log n)';
    }
  },
  best: function (i) {
    switch (true) {
      case i < 2: return 'O(n)';
      case i == 2: return 'O(n^2)';
      case i > 2: return 'O(log n)';
    }
  },
  space: function (i) {
    switch (true) {
      case (i < 3 || i==5): return 'O(1)';
      case i == 3: return 'O(log n)';
      case i == 4: return 'O(n)';
    }
  }
}
const spaceComplexity = [
  (n) => 1,
  (n) => 1,
  (n) => 1,
  (n) => Math.log(n),
  (n) => n,
  (n) => 1
];

let time = [0, 0, 0, 0, 0, 0];
let space = [0, 0, 0, 0, 0, 0];

function getChartData(numberOfElements) {
  const caseFunc = sortingCases[$("#active").attr('data-case')];
  for (let i = 0; i < sortings.length; i++) {
    time[i] = Math.round(caseFunc[i](numberOfElements));
    space[i] = spaceComplexity[i](numberOfElements);
  }
}
function updateChart() {
  myChart.data.datasets[0].data = time;
  myChart.data.datasets[1].data = space;
  myChart.update();
}

function updateNumberOfElements(value) {
  $("#numberOfElements").html(value);
  getChartData(Number(value));
  updateChart();
}