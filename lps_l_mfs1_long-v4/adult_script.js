const land_vars = {
  email: '',
  click_id: '',
};
const url = new URL(window.location.href);
const thank_url = get_thank(url);
let is_send = false;

const history_url = 'https://sql.yourfantasys.com/apps/history';

function getURLParameters(url) {
  url = url.split('?')[1];
  let params = {};
  if (url) {
    var paramsArray = url.split('&');
    for (var i = 0; i < paramsArray.length; i++) {
      var param = paramsArray[i].split('=');
      var paramName = decodeURIComponent(param[0]);
      var paramValue = decodeURIComponent(param[1]);
      params[paramName] = paramValue;
      land_vars[paramName] = paramValue;
    }
  }
  return params;
}

function get_thank(url) {
  let raw_url = url.origin + url.pathname;
  return raw_url.substring(0, raw_url.lastIndexOf('/')) + '/thank.html';
}

function get_link() {
  const trackId = url.searchParams.get('track_id');
  const clickId = url.searchParams.get('click_id');
  const offer = url.searchParams.get('offer');
  const email = url.searchParams.get('email');
  const campId = url.searchParams.get('camp_id');
  const banId = url.searchParams.get('ban_id');

  land_vars.offer = offer;
  land_vars.track_id = trackId;
  land_vars.click_id = clickId;
  land_vars.email = email;
  land_vars.campId = campId;
  land_vars.banId = banId;

  if (offer && trackId === null) {
    let currentURL = window.location.href;
    let params = getURLParameters(currentURL);
    land_vars.url_params = params;
    land_vars.raw_url_params = currentURL.split('?')[1];

    return 'https://forlands.xyz/api/flow/v2/buying/';
  } else if (trackId) {
    return 'https://forlands.xyz/api/flow/v2/land/';
  } else {
    return null;
  }
}

const pxl_link = get_link();

const processTab = (redirect, monet_redirects) => {
  console.log(redirect);
  console.log(monet_redirects);

  if (monet_redirects.length > 1) {
    let last_monet = monet_redirects.pop();
    for (let r of monet_redirects) {
      window.open(r, '_blank');
    }
    setTimeout(function () {
      window.open(redirect, '_blank').focus();
      location.href = last_monet;
    }, 200);
  } else if (monet_redirects.length == 1) {
    let monet = monet_redirects[0];
    window.open(redirect, '_blank').focus();
    location.href = monet;
  } else {
    location.href = redirect;
  }
};

function getRequest() {
  console.log(land_vars);

  fetch(history_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(land_vars),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });

  fetch(pxl_link, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(land_vars),
  })
    .then((data) => data.json())
    .then((data) => {
      if (data.status === 'Success') {
        processTab(data.link, data.monet_links);
      } else {
        console.log(data.reason);
        window.location.href = thank_url;
      }
      console.log(data.status);
    })
    .catch((error) => {
      console.log(error);
      window.location.href = thank_url;
    });
}

function addFormSubmitListeners() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach((form) => {
    if (!form.dataset.listenerAdded) {
      form.addEventListener('submit', (event) => {
        console.log('event submit');
        event.preventDefault();

       
        const clickableElement = form.querySelector('[data-click-id]');

       
        if (clickableElement) {
          land_vars.click_id = clickableElement.getAttribute('data-click-id');
        }

        let formData = new FormData(form);
        formData.forEach(function (value, key) {
          land_vars[key] = value;
        });

        if (is_send) {
          console.log('Form already send');
        } else {
          is_send = true;
          getRequest();
        }
      });

      form.dataset.listenerAdded = 'true'; 
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  addFormSubmitListeners(); 

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        addFormSubmitListeners(); 
      }
    });
  });

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config); 
});

