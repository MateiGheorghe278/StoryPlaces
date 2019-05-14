var svgX = 0;
var svgY = 0;
var svgWidth = 100;
var svgHeight = 100;

var currentWidth = window.innerWidth;
var currentHeight = window.innerHeight;

function updateSvgViewBox(x, y, width, height){
  console.log("svg updated");
  svgX = x;
  svgY = y;
  svgWidth = width;
  svgHeight = height;
  return x + " " + y + " " + width + " " + height;
}

var svg = d3.select("#svgDiv")
            .append("svg")
            .attr("class", "svgPanel")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("viewBox", updateSvgViewBox(svgX, svgY, svgWidth, svgHeight))
            .attr("onload", "makeDraggable(evt)")

var selectedPage = null;
var selectedChapter = null;
var selectedOperator = null;

var PageList = [];
var ConnectionList = [];
var ChapterList = [];
var OperatorList = [];

var SelectionList = [];
var SelectableItemsList = [];
var ServerRequestList = [];

function makeDraggable(evt) {
  var trgt = evt.target;
  trgt.addEventListener('mousedown', startDrag);
  trgt.addEventListener('mousemove', drag);
  trgt.addEventListener('mouseup', endDrag);
  trgt.addEventListener('dblclick', doubleClick);
  document.addEventListener('keydown', keyDown);

  function keyDown(evt){
    //console.log(SelectionList.length);
    var keyCode = evt.keyCode;
    if(keyCode == 46){
      if(SelectionList.length > 0){
        for (var i = SelectionList.length - 1; i >= 0; i--){
            deletePage(SelectionList[i], i);
        }
      }
    }

    if(evt.ctrlKey && keyCode == 81){
      if(SelectionList.length == 2){
        if(SelectionList[0].pageID != null && SelectionList[1].pageID != null){
          createConnection(SelectionList[0], SelectionList[1], "unlock");
        }
        else{
          if(SelectionList[0].pageID != null && SelectionList[1].pageID == null){
            createOpConnection(SelectionList[0], SelectionList[1], "in", "unlock");
          }
          else if(SelectionList[1].pageID != null && SelectionList[0].pageID == null){
            createOpConnection(SelectionList[1], SelectionList[0], "in", "unlock");
          }
        }
      }
      else {
        alert("You can create a connection only between 2 pages");
      }
    }

    if(evt.ctrlKey && keyCode == 87){
      if(SelectionList.length > 0){
        generateChapterList();
      }
    }

    if(evt.shiftKey && keyCode == 81){
      if(SelectionList.length == 2){
        if(SelectionList[0].pageID != null && SelectionList[1].pageID == null){
          var type = SelectionList[1].type;
          if(type != null){
            console.log(type);
            createOpConnection(SelectionList[0], SelectionList[1], "out", type);
          }
          else {
            alert("Type unknown, please select pages in first!");
          }
        }
        else if(SelectionList[1].pageID != null && SelectionList[0].pageID == null){
          var type = SelectionList[0].type;
          if(type != null){
            console.log(type);
            createOpConnection(SelectionList[1], SelectionList[0], "out", type);
          }
          else {
            alert("Type unknown, please select pages in first!");
          }
        }
      }
    }

    if(evt.altKey && keyCode == 81){
      if(SelectionList.length == 2){
        if(SelectionList[0].pageID != null && SelectionList[1].pageID != null){
          createConnection(SelectionList[0], SelectionList[1], "lock");
        }
        else{
          if(SelectionList[0].pageID != null && SelectionList[1].pageID == null){
            createOpConnection(SelectionList[0], SelectionList[1], "in", "lock");
          }
          else if(SelectionList[1].pageID != null && SelectionList[0].pageID == null){
            createOpConnection(SelectionList[1], SelectionList[0], "in", "lock");
          }
        }
      }
    }
  }

  function doubleClick(evt){
    if (evt.target.classList.contains('draggable')){
      selectedElement = evt.target;

      removeExistingDiv();
      if(selectedElement.tagName.toLowerCase().localeCompare("rect") == 0){
        var elemID = selectedElement.id;
        if(elemID.charAt(0).localeCompare('p') == 0){
          selectedPage = findPage(selectedElement.id);
          createPageDiv(selectedPage);
        }
        else if(elemID.charAt(0).localeCompare('c') == 0){
          selectedChapter = findChapter(elemID);
          createChDiv(selectedChapter, "edit");
        }
      }
      else if(selectedElement.tagName.toLowerCase().localeCompare("circle") == 0){
        selectedOperator = findOperator(selectedElement.id);
        createOpDiv(selectedOperator);
      }
    }
  }

  function getMousePosition(evt) {
    var CTM = trgt.getScreenCTM();
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  }

  var offset, selectedElement, transform;
  var newX, newY;

  var box = null;

  function startDrag(evt) {
    offset = getMousePosition(evt);
    console.log(SelectionList.length);

    if (evt.target.classList.contains('draggable')) {
      selectedElement = evt.target;

      if(selectedElement.tagName.toLowerCase().localeCompare("rect") == 0){
        var elemID = selectedElement.id;
        if(elemID.charAt(0).localeCompare('p') == 0){
          selectedPage = findPage(elemID);
          if(selectedPage != null){
            if(SelectionList.length <= 1)
                resetStatus();
            selectedPage.changeSelectionStatus(true);
          }
        }
        else if(elemID.charAt(0).localeCompare('c') == 0){
          selectedChapter = findChapter(elemID);
        }

        offset.x -= parseFloat(selectedElement.getAttributeNS(null, "x"));
        offset.y -= parseFloat(selectedElement.getAttributeNS(null, "y"));
      }
      else if(selectedElement.tagName.toLowerCase().localeCompare("circle") == 0){
        selectedOperator = findOperator(selectedElement.id);

        offset.x -= parseFloat(selectedElement.getAttributeNS(null, "cx"));
        offset.y -= parseFloat(selectedElement.getAttributeNS(null, "cy"));
        if(selectedOperator != null){
          if(SelectionList.length <= 1)
              resetStatus();
          selectedOperator.changeSelectionStatus(true);
        }
      }
    } else {
      resetStatus();
      selectedPage = null;
      box = svg.append("rect")
               .attr("x", offset.x)
               .attr("y", offset.y)
               .attr("width", 0)
               .attr("height", 0)
               .style("stroke", "white")
               .style("stroke-width", 0.1);
    }
  }

  function drag(evt) {
    if(selectedElement || box != null){
      var coord = getMousePosition(evt);
      newX = coord.x - offset.x;
      newY = coord.y - offset.y;

      if (selectedElement) {
        if(selectedElement.tagName.toLowerCase().localeCompare("rect") == 0){
          var elemID = selectedElement.id;
          selectedElement.setAttributeNS(null, "x", newX);
          selectedElement.setAttributeNS(null, "y", newY);

          if(elemID.charAt(0).localeCompare('p') == 0){
            dragElements(selectedPage, newX, newY);
          }
          else if(elemID.charAt(0).localeCompare('c') == 0){
            dragElements(selectedChapter, newX, newY);
          }
        }
        else if(selectedElement.tagName.toLowerCase().localeCompare("circle") == 0){
          selectedElement.setAttributeNS(null, "cx", newX);
          selectedElement.setAttributeNS(null, "cy", newY);
          dragElements(selectedOperator, newX, newY);
        }
      }

      if (box != null){
        if(newX < 0 && newY > 0)
          setBoxAttributes(coord.x, offset.y, newX, newY);
        else if(newX > 0 && newY < 0)
          setBoxAttributes(offset.x, coord.y, newX, newY);
        else if(newX < 0 && newY < 0)
          setBoxAttributes(coord.x, coord.y, newX, newY);
        else
          setBoxAttributes(offset.x, offset.y, newX, newY);
      }
    }
  }

  function endDrag(evt) {
    selectedElement = null;
    var finalCoord = getMousePosition(evt);

    if (selectedPage == null){
      var dx = finalCoord.x - offset.x;
      var dy = finalCoord.y - offset.y;

      for (i = 0; i < SelectableItemsList.length; i++){
        var element = SelectableItemsList[i];

        if (dx <= 0 && dy >= 0){
          if(element.cx <= offset.x && element.cy >= offset.y &&
             element.cx >= finalCoord.x && element.cy <= finalCoord.y){
               element.changeSelectionStatus(true);
             }
        }

        else if (dx >= 0 && dy <= 0){
          if(element.cx >= offset.x && element.cy <= offset.y &&
             element.cx <= finalCoord.x && element.cy >= finalCoord.y){
               element.changeSelectionStatus(true);
             }
        }

        else if (dx <= 0 && dy <= 0){
          if(element.cx <= offset.x && element.cy <= offset.y &&
             element.cx >= finalCoord.x && element.cy >= finalCoord.y){
               element.changeSelectionStatus(true);
             }
        }

        else {
          if(element.cx >= offset.x && element.cy >= offset.y &&
            element.cx <= finalCoord.x && element.cy <= finalCoord.y){
              element.changeSelectionStatus(true);
            }
        }
      }
    }
    else {
      var chapter = isInsideChapter(selectedPage);
      if(chapter != null){
        if(chapter.ContentPages.has(selectedPage)){
          var off = setOffset(chapter, selectedPage);
          chapter.ContentPages.set(selectedPage, off);
        }
        else{
          chapter.addPage(selectedPage);
          chapter.setColourToPage(selectedPage);
        }
      }
    }
    selectedPage == null;
    selectedChapter == null;
    selectedOperator == null;

    svg.selectAll("rect[fill=none]").remove();
    box = null;
  }

  function setBoxAttributes(x, y, w, h){
   if(w < 0)
     w *= -1;

   if(h < 0)
     h *= -1;

   box.attr("x", x);
   box.attr("y", y);
   box.attr("width", w);
   box.attr("height", h);
   box.attr("fill", "none");
 }
}


