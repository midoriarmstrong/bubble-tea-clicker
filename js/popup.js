let trigger = document.getElementById('trigger');

chrome.storage.sync.get('color', function(data) {
  trigger.style.backgroundColor = data.color;
  trigger.setAttribute('value', data.color);
});

trigger.onclick = function(element) {
  let color = element.target.value;
  // window.location.pathname.match(/media\/.*\/fandoms/)
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: 'console.log("' + window.location.pathname + '");'});
    });
};
