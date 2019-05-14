function createStory(){
  var ul = document.getElementById("uList");
  var li = document.createElement("li");

  var div = document.createElement("div");
  var title = document.createElement("h3");
  var tit = document.createTextNode("Title of the story");

  var date = document.createElement("span");
  var dat = document.createTextNode("Last modified:");

  div.addEventListener('click', function (event) {
     window.location = '/b';
  });

  li.className = 'logo';
  div.className = 'listItem';

  title.appendChild(tit);
  date.appendChild(dat);

  div.appendChild(title);
  div.appendChild(date);

  li.appendChild(div);
  ul.appendChild(li);
}