function createPageDiv(page){
  var parent = document.getElementById('edit');
  var editDiv = document.createElement('div');

  var header = document.createElement('header');
  var invisibleDiv = document.createElement('div');
  invisibleDiv.className = 'invDiv';
  var content = document.createElement('div');

  var title = document.createElement('span');
  var titleLb = document.createElement('label');
  var closeBtn = document.createElement('span');

  var pageCntDiv = document.createElement('div');
  var pageCntLb = document.createElement('label');
  var pageCntInput = document.createElement('textarea');

  var nameDiv = document.createElement('div');
  var nameLb = document.createElement('label');
  var nameInput = document.createElement('input');

  nameDiv.className = 'subDiv';
  nameLb.innerHTML = 'Title: ';
  nameLb.className ='nameLabel';

  nameInput.className = 'titleText';
  nameInput.type = 'text';

  if (page.title.localeCompare("Default Title") == 0){
    nameInput.placeholder = 'Default Title';
  }
  else {
    nameInput.value = page.title;
  }

  nameDiv.appendChild(nameLb);
  nameDiv.appendChild(nameInput);
  content.appendChild(invisibleDiv);
  content.appendChild(nameDiv);

  pageCntDiv.className = 'subDiv';
  pageCntLb.innerHTML = "Page content: ";
  pageCntLb.className ='subLabel';

  pageCntInput.className = 'textArea2';
  pageCntInput.value = page.content;

  var UnlockedPages = mapToList(page.ChildPages, 'u');
  var LockedPages = mapToList(page.ChildPages, 'l');

  var UnlockedByPages = mapToList(page.ParentPages, 'u');
  var LockedByPages = mapToList(page.ParentPages, 'l');

  var nonChiU1 = arr_diff(page, PageList, UnlockedPages);
  var nonChiU2 = arr_diff(page, nonChiU1, LockedPages);

  var nonChiL1 = arr_diff(page, PageList, LockedPages);
  var nonChiL2 = arr_diff(page, nonChiL1, UnlockedPages);

  var nonPrU1 = arr_diff(page, PageList, UnlockedByPages);
  var nonPrU2 = arr_diff(page, nonPrU1, LockedByPages);

  var nonPrL1 = arr_diff(page, PageList, LockedByPages);
  var nonPrL2 = arr_diff(page, nonPrL1, UnlockedByPages);

  var chap = arr_diff(page, ChapterList, page.Chapters);
  var ChUnlocked = mapToList(page.ChildChapters, 'u');
  var ChLocked = mapToList(page.ChildChapters, 'l');

  var nonChU1 = arr_diff(page, ChapterList, ChUnlocked);
  var nonChU2 = arr_diff(page, nonChU1, ChLocked);

  var nonChL1 = arr_diff(page, ChapterList, ChLocked);
  var nonChL2 = arr_diff(page, nonChL1, ChUnlocked);

  var pPages = addSelectingHalfDiv(page, content, "Unlocked by: ", "Add page", nonPrU2, UnlockedByPages, "parents",
                                              "Locked By: ", nonPrL2, LockedByPages);
  var cPages = addSelectingHalfDiv(page, content, "Unlocks pages: ", "Add page", nonChiU2, UnlockedPages, "children",
                                                "Locks pages: ", nonChiL2, LockedPages);
  var chapters = addSelectingDiv(page, content, "Is part of following chapters: ", "Add chapter", page.Chapters, chap, "chapters");

  var ChildChs = addSelectingHalfDiv(page, content, "Unlocks Ch: ", "Select chapter", nonChU2, ChUnlocked, "chapters",
                                                "Locks Ch: ", nonChL2, ChLocked);

  editDiv.id = 'editPanel';
  editDiv.className = 'editDiv';
  title.className = 'title'

  titleLb.innerHTML = page.name;
  titleLb.className = 'titleLabel';
  title.slot = 'title';

  closeBtn.className = 'close';
  closeBtn.innerHTML = "X";
  closeBtn.onclick = function() {
    closePanel();
  };

  var btnDiv = document.createElement('div');
  var saveBtn = document.createElement('button');
  var cancelBtn = document.createElement('button');

  btnDiv.className = 'subDiv';
  saveBtn.className = 'saveBtn';
  cancelBtn.className = 'cancelBtn';

  saveBtn.innerHTML = "Save";
  cancelBtn.innerHTML = "Cancel";

  saveBtn.onclick = function(){ editSave(page, nameInput, pageCntInput); };
  cancelBtn.onclick = function(){ editCancel(); };

  btnDiv.appendChild(saveBtn);
  btnDiv.appendChild(cancelBtn);

  title.appendChild(titleLb);
  header.appendChild(title);
  header.appendChild(closeBtn);

  pageCntDiv.appendChild(pageCntLb);
  pageCntDiv.appendChild(pageCntInput);
  content.appendChild(pageCntDiv);

  editDiv.appendChild(header);
  editDiv.appendChild(content);
  editDiv.appendChild(btnDiv);
  parent.appendChild(editDiv);
}

function addSelectingDiv(page, content, lbMsg, message, list, nonList, section){
  var div = document.createElement('div');
  var lb = document.createElement('label');
  var cmb = document.createElement('select');
  var input = document.createElement('textarea');

  div.className = 'subDiv';
  lb.innerHTML = lbMsg;
  lb.className = 'subLabel';
  input.className = 'textArea';

  addOptions(cmb, nonList, message);
  input.value = writeOutput(list);

  cmb.addEventListener("change", function() {
    addLine(cmb, input, page, section, "");
  });

  div.appendChild(lb);
  div.appendChild(cmb);
  div.appendChild(input);
  content.appendChild(div);

  return input;
}

