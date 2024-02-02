function getSubtasksText() {
  const title = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]').innerText;
  const parentDiv = document.querySelector('[data-testid="issue.issue-view.views.common.child-issues-panel.issues-container"]');
  if (parentDiv) {
    const cardsTexts = []
    const ulElements = parentDiv.querySelectorAll('ul');
    ulElements.forEach(function (ulElement) {
      const divElements = ulElement.querySelectorAll(':scope > div');
      divElements.forEach(function (divElement) {
        const aElement = divElement.getElementsByTagName('a')[0]
        const parentSpan = divElement.querySelector('[data-testid="issue-field-summary.ui.inline-read.link-item--primitive--container"]');
        const text = parentSpan.getElementsByTagName('span')[0].innerText
        cardsTexts.push(aElement.innerText + ' ' + text);
      });
    });
    return {
      title,
      subtasks: cardsTexts.join('\n')
    };
  } else {
    alert("Parent div not found");
  }
}

document.getElementById('copy-subtasks').addEventListener('click', async (event) => {
  event.preventDefault();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getSubtasksText
  }).then((res) => {
    const result = res[0].result;
    if (!result) return
    document.getElementById('title').value = result.title;
    document.getElementById('content').innerHTML = result.subtasks;
    chrome.storage.local.set({ 'subtasks': result.subtasks, 'title': result.title });
    document.getElementById('copy').className = 'hide';
    document.getElementById('mr-data').className = 'show';
  });
});

function isModalOpen() {
  const isModalOpen = document.querySelectorAll('[id=jira-issue-header]')
  return !!isModalOpen.length
}
document.addEventListener('DOMContentLoaded', async function () {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: isModalOpen,
  }).then((res) => {
    const result = res[0].result;
    if (!result) return
    document.getElementById('alert').className = 'hide';
    document.getElementById('copy').className = 'flex';
  });

  chrome.storage.local.get(['subtasks', 'title'], function (result) {
    if (!result.title || !result.subtasks) return
    document.getElementById('alert').className = 'hide';
    document.getElementById('title').value = result.title;
    document.getElementById('content').innerHTML = result.subtasks;
    document.getElementById('copy').className = 'hide';
    document.getElementById('mr-data').className = 'show';
  });
});

function paste(title, subtasks) {
  const titleEl = document.querySelector('[name="merge_request[title]"]');
  const descriptionEl = document.querySelector('[name="merge_request[description]"]');
  titleEl.value = title;
  descriptionEl.value = subtasks.replace(/\n/g, '<br>\n') + '<br><br>\n\n' + descriptionEl.value;
}

document.getElementById('paste').addEventListener('click', async (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: paste,
    args: [title, content]
  })
});

document.getElementById('clean').addEventListener('click', async (event) => {
  event.preventDefault();
  chrome.storage.local.clear();
  document.getElementById('title').value = '';
  document.getElementById('content').innerHTML = '';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: isModalOpen,
  }).then((res) => {
    const result = res[0].result;
    if (!result) {
      document.getElementById('alert').className = 'flex';
    } else {
      document.getElementById('copy').className = 'flex';
    }
  });
  document.getElementById('mr-data').className = 'hide';
});


