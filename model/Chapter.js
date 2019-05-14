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
