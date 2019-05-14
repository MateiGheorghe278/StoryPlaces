document.addEventListener('keydown', function(event) {
  if (event.keyCode == 13) {
    submitDetails();
  }
});

function exportItem(url, data){
  postAjax(url, data, function(data){
    if(data != "null"){
      console.log(data);
      var jon = JSON.parse(data);
      window.location = '/a';
      // getAjax('/a', function(data){ console.log("done"); });
    }
    else {
      document.getElementById("usrNm").value = "";
      document.getElementById("pssWd").value = "";
      alert("Username and password not defined");
    }
  });
}

function submitDetails(){
  var username = document.getElementById("usrNm").value;
  var password = document.getElementById("pssWd").value;

  var user = UserToJSON(username, password);
  exportItem('/us', user);
}

function postAjax(url, data, success) {
  var params = typeof data == 'string' ? data : Object.keys(data).map(
          function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
      ).join('&');

  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  xhr.open('POST', url);
  xhr.onreadystatechange = function() {
      if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
  };
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(params);
  return xhr;
}

function getAjax(url, success) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
}

function UserToJSON(username, password){
  var textJSON = {
    "username":username,
    "password":password,
  };

  return textJSON;
}
