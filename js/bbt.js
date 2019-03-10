let botherUser = true;

const randInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const pressTea = () => {
    let bbt = document.getElementById('bubble-tea');
    bbt.style.display = 'none';

    let smallBBT = document.getElementById('mini-bubble-tea');
    smallBBT.style.display = 'block';

    botherUser = false;
    let count = document.querySelector('.bbt-clicker > .bbt-counter > span');

    let bothers = document.querySelectorAll('.bbt-message');
    for (box of bothers) {
      box.style.display = 'none';
    }

    // at 600 cookies, you need to click every second to avoid the message from popping up
    window.setInterval(function() {
      botherUser = true;
    }, parseInt(600000 / parseInt(count.innerHTML)));
}

const pressUpTea = (increment) => {
    let bbt = document.getElementById('bubble-tea');
    bbt.style.display = 'block';

    let smallBBT = document.getElementById('mini-bubble-tea');
    smallBBT.style.display = 'none';

    let count = document.querySelector('.bbt-clicker > .bbt-counter > span');
    if (increment) {
      count.innerHTML = parseInt(count.innerHTML) + 1;
    }
}

const bubbleAnimation = (bubbles) => {
    for (bubblesBox of bubbles) {
        let children = document.querySelectorAll('#' + bubblesBox.id + ' > .bubble');
        // Add 1-10 bubbles every second, unless there's already over 50 bubbles
        if (children.length <= 50) {
            let bubble = children[0];
            let numToAdd = randInt(1, 10);

            for (let i = 0; i < numToAdd; i++) {
                let newBubble = bubble.cloneNode();
                newBubble.style.bottom = randInt(0, bubblesBox.clientHeight - 15) + 'px';
                newBubble.style.right = randInt(0, bubblesBox.clientWidth - 15) + 'px';
                bubblesBox.appendChild(newBubble);
            }
        }

       children = document.querySelectorAll('#' + bubblesBox.id + ' > .bubble');
        // Remove 1-5 bubbles every second, unless there's less than 5 bubbles
        if (children.length > 5) {
            let numToRemove = randInt(1, 5);
            for (let i = 0; i < numToRemove; i++) {
                let nodeID = randInt(0, children.length - 1);
                children[nodeID].remove();
                children = document.querySelectorAll('#' + bubblesBox.id + ' > .bubble');
            }
        }
    }
}

const syncBBTCount = () => {
  let count = document.querySelector('.bbt-clicker > .bbt-counter > span');

  chrome.storage.sync.get('bbtCount', function(result) {
    let realNum;
    let storedCount = parseInt(result['bbtCount'] || 0);
    if (storedCount > parseInt(count.innerHTML)) {
      realNum = storedCount;
    } else {
      realNum = count.innerHTML;
    }

    if (storedCount !== parseInt(count.innerHTML)) {
      count.innerHTML = realNum;
      chrome.storage.sync.set({"bbtCount": realNum});
    }
  });
}

const addNewBother = () => {
  let msgbox = document.querySelector('.bbt-clicker > .bbt-message');

  let body = document.querySelector('body');
  let newmsg = msgbox.cloneNode(true);
  newmsg.style.position = 'fixed';
  let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  newmsg.style.bottom = randInt(0, height) + 'px';
  newmsg.style.left = randInt(0, width) + 'px';
  newmsg.id = '';
  newmsg = body.appendChild(newmsg);
  newmsg.onclick = addNewBother;
}

const bother = () => {
  let msgbox = document.querySelector('.bbt-clicker > .bbt-message');
  if (msgbox.style.display === 'none' || !msgbox.style.display) {
    let bothers = document.querySelectorAll('.bbt-message');
    for (box of bothers) {
      box.style.display = 'block';
    }
    return;
  }

  addNewBother();
}

const checkToBother = () => {
  if (botherUser) {
    bother();
  }
}

let prices = {
  1: 250,
  10: 500,
  1000: 1000
}
const removeAlert = (num) => {
  chrome.storage.sync.get('bbtCount', function(result) {
    let storedCount = parseInt(result['bbtCount'] || 0);
    let price = prices[num];
    if (price <= storedCount) {
      let msgbox = document.querySelectorAll('.bbt-message');
      for (msg of msgbox) {
        if (msg.id === 'orig-bbt-message') {
          msg.style.display = 'none';
        } else {
          msg.remove();
        }

        num--;
        if (num === 0) {
          break;
        }
      }

      let numLeft = parseInt(storedCount - price);
      chrome.storage.sync.set({"bbtCount": numLeft});
      let count = document.querySelector('.bbt-clicker > .bbt-counter > span');
      count.innerHTML = numLeft;
    } else {
      alert("You don't have enough. Adding another message as punishment.");
      addNewBother();
    }
  });
}

$.get(chrome.runtime.getURL('bbt.html'), function(data) {
    $($.parseHTML(data)).appendTo('body');
    document.getElementById('bubble-tea').addEventListener('pointerdown', pressTea, false);
    document.querySelector('.bbt-message').onclick = addNewBother;

    document.getElementById('remove1').onclick = function() {
      removeAlert(1);
    }

    document.getElementById('remove100').onclick = function() {
      removeAlert(100);
    }

    document.getElementById('remove1000').onclick = function() {
      removeAlert(1000);
    }

    let miniBBT = document.getElementById('mini-bubble-tea');
    miniBBT.addEventListener('pointerup', function() {
      pressUpTea(false);
    }, false);
    miniBBT.addEventListener('pointerleave', pressUpTea, false);

    chrome.storage.sync.get('bbtCount', function(result) {
      let count = document.querySelector('.bbt-clicker > .bbt-counter > span');
      count.innerHTML = parseInt(result['bbtCount'] || 0);
    });

    let bubbles = document.querySelectorAll('.bubble-tea .bubbles');
    window.setInterval(function() {
        bubbleAnimation(bubbles);
    }, 1000);

    window.setInterval(function() {
      syncBBTCount();
    }, 5000);

    window.setInterval(function() {
      checkToBother();
    }, 10000);
});
