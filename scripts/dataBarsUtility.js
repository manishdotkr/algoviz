let data = {
    _sleep(millisecond) {
      return new Promise((resolve) => setTimeout(resolve, millisecond));
    },
    _isSortedAlready : false,
    _container: null,
    getContainer() {
      return this._container;
    },
  
    _children: null,
    getChildren() {
      return this._children;
    },
  
    _freeze: false,
    freeze() {
      this._freeze = true;
    },
    unfreeze() {
      this._freeze = false;
    },
    isFrozen() {
      return this._freeze;
    },
  
    _speed: 50,
    getSpeed() {
      return this._speed;
    },
    setSpeed(millisecond) {
      this._speed = millisecond;
    },
  
    get length() {
      return this._children.length;
    },
    set length(value) {
      throw 'Cannot set length';
    },
  
    async swap(i, j) {
      let container = this._container,
        children = this._children;
  
      if (i > j) [i, j] = [j, i];
      let elementI = children[i];
      let elementJ = children[j];
      let afterElementOfJ = children[j].nextElementSibling;
  
      // swap element
      container.insertBefore(elementJ, elementI);
      container.insertBefore(elementI, afterElementOfJ);
  
      // play animation
      // forced reflow
      container.offsetHeight;
      [elementI.style.left, elementJ.style.left] = [elementJ.style.left, elementI.style.left];
  
      await this._sleep(this._speed);
    },
  
    async insert(i, target) {
      if (i === target) return;
  
      let container = this._container,
        children = this._children;
      let elementI = children[i];
      let elementTarget = children[target];
      let elementTargetPrev = elementTarget.previousElementSibling;
  
      container.insertBefore(children[i], children[target]);
  
      // play animation
      let liWidth = parseFloat(children[0].style.width);
      // forced reflow
      container.offsetHeight;
  
      let targetPostion;
      if (target < i) {
        targetPostion = elementTarget.style.left;
        for (let j = target + 1; j <= i; j++) {
          let left = parseFloat(children[j].style.left);
          children[j].style.left = left + liWidth + 'px';
        }
      } else {
        targetPostion = elementTargetPrev.style.left;
        for (let j = i; j < target - 1; j++) {
          let left = parseFloat(children[j].style.left);
          children[j].style.left = left - liWidth + 'px';
        }
      }
      elementI.style.left = targetPostion;
  
      await this._sleep(this._speed);
    },
  
    _highlightNodes: [],
    removeHighlight() {
      while (this._highlightNodes.length) {
        let node = this._highlightNodes.shift();
        node.classList.remove('highlightBar');
      }
    },
    async highlight(...nodes) {
      this.removeHighlight();
      nodes.forEach((i) => {
        if (i < 0 || i >= this.length) return;
        this._children[i].classList.add('highlightBar');
        this._highlightNodes.push(this._children[i]);
      });
  
      await this._sleep(this._speed);
    },
  
    render(amount) {
      let container = this._container;
  
      container.innerHTML = '';
      // Reduces the height by 20 to accomodate the calculation
      let containerHeight = parseInt(getComputedStyle(container, null).height) - 20;
      let Width = parseInt(getComputedStyle(container, null).width);
      let liWidth = Width / amount;
      let liBoardRadius = liWidth / 2;
  
      // Color Variables
      let colorStart = 'rgb(224, 17, 113)'.match(/\d+/g).map(Number);
      let colorEnd = 'rgb(15, 7, 102)'.match(/\d+/g).map(Number);
      let rDifference = (colorEnd[0] - colorStart[0]) / amount;
      let gDifference = (colorEnd[1] - colorStart[1]) / amount;
      let bDifference = (colorEnd[2] - colorStart[2]) / amount;
  
      let lis = [];
      for (let i = 0; i < amount; i++) {
        let li = document.createElement('li');
        let number =
          Math.round(((containerHeight - liBoardRadius) / amount) * i + liBoardRadius) + 20;
        li.number = number;
        li.style.height = number + 'px';
        li.style.width = liWidth + 'px';
        li.style.backgroundColor = `rgb(
                      ${Math.floor(colorStart[0] + rDifference * i)},
                      ${Math.floor(colorStart[1] + gDifference * i)},
                      ${Math.floor(colorStart[2] + bDifference * i)}
                  )`;
        // Assigning numbers to the bars
        let span = document.createElement('span');
        span.innerHTML = number;
        span.classList.add('list_data');
        let fontSize = liWidth <= 40 ? '1' : '1.3';
        fontSize = liWidth <= 30 ? '0.7' : fontSize;
        fontSize = liWidth <= 20 ? '0.5' : fontSize;
        fontSize = liWidth <= 16 ? '0' : fontSize;
        $(span).css('--font-unit', fontSize + 'em');
        li.appendChild(span);
        $(li).on('click', function () {
          let searchInput = $('#searchingInput');
          if(searchInput.length) searchInput.val(number);
        })
        lis.push(li);
      }
  
      lis.sort((_) => 0.5 - Math.random());
      lis.forEach((li, i) => {
        li.style.left = liWidth * i + 'px';
        container.appendChild(li);
      });
      data._isSortedAlready = false;
    },
  
    _init: false,
    isInit() {
      return this._init;
    },
    init(container) {
      if (!container || container.nodeType !== 1) throw `'container' must be an element`;
      this._container = container;
      this._children = container.children;
      this._init = true;
    },
  
    *[Symbol.iterator]() {
      for (let element of this.children) {
        yield element;
      }
    },
  };

  data = new Proxy(data, {
    get(target, propKey, receiver) {
      if (typeof propKey !== 'symbol' && /^\d+$/.test(propKey)) {
        if (target.isFrozen()) throw 'stop';
        return target._children[propKey].number;
      }
      return Reflect.get(target, propKey, receiver);
    },
  });