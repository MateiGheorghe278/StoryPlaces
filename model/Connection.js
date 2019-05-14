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