function addSelectingHalfDiv(page, content, lbMsg1, message, nonList1, list1, section,
                                        lbMsg2, nonList2, list2){
  var div1 = document.createElement('div');
  var div2 = document.createElement('div');
  var bigDiv = document.createElement('div');

  var lb1 = document.createElement('label');
  var lb2 = document.createElement('label');

  var cmb1 = document.createElement('select');
  var cmb2 = document.createElement('select');

  var input1 = document.createElement('textarea');
  var input2 = document.createElement('textarea');

  div1.className = 'subHalfDiv';
  div2.className = 'subHalfDiv2';
  bigDiv.className = 'subDiv';

  lb1.innerHTML = lbMsg1;
  lb1.className ='subLabel';
  lb2.innerHTML = lbMsg2;
  lb2.className ='subLabel';

  cmb1.className = 'editCmb';
  cmb2.className = 'editCmb';

  addOptions(cmb1, nonList1, message);
  addOptions(cmb2, nonList2, message);

  input1.className = 'textArea';
  input2.className = 'textArea';

  input1.value = writeOutput(list1);
  input2.value = writeOutput(list2);

  cmb1.addEventListener("change", function() {
    addLine(cmb1, input1, page, section, "unlock");
  });

  cmb2.addEventListener("change", function() {
    addLine(cmb2, input2, page, section, "lock");
  });

  div1.appendChild(lb1);
  div1.appendChild(cmb1);
  div1.appendChild(input1);

  div2.appendChild(lb2);
  div2.appendChild(cmb2);
  div2.appendChild(input2);

  bigDiv.appendChild(div1);
  bigDiv.appendChild(div2);

  content.appendChild(bigDiv);

  return input1;
}

function writeOutput(list){
  var output = "";
  if(list != null){
    for (i = 0; i < list.length; i++){
      output += list[i].name;
      output += '\n';
    }
  }

  return output;
}

function isInsideChapter(page){
  for (i = 0; i < ChapterList.length; i++){
    var chapter = ChapterList[i];
    if(page.x >= chapter.x && page.y >= chapter.y &&
        page.x + page.width <= chapter.x + chapter.width &&
        page.y + page.height <= chapter.y + chapter.height){
          return chapter;
    }
  }
  return null;
}

function addLine(cmb, input, item, section, type){
  var name = cmb.options[cmb.selectedIndex].text;
  var newItem = null;

  if (section.localeCompare("chapters") != 0){
    newItem = findPageByName(name);
  }
  else {
    newItem = findChapterByName(name);
  }

  if(newItem == null)
    return;

  input.value += name;
  input.value += '\n';

  if (section.localeCompare("chapters") != 0){
    if (section.localeCompare("parents") == 0){
      createConnection(newItem, item, type);
    }
    else if(section.localeCompare("children") == 0){
      createConnection(item, newItem, type);
    }
  }
  else {
    if(type.localeCompare("") != 0){
      createChConnection(item, newItem, type);
    }
    else{
      newItem.addPage(item);
      newItem.setColourToPage(item);
    }
  }
  Refresh(cmb, newItem.name);
}

function editSave(page, title, content){
  if(page == null){
    return;
  }

  page.title = title.value;
  page.content = content.value;

  page.updateRect();
  closePanel();
}

function editCancel(){
  closePanel();
}

function generateChapterList(){
  var parent = document.getElementById('edit');
  var editDiv = document.createElement('div');

  var header = document.createElement('header');
  var content = document.createElement('div');

  var invisibleDiv = document.createElement('div');
  invisibleDiv.className = 'invDiv';

  var title = document.createElement('span');
  var titleLb = document.createElement('label');
  var closeBtn = document.createElement('span');

  titleLb.innerHTML = "List of chapters: ";
  titleLb.className ='titleLabel';

  editDiv.id = 'editPanel';
  editDiv.className = 'chDiv';
  title.className = 'title'
  title.slot = 'title';

  closeBtn.className = 'close';
  closeBtn.innerHTML = "X";
  closeBtn.onclick = function() {
    closePanel();
  };

  var listDiv = document.createElement('div');
  var orList = document.createElement('ol');

  title.appendChild(titleLb);
  header.appendChild(title);
  header.appendChild(closeBtn);

  content.appendChild(invisibleDiv);

  editDiv.appendChild(header);
  editDiv.appendChild(content);

  parent.appendChild(editDiv);
  }

function addOptions(cmb, list, message){
  var def = document.createElement('option');
  def.disabled = true;
  def.selected = true;
  def.innerHTML = message;
  cmb.options[cmb.options.length] = def;

  if (list == null)
    return;

  for(i = 0; i < list.length; i++) {
    cmb.options[cmb.options.length] = new Option(list[i].name, i);
  }
}

function Refresh(cmb, removedItem){
  var options = cmb.options;
  var list = [];

  for (i = 0; i < options.length; i++)
    list[i] = options[i].text;

  var index = list.indexOf(removedItem);
  list.splice(index, 1);

  ClearOptions(cmb);
  for(i = 0; i < list.length; i++) {
    cmb.options[cmb.options.length] = new Option(list[i], i);
  }
}

function removeExistingDiv(){
  var existDiv = document.getElementById('editPanel');

  if(existDiv != null)
    existDiv.parentNode.removeChild(existDiv);
}

function ClearOptions(cmb){
  var length = cmb.options.length;
  for (i = length - 1; i >= 0; i--) {
    cmb.remove(i);
  }
}

function dragElements(element, newX, newY){
  if(element != null){
    element.updateCoordinates(newX, newY);

    if(element.connList.length > 0){
      updateExistingConnections(element);
    }
  }
}

function updateExistingConnections(element){
  for (var i = 0; i < element.connList.length; i++){
      updateConnection(element.connList[i]);
  }
}

function arr_diff (element, list1, list2) {
    var diff = [];
    if (list1 == null || list2 == null)
      return;

    var longer = list1.slice();
    var shorter = list2.slice();

    if(element != null){
      var index = longer.indexOf(element);
      if(index > -1)
        longer.splice(index, 1);
    }

    for (i = 0; i < shorter.length; i++){
      var index = longer.indexOf(shorter[i]);
      longer.splice(index, 1);
    }

    for (i = 0; i < longer.length; i++){
      diff[i] = longer[i];
    }

    return diff;
}

function elemToList(elem){
  var list = [];
  if(elem != null)
    list.push(elem);

  return list;
}

function mapToList(map, ch){
  var list = [];

  if(map.size > 0){
    for (const key of map.keys()){
      if(key.charAt(0).localeCompare(ch) == 0){
        var page = map.get(key);
        list.push(page);
      }
    }
  }

  return list;
}

function mapKeyList(map){
  var list = [];

  if(map.size > 0){
    for (const key of map.keys()){
      list.push(key);
    }
  }
  return list;
}

function mapValueList(map){
  var list = [];

  if(map.size > 0){
    for (const key of map.keys()){
      var page = map.get(key);
      list.push(page);
    }
  }
  return list;
}

function showPages(){
  var div = document.getElementById('shPages');
  clearDiv(div);

  for (i = 0; i < PageList.length; i++){
    var name = document.createElement('a');
    name.innerHTML = PageList[i].name;
    name.onclick = function() {
        var page = findPageByName(this.text);
        removeExistingDiv();
        createPageDiv(page);
      };

    div.appendChild(name);
  }
}

function showChapters(){
  var div = document.getElementById('shChapters');
  clearDiv(div);

  for (i = 0; i < ChapterList.length; i++){
    var name = document.createElement('a');
    name.innerHTML = ChapterList[i].name;
    name.onclick = function() {
        var chapter = findChapterByName(this.text);
        removeExistingDiv();
        createChDiv(chapter, "edit");
      };

    div.appendChild(name);
  }
}

function clearDiv(div){
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
}

function PageToJSON(page){
    if(page == null)
      return null;

    var jsonPage = {
      "pageID":page.pageID,
      "name":page.name,
      "pageNo":page.pageNo,
      "title":page.title,
      "content":page.content,
      "x":page.x,
      "y":page.y
    };
    return jsonPage;
}

