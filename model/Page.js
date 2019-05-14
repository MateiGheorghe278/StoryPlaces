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
