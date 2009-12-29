// Copyright 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
---
description: Graphing/chart tool for mootools 1.2

license: Apache License, Version 2.0

authors:
- Brett Dixon

requires: 
  core/1.2.4: '*'

provides: [MilkChart.Column, MilkChart.Bar, MilkChart.Line, MilkChart.Scatter, MilkChart.Pie]

...
*/

var MilkChart;var Point=new Class({initialize:function(a,b){this.x=a||0;this.y=b||0}});MilkChart=new Class({Implements:[Options,Events],options:{width:480,height:290,colors:["#4f81bd","#c0504d","#9bbb59","#8064a2","#4198af","#db843d"],padding:12,font:"Verdana",fontColor:"#000000",fontSize:10,background:"#FFFFFF",chartLineColor:"#878787",chartLineWeight:1,border:true,borderWeight:1,borderColor:"#878787",titleSize:18,titleFont:"Verdana",titleColor:"#000000",showRowNames:true,showValues:true,showKey:true,useZero:true,useFooter:false},initialize:function(b,a){this.setOptions(a);this.element=document.id(b);if(Browser.Engine.trident){this.fireEvent("onFail",[this.element]);return false}this.fireEvent("onFail");this.width=this.options.width;this.height=this.options.height;this.container=new Element("div",{width:this.width,height:this.height}).inject(this.element.getParent());this._canvas=new Element("canvas",{width:this.options.width,height:this.options.height}).inject(this.container);this.ctx=this._canvas.getContext("2d");this.colNames=[];this.rowNames=[];this.rowCount=this.element.getElement("thead").getChildren()[0].getChildren().length;this.minY=(this.options.useZero)?0:10000000000;this.maxY=0;this.rows=[];this.options.title=false||this.element.title;this.bounds=[new Point(),new Point(this.width,this.height)];this.chartWidth=0;this.chartHeight=0;this.keyPadding=this.width*0.2;this.rowPadding=this.height*0.1;this.colors=this.__getColors(this.options.colors);this.shapes=[];MilkChart.Shapes.each(function(c){this.shapes.push(c)}.bind(this))},prepareCanvas:function(){this.element.setStyle("display","none");this.ctx.fillStyle=this.options.background;this.ctx.fillRect(0,0,this.width,this.height);if(this.options.border){this.ctx.lineWeight=this.options.borderWeight;this.ctx.strokeRect(0,0,this.width,this.height)}if(this.options.showValues){charPadding=0.03;this.valueColumnWidth=(this.bounds[1].x-this.bounds[0].x)*(String(this.maxY).length*charPadding);this.bounds[0].x+=this.valueColumnWidth}this.bounds[0].x+=this.options.padding;this.bounds[0].y+=this.options.padding;this.bounds[1].x-=this.options.padding*2;this.bounds[1].y-=this.options.padding*2;if(this.options.showRowNames){this.bounds[1].y-=this.rowPadding}else{this.rowPadding=0}if(this.options.showKey){this.bounds[1].x-=this.keyPadding;this.keyBounds=[new Point(this.bounds[1].x*1.02,this.bounds[0].y),new Point(this.bounds[1].x*0.5,this.bounds[1].y)]}if(this.options.title){titleHeight=this.bounds[0].y+this.height*0.1;this.bounds[0].y=titleHeight;this.titleBounds=[new Point(this.bounds[0].x,0),new Point(this.bounds[1].x,titleHeight)];this.drawTitle()}this.chartWidth=this.bounds[1].x-this.bounds[0].x;this.chartHeight=this.bounds[1].y-this.bounds[0].y},drawTitle:function(){titleHeightRatio=1.25;titleHeight=this.options.titleSize*titleHeightRatio;this.ctx.textAlign="center";this.ctx.font=this.options.titleSize+"px "+this.options.titleFont;this.ctx.fillStyle=this.options.titleColor;this.ctx.fillText(this.options.title,this.bounds[0].x+(this.bounds[1].x-this.bounds[0].x)/2,titleHeight,this.chartWidth)},drawAxes:function(){this.ctx.beginPath();this.ctx.strokeStyle=this.options.chartLineColor;this.ctx.moveTo(this.bounds[0].x+0.5,this.bounds[0].y+0.5);this.ctx.lineTo(this.bounds[0].x+0.5,this.bounds[1].y+0.5);this.ctx.moveTo(this.bounds[0].x+0.5,this.bounds[1].y+0.5);this.ctx.lineTo(this.bounds[1].x+0.5,this.bounds[1].y+0.5);this.ctx.stroke()},drawValueLines:function(){dist=[1,2,5,10,20,50,100,150,500,1000];maxLines=9;i=0;this.chartLines=1;delta=Math.floor((this.maxY-this.minY));while(Math.floor((delta/dist[i]))>maxLines){i++}this.chartLines=Math.floor((delta/dist[i]))+2;mult=dist[i];negativeScale=(this.minY<0)?(mult+this.minY):0;this.ratio=(this.chartHeight+this.options.padding)/(((this.chartLines-1)*mult)+(mult/2));this.ctx.font=this.options.fontSize+"px "+this.options.font;this.ctx.textAlign="right";this.ctx.fillStyle=this.options.fontColor;boundsHeight=this.bounds[1].y-this.bounds[0].y;lineHeight=Math.floor(boundsHeight/(this.chartLines-1));for(i=0;i<this.chartLines;i++){this.ctx.fillStyle=this.options.fontColor;lineY=this.bounds[1].y-(i*lineHeight);lineValue=(this.chartLines*mult)-((this.chartLines-i)*mult)+this.minY-negativeScale;this.ctx.beginPath();lineY+=0.5;this.ctx.moveTo(this.bounds[0].x-4,lineY);if(this.options.showValues){this.ctx.fillText(String(lineValue),this.bounds[0].x-8,lineY+3)}this.ctx.lineTo(this.bounds[1].x,lineY);this.ctx.stroke()}},getData:function(){return null},draw:function(){return null},drawKey:function(){return null},__getColors:function(c){var b=[];if(c.length==1||c.length==2){var d=new Color(c[0]);var a=(c.length==2)?new Color(c[1]):new Color("#ffffff").mix(c[0],20);var h=[(a[0]-d[0])/this.rowCount,(a[1]-d[1])/this.rowCount,(a[2]-d[2])/this.rowCount];var g=d;for(i=0;i<this.rowCount;i++){b.push(g.rgbToHex());for(j=0;j<h.length;j++){g[j]+=parseInt(h[j])}}}else{var e=0;var f=c.slice(0);while(b.length!=this.rowCount){if(f.length==0){f=c.slice(0);e+=20}newColor=new Color(f.shift()).mix("#ffffff",e);b.push(newColor.rgbToHex())}}return b}});MilkChart.Column=new Class({Extends:MilkChart,options:{columnBorder:false,columnBorderWeight:2},initialize:function(b,a){this.parent(b,a);this.getData();this.prepareCanvas();this.rowWidth=Math.round(this.chartWidth/this.rows.length);this.drawAxes();this.drawValueLines();this.draw();if(this.options.showKey){this.drawKey()}},getData:function(){this.element.getElement("thead").getChildren()[0].getChildren().each(function(a){this.colNames.push(a.get("html"))}.bind(this));if(this.options.useFooter){this.element.getElement("tfoot").getChildren()[0].getChildren().each(function(a){this.rowNames.push(a.get("html"))}.bind(this))}this.element.getElement("tbody").getChildren().each(function(b){var a=[];b.getChildren().each(function(c){val=Number(c.get("html"));if(!$type(val)){val=c.get("html")}a.push(val);if(val>this.maxY){this.maxY=val}if(val<this.minY){this.minY=val}}.bind(this));this.rows.push(a)}.bind(this));if(!this.options.useFooter){for(i=1;i<=this.rows.length;i++){this.rowNames.push("Row "+i)}}},draw:function(){y=(this.minY>=0)?this.bounds[1].y:this.bounds[1].y-Math.floor((this.chartHeight/(this.chartLines-1)));origin=new Point(this.bounds[0].x,y);rowPadding=Math.floor(this.rowWidth*0.16);colWidth=Math.ceil((this.rowWidth-(rowPadding*2))/this.rows[0].length);rowNameID=0;this.rows.each(function(a){rowOrigin=new Point(origin.x,origin.y);colorID=0;this.ctx.fillStyle=this.options.fontColor;this.ctx.textAlign="center";if(this.options.showRowNames){this.ctx.fillText(this.rowNames[rowNameID],rowOrigin.x+(this.rowWidth/2),this.bounds[1].y+(this.rowPadding/2))}a.each(function(b){this.ctx.beginPath();this.ctx.fillStyle=this.colors[colorID];colHeight=Math.ceil(b*this.ratio);this.ctx.fillStyle=this.colors[colorID];this.ctx.fillRect(rowOrigin.x+rowPadding,rowOrigin.y-colHeight,colWidth,colHeight);if(this.options.columnBorder){this.ctx.strokeStyle="#fff";this.ctx.lineWidth=this.options.columnBorderWeight;this.ctx.strokeRect(rowOrigin.x+rowPadding,rowOrigin.y-colHeight,colWidth,colHeight)}rowOrigin.x+=colWidth;colorID++}.bind(this));origin.x+=this.rowWidth;rowNameID++}.bind(this))},drawKey:function(){colorID=0;textMarginLeft=14;keyNameHeight=Math.ceil(this.height*0.05);keyHeight=this.colNames.length*keyNameHeight;keyOrigin=(this.height-keyHeight)/2;this.colNames.each(function(a){this.ctx.fillStyle=this.options.fontColor;this.ctx.textAlign="left";this.ctx.fillText(a,this.keyBounds[0].x+textMarginLeft,keyOrigin+8);this.ctx.fillStyle=this.colors[colorID];this.ctx.fillRect(Math.ceil(this.keyBounds[0].x),Math.ceil(keyOrigin),10,10);colorID++;keyOrigin+=keyNameHeight},this)}});MilkChart.Bar=new Class({Extends:MilkChart.Column,options:{},initialize:function(b,a){this.parent(b,a)},drawValueLines:function(){dist=[1,2,5,10,20,50,100,150,500,1000];maxLines=9;i=0;this.chartLines=1;delta=Math.floor((this.maxY-this.minY));while(Math.floor((delta/dist[i]))>maxLines){i++}this.chartLines=Math.floor((delta/dist[i]))+2;mult=dist[i];negativeScale=(this.minY<0)?(mult+this.minY):0;this.ratio=(this.chartWidth+this.options.padding)/(((this.chartLines-1)*mult)+1);this.ctx.font=this.options.fontSize+"px "+this.options.font;this.ctx.textAlign="center";this.ctx.fillStyle=this.options.fontColor;boundsHeight=this.bounds[1].y-this.bounds[0].y;lineHeight=Math.ceil(this.chartWidth/(this.chartLines-1));for(i=0;i<this.chartLines;i++){this.ctx.fillStyle=this.options.fontColor;lineX=this.bounds[0].x+(i*lineHeight);lineValue=(this.chartLines*mult)-((this.chartLines-i)*mult)+this.minY;this.ctx.beginPath();lineX=Math.round(lineX)+0.5;this.ctx.moveTo(lineX,this.bounds[0].y);this.ctx.fillText(String(lineValue),lineX,this.bounds[1].y+14);this.ctx.lineTo(lineX,this.bounds[1].y+4);this.ctx.stroke()}},draw:function(){origin=new Point(this.bounds[0].x,this.bounds[1].y);this.colHeight=Math.round(this.chartHeight/this.rows.length);padding=0.16;rowPadding=Math.ceil(this.colHeight*padding);colWidth=Math.ceil((this.colHeight-(rowPadding*2))/this.rows[0].length);rowNameID=0;this.rows.each(function(a){rowOrigin=new Point(origin.x,origin.y);colorID=0;this.ctx.fillStyle=this.options.fontColor;this.ctx.textAlign="center";this.ctx.fillText(this.rowNames[rowNameID],rowOrigin.x-(colWidth/2),rowOrigin.y-(this.rowPadding/2));a.each(function(b){this.ctx.beginPath();this.ctx.fillStyle=this.colors[colorID];colHeight=Math.ceil(b*this.ratio);this.ctx.fillRect(rowOrigin.x,rowOrigin.y-rowPadding,colHeight,colWidth);rowOrigin.y-=colWidth;colorID++}.bind(this));origin.y-=this.colHeight;rowNameID++}.bind(this))}});MilkChart.Line=new Class({Extends:MilkChart,options:{showTicks:false,showLines:true,lineWeight:3},initialize:function(b,a){this.parent(b,a);this.getData();this.prepareCanvas();this.rowWidth=this.chartWidth/this.rows[0].length;this.drawAxes();this.drawValueLines();this.draw();if(this.options.showKey){this.drawKey()}},getData:function(){this.rows=[];this.element.getElement("thead").getChildren()[0].getChildren().each(function(a){this.colNames.push(a.get("html"));this.rows.push([])}.bind(this));if(this.element.getElement("tfoot")){this.element.getElement("tfoot").getChildren()[0].getChildren().each(function(a){this.rowNames.push(a.get("html"))}.bind(this))}this.element.getElement("tbody").getChildren().each(function(a){a.getChildren().each(function(c,b){val=Number(c.get("html"));if(!$type(val)){val=c.get("html")}this.rows[b].push(val);if(val>this.maxY){this.maxY=val}if(val<this.minY){this.minY=val}}.bind(this))}.bind(this))},draw:function(){origin=new Point(this.bounds[0].x,this.bounds[1].y);rowCenter=this.rowWidth/2;rowNameID=0;colorID=0;y=(this.minY>=0)?this.bounds[1].y+(this.minY*this.ratio):this.bounds[1].y-Math.floor((this.chartHeight/(this.chartLines-1)));shapeIndex=0;this.rows.each(function(b,a){if(this.options.showLines){rowOrigin=new Point(origin.x,origin.y);lineOrigin=this.bounds[0].x+rowCenter;this.ctx.lineWidth=this.options.lineWeight;this.ctx.beginPath();this.ctx.strokeStyle=this.colors[colorID];this.ctx.moveTo(rowOrigin.x+rowCenter,y-(b[0]*this.ratio));b.each(function(c){pointCenter=rowOrigin.x+rowCenter;point=new Point(pointCenter,y-(c*this.ratio));this.ctx.lineTo(point.x,point.y);rowOrigin.x+=this.rowWidth}.bind(this));this.ctx.stroke()}if(this.options.showTicks){rowOrigin=new Point(origin.x,origin.y);lineOrigin=this.bounds[0].x+rowCenter;shape=this.shapes[shapeIndex];b.each(function(c){pointCenter=rowOrigin.x+rowCenter;point=new Point(pointCenter,y-(c*this.ratio));shape(this.ctx,point.x,point.y,10,this.colors[colorID]);rowOrigin.x+=this.rowWidth}.bind(this));shapeIndex++}colorID++;rowNameID++}.bind(this));this.__drawRowLabels()},drawKey:function(){keyNameHeight=Math.ceil(this.height*0.05);keyHeight=this.colNames.length*keyNameHeight;keyOrigin=(this.height-keyHeight)/2;this.colNames.each(function(b,a){this.ctx.fillStyle=this.options.fontColor;this.ctx.textAlign="left";this.ctx.fillText(b,this.keyBounds[0].x+30,keyOrigin+5);this.ctx.fillStyle=this.colors[a];this.ctx.strokeStyle=this.colors[a];this.ctx.lineWidth=3;if(this.options.showLines){this.ctx.beginPath();this.ctx.moveTo(this.keyBounds[0].x,keyOrigin+0.5);this.ctx.lineTo(this.keyBounds[0].x+20,keyOrigin+0.5);this.ctx.closePath();this.ctx.stroke()}if(this.options.showTicks){shape=this.shapes[a];shape(this.ctx,this.keyBounds[0].x+10,keyOrigin,10,this.colors[a])}keyOrigin+=keyNameHeight}.bind(this))},__drawRowLabels:function(){origin=new Point(this.bounds[0].x,this.bounds[1].y);rowCenter=this.rowWidth/2;this.ctx.fillStyle=this.options.fontColor;this.ctx.lineWidth=1;this.ctx.textAlign="center";this.rowNames.each(function(b,a){this.ctx.fillText(this.rowNames[a],origin.x+rowCenter,this.bounds[1].y+(this.rowPadding/2));origin.x+=this.rowWidth}.bind(this))}});MilkChart.Scatter=new Class({Extends:MilkChart.Line,options:{showTicks:true,showLines:false},initialize:function(b,a){this.parent(b,a)}});MilkChart.Pie=new Class({Extends:MilkChart,options:{stroke:true,strokeWeight:3,strokeColor:"#ffffff",chartTextColor:"#000000",shadow:false,chartLineWeight:2,pieBorder:false},initialize:function(b,a){this.parent(b,a);this.rowCount=this.element.getElement("tbody").getChildren().length;this.colors=this.__getColors(this.options.colors);this.options.showRowNames=false;this.getData();this.prepareCanvas();this.radius=(this.chartHeight/2);if(this.options.showKey){this.drawKey()}this.draw()},getData:function(){if(this.element.getElement("tfoot")){this.element.getElement("tfoot").getChildren()[0].getChildren().each(function(a){this.rowNames.push(a.get("html"))}.bind(this))}pieTotal=0;this.element.getElement("tbody").getChildren().each(function(a){node=a.getChildren()[0];dataRow=[];val=Number(node.get("html"));dataRow.push(val);pieTotal+=val;this.rows.push(dataRow)}.bind(this));this.rows.each(function(a){a.push((a[0]/pieTotal)*360)})},draw:function(){arcStart=0;blah=0;center=new Point((this.bounds[1].x/2)+this.options.padding,(this.bounds[1].y/2)+this.options.padding);if(this.options.shadow){var a=this.ctx.createRadialGradient(center.x,center.y,this.radius,center.x*1.03,center.y*1.03,this.radius*1.05);a.addColorStop(0.5,"#000000");a.addColorStop(0.75,"#000000");a.addColorStop(1,"rgba(0,0,0,0)");this.ctx.fillStyle=a;this.ctx.fillRect(this.bounds[0].x,this.bounds[0].y,this.width,this.height)}this.rows.each(function(c,b){this.ctx.fillStyle=this.colors[b];this.ctx.beginPath();this.ctx.arc(center.x,center.y,this.radius,(Math.PI/180)*arcStart,(Math.PI/180)*(c[1]+arcStart),false);this.ctx.lineTo(center.x,center.y);this.ctx.closePath();this.ctx.fill();if(this.options.stroke){this.ctx.strokeStyle=this.options.strokeColor;this.ctx.lineWidth=this.options.strokeWeight;this.ctx.lineJoin="round";this.ctx.beginPath();this.ctx.arc(center.x,center.y,this.radius,(Math.PI/180)*arcStart,(Math.PI/180)*(c[1]+arcStart),false);this.ctx.lineTo(center.x,center.y);this.ctx.closePath();this.ctx.stroke()}if(this.options.showValues){this.ctx.fillStyle=this.options.chartTextColor;this.ctx.textAlign="center";start=(Math.PI/180)*(arcStart);end=(Math.PI/180)*(c[1]+arcStart);centerAngle=start+((end-start)/2);percent=Math.round((c[0]/pieTotal)*100);centerDist=(percent<5)?0.95:1.75;x=this.radius*Math.cos(centerAngle)/centerDist;y=this.radius*Math.sin(centerAngle)/centerDist;this.ctx.fillText(percent+"%",center.x+x,center.y+y)}arcStart+=c[1]}.bind(this));if(this.options.pieBorder){this.ctx.lineWidth=this.options.chartLineWeight;this.ctx.strokeStyle=this.options.chartLineColor;this.ctx.beginPath();this.ctx.arc(center.x,center.y,this.radius-1,0,Math.PI*2);this.ctx.stroke()}},drawKey:function(){colorID=0;keyNameHeight=Math.ceil(this.height*0.05);keyHeight=this.rowNames.length*keyNameHeight;keyHeight=(keyHeight>this.height)?this.height*0.9:keyHeight;keyOrigin=(this.height-keyHeight)/2;this.ctx.font=this.options.fontSize+"px "+this.options.font;this.rowNames.each(function(a){this.ctx.fillStyle=this.options.fontColor;this.ctx.textAlign="left";this.ctx.fillText(a,this.keyBounds[0].x+14,keyOrigin+8);this.ctx.fillStyle=this.colors[colorID];this.ctx.fillRect(Math.ceil(this.keyBounds[0].x),Math.ceil(keyOrigin),10,10);colorID++;keyOrigin+=keyNameHeight}.bind(this))}});MilkChart.Shapes=new Hash({square:function(b,a,e,d,c){b.fillStyle=c;b.fillRect(a-(d/2),e-(d/2),d,d)},circle:function(b,a,e,d,c){b.fillStyle=c;b.beginPath();b.arc(a,e,d/2,0,(Math.PI/180)*360,true);b.closePath();b.fill()},triangle:function(b,a,e,d,c){b.fillStyle=c;b.beginPath();a-=d/2;e-=d/2;lr=new Point(a+d,e+d);b.moveTo(a,lr.y);b.lineTo(a+(d/2),e);b.lineTo(lr.x,lr.y);b.closePath();b.fill()},cross:function(b,a,e,d,c){a-=d/2;e-=d/2;b.strokeStyle=c;b.lineWidth=1;b.beginPath();b.moveTo(a,e);b.lineTo(a+d,e+d);b.moveTo(a,e+d);b.lineTo(a+d,e);b.closePath();b.stroke()},diamond:function(b,a,e,d,c){a-=d/2;e-=d/2;b.fillStyle=c;b.beginPath();b.moveTo(a+(d/2),e);b.lineTo(a+d,e+(d/2));b.lineTo(a+(d/2),e+d);b.lineTo(a,e+(d/2));b.closePath();b.fill()}});