function ChapterToJSON(chapter){
    var contentPages = mapKeyList(chapter.ContentPages);
    var parentPages = mapValueList(chapter.ParentPages);

    var jsonContent = PageIDList(contentPages);
    var jsonParent = PageIDList(parentPages);

    var jsonChapter = {
      "chapterID":chapter.chapterID,
      "name":chapter.name,
      "chapterNo":chapter.chapterNo,
      "title":chapter.title,
      "colour":chapter.colour,
      "childPages":jsonContent,
      "parentPages":jsonParent,
      "width":chapter.width,
      "height":chapter.height,
      "x":chapter.x,
      "y":chapter.y,
    };

    return jsonChapter;
}

function OperatorToJSON(operator){
    var pagesIn = PageIDList(operator.pagesIn);

    var pageOut = "";
    if(operator.pageOut != null)
      pageOut = operator.pageOut.pageID;

    var jsonOperator = {
      "operatorID":operator.operatorID,
      "name":operator.operatorName,
      "type":operator.type,
      "pagesIn":pagesIn,
      "pageOut":pageOut,
      "x":operator.cx,
      "y":operator.cy,
    };

    return jsonOperator;
}

function ConnectionToJSON(connection){
    var components = GetConnectionComponents(connection);
    var fromElement = components[0];
    var toElement = components[1];

    var jsonConnection = {
      "connectionID":connection.connectionID,
      "type":connection.type,
      "direction":connection.direction,
      "from":fromElement,
      "to":toElement,
    };

    return jsonConnection;
}

function GetConnectionComponents(connection){
  if(connection == null)
    return [];
  var elements = [];
  var id1, id2 = "";

  var connID = connection.connectionID;
  var connMark = connID.substring(0, 2);

  if(connMark.localeCompare('pg') == 0){
    id1 = connection.parentPage.pageID;
    id2 = connection.childPage.pageID;
  }else if(connMark.localeCompare('ch') == 0){
    id1 = connection.parentPage.pageID;
    id2 = connection.chapter.chapterID;
  }else if(connMark.localeCompare('op') == 0){
    id1 = connection.parentPage.pageID;
    id2 = connection.operator.operatorID;
  }

  elements.push(id1);
  elements.push(id2);

  return elements;
}

function PageIDList(list){
  var idList = [];

  for(i = 0; i < list.length; i++){
    var pgID = list[i].pageID;
    idList.push(pgID);
  }

  if(idList.length == 0){
    return "";
  }

  return idList;
}

function addPage(){
  page = new Page(PageList.length);
  PageList.push(page);
  SelectableItemsList.push(page);
}

function createChapter(){
  chapter = new Chapter(ChapterList.length);

  removeExistingDiv();
  createChDiv(chapter, "new");
}

function createOperator(){
  var cmb = document.getElementById("operatorCmb");
  var operatorName = cmb.options[cmb.selectedIndex].value;

  operator = new Operator(operatorName, OperatorList.length);
  OperatorList.push(operator);
  SelectableItemsList.push(operator);
}

function exportCollection(url, collection, count){
  console.log(url + "    " + collection.length);

  for(count = 0; count < collection.length; count++){
    var item = null;
    var id = null;

    if(url.localeCompare('/pg') == 0){
      item = PageToJSON(collection[count]);
      id = item.pageID;
    }
    else if(url.localeCompare('/ch') == 0){
      item = ChapterToJSON(collection[count]);
      id = item.chapterID;
    }
    else if(url.localeCompare('/op') == 0){
      item = OperatorToJSON(collection[count]);
      id = item.operatorID;
    }
    else if(url.localeCompare('/co') == 0){
      item = ConnectionToJSON(collection[count]);
      id = item.connectionID;
    }

    var n = ServerRequestList.includes(id);
    if(item != null && n == false){
      console.log("Sese: " + id);
      ServerRequestList.push(id);
      exportItem(url, item);
    }
    else {
      console.log("move on");
      break;
    }
  }

  if(count < collection.length - 1){
    console.log(url + " infinite loop warning");
  }
}

function exportItem(url, data){
  console.log("Now sending " + data.name);
  postAjax(url, data, function(){ console.log(url + " done"); });
  //postAjax2(url, data);
}

