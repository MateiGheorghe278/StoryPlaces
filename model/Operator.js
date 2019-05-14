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