function exportStory(){
  exportCollection('/pg', PageList, 0);
  exportCollection('/op', OperatorList, 0);
  exportCollection('/ch', ChapterList, 0);
  exportCollection('/co', ConnectionList, 0);
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

function zoomTest(){
  if(currentWidth > window.innerWidth && currentHeight > window.innerHeight){
    console.log("zoom in");
    updateSvgViewBox(0, 0, svgWidth - 10, svgHeight - 10);
  }
  else if(currentWidth < window.innerWidth && currentHeight < window.innerHeight){
    console.log("zoom out");
    updateSvgViewBox(0, 0, svgWidth + 10, svgHeight + 10);
  }

  currentWidth = window.innerWidth;
  currentHeight = window.innerHeight;
}

function changeShapeStyle(status, shape){
  if(status){
    shape.style("stroke", "#e6e6e6");
    shape.style("stroke-width", 0.2);
  }
  else{
    shape.style("stroke", "#001a66");
    shape.style("stroke-width", 0.15);
  }
}

function createChDiv(chapter, status){
  var parent = document.getElementById('edit');
  var editDiv = document.createElement('div');

  var header = document.createElement('header');
  var content = document.createElement('div');

  var invisibleDiv = document.createElement('div');
  invisibleDiv.className = 'invDiv';

  var title = document.createElement('span');
  var titleLb = document.createElement('label');
  var closeBtn = document.createElement('span');

  titleLb.innerHTML = chapter.name;
  titleLb.className ='titleLabel';

  editDiv.id = 'editPanel';
  editDiv.className = 'chDiv';
  title.className = 'title'
  title.slot = 'title';

  closeBtn.className = 'close';
  closeBtn.innerHTML = "X";
  closeBtn.onclick = function() {
    chCancel();
  };

  var nameDiv = document.createElement('div');
  var nameLb = document.createElement('label');
  var nameInput = document.createElement('input');

  nameDiv.className = 'subDiv';
  nameLb.innerHTML = 'Title: ';
  nameLb.className ='nameLabel';

  nameInput.className = 'titleText';
  nameInput.type = 'text';

  if (chapter.title !== ""){
    nameInput.value = chapter.title;
  }
  else {
    nameInput.placeholder = 'Default Chapter';
  }

  var colourDiv = document.createElement('div');
  var colourLb = document.createElement('label');
  var colourInput = document.createElement('input');

  colourDiv.className = 'subDiv';
  colourLb.innerHTML = 'Colour: ';
  colourLb.className ='subLabel';
  colourInput.type = 'color';

  if(chapter.colour !== ""){
    colourInput.value = chapter.colour;
  }

  var btnDiv = document.createElement('div');
  var saveBtn = document.createElement('button');
  var cancelBtn = document.createElement('button');

  btnDiv.className = 'subDiv';
  saveBtn.className = 'saveBtn';
  cancelBtn.className = 'cancelBtn';

  saveBtn.innerHTML = "Save";
  cancelBtn.innerHTML = "Cancel";

  saveBtn.onclick = function(){ chSave(chapter, nameInput, colourInput, status); };
  cancelBtn.onclick = function(){ chCancel(); };

  title.appendChild(titleLb);
  header.appendChild(title);
  header.appendChild(closeBtn);

  nameDiv.appendChild(nameLb);
  nameDiv.appendChild(nameInput);
  content.appendChild(invisibleDiv);
  content.appendChild(nameDiv);

  colourDiv.appendChild(colourLb);
  colourDiv.appendChild(colourInput);
  content.appendChild(colourDiv);

  if(status.localeCompare("edit") == 0){
    var UnlockedByPages = mapToList(chapter.ParentPages, 'u');
    var LockedByPages = mapToList(chapter.ParentPages, 'l');

    var nonUList1 = arr_diff(null, PageList, UnlockedByPages);
    var nonUList2 = arr_diff(null, nonUList1, LockedByPages);

    var nonLList1 = arr_diff(null, PageList, LockedByPages);
    var nonLList2 = arr_diff(null, nonLList1, UnlockedByPages);

    addSelectingHalfChDiv(chapter, content, "Unlocked by: ", "Locked by: ", "Select pages", UnlockedByPages, LockedByPages, nonUList2, nonLList2, "pPages");
    addSelectingChDiv(chapter, content, "Add pages to chapter: ", "Select pages", PageList, "cPages");
  }

  btnDiv.appendChild(saveBtn);
  btnDiv.appendChild(cancelBtn);

  editDiv.appendChild(header);
  editDiv.appendChild(content);
  editDiv.appendChild(btnDiv);

  parent.appendChild(editDiv);
}

function addSelectingHalfChDiv(chapter, content, lbMsg1, lbMsg2, message, list1, list2, nonList1, nonList2, section){
  var div1 = document.createElement('div');
  var div2 = document.createElement('div');
  var div3 = document.createElement('div');

  var lb1 = document.createElement('label');
  var lb2 = document.createElement('label');

  var cmb1 = document.createElement('select');
  var cmb2 = document.createElement('select');

  var input1 = document.createElement('textarea');
  var input2 = document.createElement('textarea');

  div1.className = 'subHalfDiv';
  div2.className = 'subHalfDiv2'
  div3.className = 'subDiv';

  lb1.innerHTML = lbMsg1;
  lb2.innerHTML = lbMsg2;
  lb1.className ='subLabel';
  lb2.className ='subLabel';

  input1.className = 'textArea';
  input2.className = 'textArea';

  addOptions(cmb1, nonList1, message);
  addOptions(cmb2, nonList2, message);

  input1.value = writeOutput(list1);
  input2.value = writeOutput(list2);

  cmb1.addEventListener("change", function() {
    addPageToChapter(cmb1, input1, chapter, section, "unlock");
  });
  cmb2.addEventListener("change", function() {
    addPageToChapter(cmb2, input2, chapter, section, "lock");
  });

  div1.appendChild(lb1);
  div1.appendChild(cmb1);
  div1.appendChild(input1);

  div2.appendChild(lb2);
  div2.appendChild(cmb2);
  div2.appendChild(input2);

  div3.appendChild(div1);
  div3.appendChild(div2);
  content.appendChild(div3);
}

function addSelectingChDiv(chapter, content, lbMsg, message, list, section){
  var div = document.createElement('div');
  var lb = document.createElement('label');
  var cmb = document.createElement('select');
  var input = document.createElement('textarea');
  var nonList = [];

  var mapList = mapKeyList(chapter.ContentPages);
  var ss = arr_diff(null, PageList, mapList);
  nonList = ss;
  list = mapList;

  div.className = 'subDiv';
  lb.innerHTML = lbMsg;
  lb.className ='subLabel';
  input.className = 'textArea';

  addOptions(cmb, nonList, message);
  input.value = writeOutput(list);

  cmb.addEventListener("change", function() {
    addPageToChapter(cmb, input, chapter, section, "");
  });

  div.appendChild(lb);
  div.appendChild(cmb);
  div.appendChild(input);
  content.appendChild(div);

  return input;
}

function addPageToChapter(cmb, input, chapter, section, type){
  var name = cmb.options[cmb.selectedIndex].text;
  var newPage = findPageByName(name);

  input.value += name;
  input.value += '\n';

  if (section.localeCompare("cPages") == 0){
    chapter.addPage(newPage);
  }
  else {
    if(type.localeCompare("") != 0)
      chapter.addParentPage(newPage, type);
  }
  Refresh(cmb, newPage.name);
}

function chSave(chapter, titleInput, colourInput, status){
  if(chapter == null){
    return;
  }

  chapter.title = titleInput.value;
  chapter.colour = colourInput.value;

  if(status.localeCompare("new") == 0){
    chapter.createRectangle();
    ChapterList.push(chapter);
  }
  else{
    chapter.changeChapterColour();
  }

  var mapList = mapKeyList(chapter.ContentPages);
  for (i = 0 ; i < mapList.length; i++){
    chapter.setColourToPage(mapList[i]);
  }

  closePanel();
}

function chCancel(){
  closePanel();
}

function createOpDiv(operator){
  if(operator == null)
    return;

  var parent = document.getElementById('edit');
  var editDiv = document.createElement('div');

  var header = document.createElement('header');
  var content = document.createElement('div');

  var invisibleDiv = document.createElement('div');
  invisibleDiv.className = 'invDiv';

  var title = document.createElement('span');
  var titleLb = document.createElement('label');
  var closeBtn = document.createElement('span');

  titleLb.innerHTML = operator.name;
  titleLb.className ='titleLabel';

  editDiv.id = 'editPanel';
  editDiv.className = 'chDiv';
  title.className = 'title'
  title.slot = 'title';

  closeBtn.className = 'close';
  closeBtn.innerHTML = "X";
  closeBtn.onclick = function() {
    chCancel();
  };

  var typeDiv = document.createElement('div');
  var typeLb = document.createElement('label');
  var typeCmb = document.createElement('select');

  typeDiv.className = 'subDiv';
  typeLb.innerHTML = 'Operator action: ';
  typeLb.className ='nameLabel';

  addOptions(typeCmb, [], "Select operation");
  typeCmb.options[typeCmb.options.length] = new Option("Unlock", 0);
  typeCmb.options[typeCmb.options.length] = new Option("Lock", 1);

  typeCmb.addEventListener("change", function() {
    var type = typeCmb.options[typeCmb.selectedIndex].text;
    operator.setType(type.toLowerCase());
  });

  if(operator.type != null)
    typeCmb.options[typeCmb.selectedIndex].text = operator.type;

  var btnDiv = document.createElement('div');
  var saveBtn = document.createElement('button');
  var cancelBtn = document.createElement('button');

  btnDiv.className = 'subDiv';
  saveBtn.className = 'saveBtn';
  cancelBtn.className = 'cancelBtn';

  saveBtn.innerHTML = "Save";
  cancelBtn.innerHTML = "Cancel";

  saveBtn.onclick = function(){ opSave(operator, typeCmb.options[typeCmb.selectedIndex].text); };
  cancelBtn.onclick = function(){ chCancel(); };

  title.appendChild(titleLb);
  header.appendChild(title);
  header.appendChild(closeBtn);

  typeDiv.appendChild(typeLb);
  typeDiv.appendChild(typeCmb);
  content.appendChild(typeDiv);

  var outList = elemToList(operator.pageOut);

  var nonInList1 = arr_diff(null, PageList, operator.pagesIn);
  var nonInList2 = arr_diff(null, nonInList1, outList);

  var nonOutList1 = arr_diff(null, PageList, outList);
  var nonOutList2 = arr_diff(null, nonOutList1, operator.pagesIn);

  addSelectingHalfOpDiv(operator, content, "Pages in: ", "Page out: ", "Select pages", operator.pagesIn, outList,
                        nonInList2, nonOutList2, "in", "out");

  btnDiv.appendChild(saveBtn);
  btnDiv.appendChild(cancelBtn);

  editDiv.appendChild(header);
  editDiv.appendChild(content);
  editDiv.appendChild(btnDiv);

  parent.appendChild(editDiv);
}

function addSelectingHalfOpDiv(operator, content, lbMsg1, lbMsg2, message, list1, list2, nonList1, nonList2, direction1, direction2){
  var div1 = document.createElement('div');
  var div2 = document.createElement('div');
  var div3 = document.createElement('div');

  var lb1 = document.createElement('label');
  var lb2 = document.createElement('label');

  var cmb1 = document.createElement('select');
  var cmb2 = document.createElement('select');

  var input1 = document.createElement('textarea');
  var input2 = document.createElement('textarea');

  div1.className = 'subHalfDiv';
  div2.className = 'subHalfDiv2'
  div3.className = 'subDiv';

  lb1.innerHTML = lbMsg1;
  lb2.innerHTML = lbMsg2;
  lb1.className ='subLabel';
  lb2.className ='subLabel';

  input1.className = 'textArea';
  input2.className = 'textArea';

  addOptions(cmb1, nonList1, message);
  addOptions(cmb2, nonList2, message);

  input1.value = writeOutput(list1);
  input2.value = writeOutput(list2);

  cmb1.addEventListener("change", function() {
    addPageToOperator(cmb1, input1, operator, direction1, operator.type);
  });
  cmb2.addEventListener("change", function() {
    addPageToOperator(cmb2, input2, operator, direction2, operator.type);
  });

  div1.appendChild(lb1);
  div1.appendChild(cmb1);
  div1.appendChild(input1);

  div2.appendChild(lb2);
  div2.appendChild(cmb2);
  div2.appendChild(input2);

  div3.appendChild(div1);
  div3.appendChild(div2);
  content.appendChild(div3);
}

function addPageToOperator(cmb, input, operator, direction, type){
  var name = cmb.options[cmb.selectedIndex].text;
  var newPage = findPageByName(name);

  if(type == null){
    type = "Select operation";
  }

  if(type.charAt(0).localeCompare('S') != 0){
    createOpConnection(newPage, operator, direction, type);
    input.value += name;
    input.value += '\n';
    Refresh(cmb, newPage.name);
  }
  else {
    alert("Please select a type for the operator");
  }
}

function opSave(operator, type){
  if(operator == null){
    return;
  }

  operator.setType(type);
  closePanel();
}

function findPage(id){
  for (var i = 0; i < PageList.length; i++) {
    if (PageList[i].pageID.localeCompare(id) == 0){
      return PageList[i];
    }
  }
  return null;
}

function findChapter(id){
  for (var i = 0; i < ChapterList.length; i++) {
    if (ChapterList[i].chapterID.localeCompare(id) == 0){
      return ChapterList[i];
    }
  }
  return null;
}

function findOperator(id){
  for (var i = 0; i < OperatorList.length; i++) {
    if (OperatorList[i].operatorID.localeCompare(id) == 0){
      return OperatorList[i];
    }
  }
  return null;
}

function findPageByName(name){
  for (var i = 0; i < PageList.length; i++) {
    if (PageList[i].name.localeCompare(name) == 0){
      return PageList[i];
    }
  }
  return null;
}

function findChapterByName(name){
  for (var i = 0; i < ChapterList.length; i++) {
    if (ChapterList[i].name.localeCompare(name) == 0){
      return ChapterList[i];
    }
  }
  return null;
}

function setOffset(chapter, page){
  var offset = [];
  var offsetX = chapter.cx - page.cx;
  var offsetY = chapter.cy - page.cy;

  offset.push(offsetX);
  offset.push(offsetY);

  return offset;
}

function deletePage(page, i){
  var gID = page.groupID;
  deleteAdjacentConns(page);
  svg.selectAll("g[id=" + gID + "]").remove();
  PageList = PageList.filter(x => x  !== page);
  SelectableItemsList = SelectableItemsList.filter(x => x  !== page);
}

function deleteAdjacentConns(page){
  for (var i = 0; i < page.connList.length; i++){
    var connID = page.connList[i].connectionID;
    svg.selectAll("line[id=" + connID + "]").remove();
    ConnectionList = ConnectionList.filter(x => x  !== page.connList[i]);
  }
}

function arrayRemove(arr, value) {
   return arr.filter(function(ele){
       return ele != value;
   });
}

function findConnByID(id){
  for (var i = 0; i < ConnectionList.length; i++) {
    if (ConnectionList[i].connectionID.localeCompare(id) == 0){
      return ConnectionList[i];
    }
  }
  return null;
}

function closePanel(){
  var div = document.getElementById('editPanel');
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function resetStatus(){
  for (i = 0; i < SelectableItemsList.length; i++) {
    SelectableItemsList[i].changeSelectionStatus(false);
  }

  SelectionList = [];
}

function createConnection(page1, page2, type){
 var connection = new Connection(page1, page2, type);
 ConnectionList.push(connection);

 connection.parentPage.changeConnectionStatus(true);
 connection.childPage.changeConnectionStatus(true);

 page1.addConnection(connection);
 page2.addConnection(connection);
}

function createChConnection(page, chapter, type){
 var connection = new ChConnection(page, chapter, type);
 ConnectionList.push(connection);

 connection.parentPage.changeConnectionStatus(true);

 page.addConnection(connection);
 chapter.addConnection(connection);
}

function findMiddle(x1, x2, y1, y2){
  var middleX = (x1 + x2)/2;
  var middleY = (y1 + y2)/2;

  return [middleX, middleY];
}

function getTipPoint(x1, x2, y1, y2){
  var middle = findMiddle(x1, x2, y1, y2);
  var mid = findMiddle(middle[0], x2, middle[1], y2);

  return [mid[0], mid[1]];
}

function createOpConnection(page, operator, direction, type){
 if(direction.localeCompare("out") == 0 && operator.pageOut != null){
    alert("Operator already used to unlock one page");
    return;
 }
 var connection = new OpConnection(page, operator, type, direction);
 ConnectionList.push(connection);

 connection.parentPage.changeConnectionStatus(true);

 page.addConnection(connection);
 operator.addConnection(connection, direction);
}

function updateConnection(conn){
 var child, x2, y2, w2, h2, cx2, cy2;

 var parent = conn.parentPage;
 child = conn.childPage;

 var x1 = parent.x;
 var y1 = parent.y;

 var w1 = parent.width / 2;
 var h1 = parent.height / 2;

 var cx1 = x1 + w1;
 var cy1 = y1 + h1;

 if(child != null){
   x2 = child.x;
   y2 = child.y;

   w2 = child.width / 2;
   h2 = child.height / 2;

   cx2 = x2 + w2;
   cy2 = y2 + h2;
 }
 else {
   child = conn.chapter;
   if(child != null){
     x2 = child.x;
     y2 = child.y;

     w2 = child.width / 2;
     h2 = child.height / 2;

     cx2 = x2 + w2;
     cy2 = y2 + h2;
   }
   else {
     child = conn.operator;
     x2 = child.cx;
     y2 = child.cy;

     w2 = child.r/2;
     h2 = child.r/2;

     cx2 = x2 - w2;
     cy2 = y2;
   }
}

 var dx = cx2 - cx1;
 var dy = cy2 - cy1;

 var p1, p2;
 if (!dx) {
   p1 = [cx1, y1 + h2 * 2];
   p2 = [cx1, y2];
 } else {
   p1 = getIntersection(dx, dy, cx1, cy1, w1, h1);
   p2 = getIntersection(-dx, -dy, cx2, cy2, w2, h2);
 }

 conn.updateLine(p1[0], p1[1], p2[0], p2[1]);
}

function getIntersection(dx, dy, cx, cy, w, h) {
  if (Math.abs(dy / dx) < h / w) {
    return [cx + (dx > 0 ? w : -w), cy + dy * w / Math.abs(dx)];
  } else {
    return [cx + dx * h / Math.abs(dy), cy + (dy > 0 ? h : -h)];
    }
}

function updateSelectionList(element, status){
  if (status){
    SelectionList.push(element);
  }
  else {
    var index = SelectionList.indexOf(element);
    if (index > -1) {
      SelectionList.splice(index, 1);
    }
  }
}

class Connection{
  constructor(parentPage, childPage, type){
    this.parentPage = parentPage;
    this.childPage = childPage;

    this.type = type;
    this.direction = "";

    this.parentPage.ChildPages.set(type + childPage.pageID, childPage);
    this.childPage.ParentPages.set(type + parentPage.pageID, parentPage);

    this.connectionID = "pgConn" + parentPage.pageNo + childPage.pageNo;

    this.cx1 = parentPage.x + parentPage.width/2;
    this.cy1 = parentPage.y + parentPage.height/2;

    this.cx2 = childPage.x + childPage.width/2;
    this.cy2 = childPage.y + childPage.height/2;

    this.tipPoint = getTipPoint(this.cx1, this.cx2, this.cy1, this.cy2);
    this.tipPointX = this.tipPoint[0];
    this.tipPointY = this.tipPoint[1];

    this.group = svg.append("g")
        .attr("class", "draggable")
        .attr("fill", "transparent");

    this.line = this.group.append("line")
        .attr("id", this.connectionID)
        .attr("x1", this.cx1)
        .attr("y1", this.cy1)
        .attr("x2", this.cx2)
        .attr("y2", this.cy2)
        .attr("stroke-width", 0.1)
        .style("stroke", "white");

    this.tip = this.group.append("circle")
        .attr("class", "draggable")
        .attr("cx", this.tipPointX)
        .attr("cy", this.tipPointY)
        .attr("r", 0.25);

    this.createLineTip(type);
  }

  updateLine(x1, y1, x2, y2){
    this.line.attr("x1", x1);
    this.line.attr("y1", y1);
    this.line.attr("x2", x2);
    this.line.attr("y2", y2);

    this.tipPoint = getTipPoint(x1, x2, y1, y2);
    this.tipPointX = this.tipPoint[0];
    this.tipPointY = this.tipPoint[1];
    this.updateLineTip(this.tipPointX, this.tipPointY);
  }

  createLineTip(type){
    if(type.localeCompare("unlock") == 0){
      this.tip.style("fill", "#31B404");
    }
    else if(type.localeCompare("lock") == 0){
      this.tip.style("fill", "red")
    }
  }

  updateLineTip(newX, newY){
    this.tip.attr("cx", newX);
    this.tip.attr("cy", newY);
  }
}

class ChConnection{
  constructor(parentPage, chapter, type){
    this.parentPage = parentPage;
    this.chapter = chapter;

    this.type = type;
    this.direction = "";

    this.parentPage.ChildChapters.set(type + chapter.chapterID, chapter);
    this.connectionID = "chConn" + parentPage.pageNo + chapter.chapterNo;

    this.cx1 = parentPage.x + parentPage.width/2;
    this.cy1 = parentPage.y + parentPage.height/2;

    this.cx2 = chapter.cx - chapter.width/2;
    this.cy2 = chapter.cy;

    this.tipPoint = getTipPoint(this.cx1, this.cx2, this.cy1, this.cy2);
    this.tipPointX = this.tipPoint[0];
    this.tipPointY = this.tipPoint[1];

    this.group = svg.append("g")
        .attr("class", "draggable")
        .attr("fill", "transparent");

    this.line = this.group.append("line")
        .attr("id", this.connectionID)
        .attr("x1", this.cx1)
        .attr("y1", this.cy1)
        .attr("x2", this.cx2)
        .attr("y2", this.cy2)
        .attr("stroke-width", 0.1)
        .style("stroke", "white");

    this.tip = this.group.append("circle")
        .attr("class", "draggable")
        .attr("cx", this.tipPointX)
        .attr("cy", this.tipPointY)
        .attr("r", 0.25);

    this.createLineTip(type);
  }

  updateLine(x1, y1, x2, y2){
    this.line.attr("x1", x1);
    this.line.attr("y1", y1);
    this.line.attr("x2", x2);
    this.line.attr("y2", y2);

    this.tipPoint = getTipPoint(x1, x2, y1, y2);
    this.tipPointX = this.tipPoint[0];
    this.tipPointY = this.tipPoint[1];
    this.updateLineTip(this.tipPointX, this.tipPointY);
  }

  createLineTip(type){
    if(type.localeCompare("unlock") == 0){
      this.tip.style("fill", "#31B404");
    }
    else if(type.localeCompare("lock") == 0){
      this.tip.style("fill", "red")
    }
  }

  updateLineTip(newX, newY){
    this.tip.attr("cx", newX);
    this.tip.attr("cy", newY);
  }
}

class OpConnection{
  constructor(page, operator, type, direction){
    this.type = type;
    this.parentPage = page;
    this.operator = operator;
    this.direction = direction;

    this.parentPage.Operators.push(this.operator);
    this.connectionID = "opConn" + page.pageNo + operator.operatorNo;

    this.cx1 = page.x + page.width/2;
    this.cy1 = page.y + page.height/2;

    this.cx2 = operator.cx;
    this.cy2 = operator.cy;
    this.tipPoint = null;

    if(this.direction.localeCompare("in") == 0){
      this.tipPoint = getTipPoint(this.cx1, this.cx2, this.cy1, this.cy2);
    }
    else{
      this.tipPoint = getTipPoint(this.cx2, this.cx1, this.cy2, this.cy1);
    }

    this.tipPointX = this.tipPoint[0];
    this.tipPointY = this.tipPoint[1];

    this.group = svg.append("g")
        .attr("class", "draggable")
        .attr("fill", "transparent");

    this.line = this.group.append("line")
        .attr("id", this.connectionID)
        .attr("x1", this.cx1)
        .attr("y1", this.cy1)
        .attr("x2", this.cx2)
        .attr("y2", this.cy2)
        .attr("stroke-width", 0.1)
        .style("stroke", "white");

    this.tip = this.group.append("circle")
        .attr("class", "draggable")
        .attr("cx", this.tipPointX)
        .attr("cy", this.tipPointY)
        .attr("r", 0.25);

    this.createLineTip(type);
  }

  updateLine(x1, y1, x2, y2){
    this.line.attr("x1", x1);
    this.line.attr("y1", y1);
    this.line.attr("x2", x2);
    this.line.attr("y2", y2);

    if(this.direction.localeCompare("in") == 0){
      this.tipPoint = getTipPoint(x1, x2, y1, y2);
    }
    else{
      this.tipPoint = getTipPoint(x2, x1, y2, y1);
    }

    this.tipPointX = this.tipPoint[0];
    this.tipPointY = this.tipPoint[1];

    this.updateLineTip(this.tipPointX, this.tipPointY);
  }

  createLineTip(type){
    if(type.localeCompare("unlock") == 0){
      this.tip.style("fill", "#31B404");
    }
    else if(type.localeCompare("lock") == 0){
      this.tip.style("fill", "red")
    }
  }

  updateLineTip(newX, newY){
    this.tip.attr("cx", newX);
    this.tip.attr("cy", newY);
  }
}

class Page{
  constructor(pageNo){
    this.x = 8;
    this.y = 25;

    this.width = 4;
    this.height = 3;

    this.cx = this.x + this.width/2;
    this.cy = this.y + this.height/2;

    this.pageNo = pageNo;
    this.name = "Page " + pageNo;
    this.groupID = "gp" + pageNo;
    this.pageID = "page" + pageNo;

    this.title = "Default Title";
    this.content = " ";

    this.isSelected = false;
    this.isConnected = false;

    this.connList = [];
    this.ChildPages = new Map();
    this.ParentPages = new Map();

    this.Chapters = [];
    this.ChildChapters = new Map();
    this.Operators = [];

    this.addGroup();
  }

  addGroup(){
    this.group = svg.append("g")
        .attr("class", "draggable")
        .attr("id", this.groupID)
        .attr("fill", "transparent");

    this.rect = this.group.append("rect")
        .attr("class", "draggable")
        .attr("id", this.pageID)
        .attr("x", this.x)
        .attr("y", this.y)
        .attr("rx", 0.5)
        .attr("ry", 0.5)
        .attr("width", this.width)
        .attr("height", this.height)
        .style("fill", "#ffffcc")
        .style("stroke", "black")
        .style("stroke-width", 0.15);

    this.svgPageNo = this.group.append("text")
        //.attr("class", "draggable")
        .text("Page " + this.pageNo)
        .attr("x", this.x + 1)
        .attr("y", this.y + 1)
        .attr("font-size", "0.8px")
        .style("fill", "black");

    this.svgPageTitle = this.group.append("text")
        .text(this.title)
        .attr("x", this.x + 0.5)
        .attr("y", this.y + 2)
        .attr("font-size", "0.6px")
        .style("fill", "black");
  }

  updateCoordinates(newX, newY){
    this.x = newX;
    this.y = newY;

    this.rect.attr("x", this.x);
    this.rect.attr("y", this.y);

    this.cx = newX + this.width / 2;
    this.cy = newY + this.height / 2;

   //  if(this.Chapters[0] != null){
   //   var chapter = this.Chapters[0];
   //
   //   var offset = chapter.ContentPages.get(this);
   //   offset = setOffset(chapter, this);
   // }

    this.svgPageNo.attr("x", newX + 1);
    this.svgPageNo.attr("y", newY + 1);

    this.svgPageTitle.attr("x", newX + 0.5);
    this.svgPageTitle.attr("y", newY + 2);
  }

  addToChapter(chapter){
    this.Chapters.push(chapter);
    if(chapter.group != null){
      var ch = isInsideChapter(this);
      if(ch == null){
        this.updateCoordinates(chapter.cx - this.width/2, chapter.cy - this.height/2);
        updateExistingConnections(this);
      }

      svg.selectAll("g[id=" + this.groupID + "]").remove();
      this.addGroup();
    }
  }

  connectWithChapter(chapter, type){
    createChConnection(this, chapter, type);
  }

  addConnection(conn){
    this.connList.push(conn);
  }

  changeSelectionStatus(newValue){
    this.isSelected = newValue;
    changeShapeStyle(newValue, this.rect);
    updateSelectionList(this, newValue);
  }

  changeConnectionStatus(newValue){
    this.isConnected = newValue;
  }

  updateRect(){
    this.svgPageTitle.text(this.title);
  }

  changeRectangleColour(code){
    this.rect.style("fill", code);
  }
}

class Chapter{
  constructor(number){
    this.title = "";
    this.colour = "";

    this.rect = null;
    this.group = null;

    this.x = 20;
    this.y = 25;

    this.cx = this.x + this.width/2;
    this.cy = this.y + this.height/2;

    this.width = 11;
    this.height = 7;

    this.chapterNo = number;
    this.chapterID = "ch" + number;
    this.name = "Chapter " + number;
    this.title = "";

    this.ParentPages = new Map();
    this.ContentPages = new Map();
    this.connList = [];

    this.isUnlocked = [];
  }

  addPage(page){
    var exists = this.ContentPages.has(page);
    if (page == null || exists)
      return;

    var offset = setOffset(this, page);
    this.ContentPages.set(page, offset);

    this.editRectangle("add");
    page.addToChapter(this);
  }

  addParentPage(page, type){
    if (page == null)
      return;

    this.ParentPages.set(type + this.pageID, page);
    page.connectWithChapter(this, type);
  }

  createRectangle(){
    this.group = svg.append("g")
        .attr("class", "draggable")
        .attr("fill", "transparent")
        .attr("stroke-width", 5);

    this.rect = this.group.append("rect")
        .attr("class", "draggable")
        .attr("id", this.chapterID)
        .attr("x", this.x)
        .attr("y", this.y)
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("rx", 0.5)
        .attr("ry", 0.5)
        .style("fill", this.colour)
        .style("opacity", 0.45);

    // this.svgChTitle = this.group.append("text")
    //     .text(this.name)
    //     .attr("x", this.cx - 1.8)
    //     .attr("y", this.cy - 5)
    //     .attr("font-size", 0.9)
    //     .style("fill", "black");
  }

  editRectangle(action){
    if(this.rect == null)
      return;

    if(action.localeCompare("add") == 0){
      this.width *= 1.1;
      this.height *= 1.1;

      this.rect.attr("width", this.width);
      this.rect.attr("height", this.height);
    }
  }

  changeChapterColour(){
    this.rect.style("fill", this.colour)
  }

  changeConnectionStatus(status){
    this.isUnlocked = status;
  }

  addConnection(conn){
    this.connList.push(conn);
  }

  updateCoordinates(newX, newY){
    this.x = newX;
    this.y = newY;

    this.rect.attr("x", this.x);
    this.rect.attr("y", this.y);

    this.cx = newX + this.width / 2;
    this.cy = newY + this.height / 2;

    for (const [k, v] of this.ContentPages) {
      var offsetX = v[0] + k.width/2;
      var offsetY = v[1] + k.height/2;

      k.updateCoordinates(this.cx - offsetX, this.cy - offsetY);
      updateExistingConnections(k);
    }

    // this.svgChTitle.attr("x", newX - 1.8);
    // this.svgChTitle.attr("y", newY - 6);
  }

  emptyContentPages(){
    this.ContentPages.clear()
  }

  setName(name){
    this.name = name;
  }

  setColourToPage(page){
    page.changeRectangleColour(this.colour);
  }
}

class Operator{
  constructor(operatorName, operatorNo){
    this.operatorName = operatorName;
    this.cx, this.cy, this.textOff = null;
    this.r = 2;

    this.name = "Operator " + operatorName.toUpperCase();
    this.type = null;
    this.groupID = "go" + operatorNo;

    this.operatorID = operatorName + operatorNo;
    this.isSelected = false;

    this.connList = [];
    this.pagesIn = [];
    this.pageOut = null;

    if(operatorName.localeCompare("and") == 0){
      this.cx = 10;
      this.cy = 20;
      this.textOff = 1.1;
    }
    else if(operatorName.localeCompare("or") == 0){
      this.cx = 30;
      this.cy = 20;
      this.textOff = 0.6;
    }

    this.addGroup();
  }

  addGroup(){
    this.group = svg.append("g")
        .attr("id", this.groupID)
        .attr("class", "draggable")
        .attr("fill", "transparent")
        .attr("stroke-width", 5);

    this.circle = this.group.append("circle")
        .attr("class", "draggable")
        .attr("id", this.operatorID)
        .attr("cx", this.cx)
        .attr("cy", this.cy)
        .attr("r", this.r)
        .style("fill", "white")
        .style("stroke-width", 0.15)
        .style("stroke", "black");


    this.svgOpTitle = this.group.append("text")
        .text(this.operatorName.toUpperCase())
        .attr("x", this.cx - this.textOff)
        .attr("y", this.cy + 0.2)
        .attr("font-size", 1.0)
        .style("fill", "black");
  }

  setType(type){
    this.type = type;
  }

  updateCoordinates(newX, newY){
    this.cx = newX;
    this.cy = newY;

    this.circle.attr("cx", this.cx);
    this.circle.attr("cy", this.cy);

    this.svgOpTitle.attr("x", this.cx - this.textOff);
    this.svgOpTitle.attr("y", this.cy + 0.2);
  }

  changeSelectionStatus(newValue){
    this.isSelected = newValue;
    changeShapeStyle(newValue, this.circle);
    updateSelectionList(this, newValue);
  }

  addConnection(conn, direction){
    this.connList.push(conn);
    this.type = conn.type;
    svg.selectAll("g[id=" + this.groupID + "]").remove();
    this.addGroup();

    if(direction.localeCompare("in") == 0){
      this.pagesIn.push(conn.parentPage);
      if(this.pageOut != null){
        this.pageOut.ParentPages.set(this.type + conn.parentPage.pageID, conn.parentPage);
        conn.parentPage.ChildPages.set(this.type + this.pageOut.pageID, this.pageOut);
      }
    }
    else {
      if(this.pageOut == null){
        this.pageOut = conn.parentPage;

        for (i = 0; i < this.pagesIn.length; i++){
          var pageIn = this.pagesIn[i];
          this.pageOut.ParentPages.set(this.type + pageIn.pageID, pageIn);
          pageIn.ChildPages.set(this.type + this.pageOut.pageID, this.pageOut);
        }
      }
    }
  }
}
