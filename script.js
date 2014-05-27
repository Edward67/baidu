window.onload = function(){
	"use strict";
	
	var c = null,
		ctx = null,
		canvasWidth = null,
		canvasHeight = null,
		point = [], // 储存点的数组
		wordList = [], // 储存文字的数组
		pNum = 0, // 点的序号
		mouseX = 0,
		mouseY = 0,
		i = 0,
		wordObj = document.getElementsByTagName("div")[0];
	
	Number.prototype.toColor = function(opacity){
	
		// 这里可能会有 opacity 为 0 触发错误的问题 , 
		opacity = opacity || 1;
		return "rgba(" + this + ", " + this + ", " + this + ", " + opacity + ")";
	}
	
	// 我尝试了script用src发jsonp，发现目标页面不支持，于是我只能本地服务器php抓取后交给前端处理了
	var xmlhttp = null;	
	if (window.XMLHttpRequest)
		xmlhttp = new XMLHttpRequest();
	else if (window.ActiveXObject)
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	
	if (xmlhttp !== null){
		xmlhttp.open("GET", "getWord.php", true);
		xmlhttp.send();
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
			
				wordList = JSON.parse(xmlhttp.responseText);
				
				init();
			}
		};
	}
	
	function init(){
		c = document.createElement("canvas");
		ctx = c.getContext("2d");
		
		// 设定画布大小
		canvasWidth = window.innerWidth,
		canvasHeight = window.innerHeight;
		
		c.width = canvasWidth;
		c.height = canvasHeight;   
		document.body.appendChild(c);
		
		// 根据 wordList 的个数 创建相应点的数量
		for (i = 0; i < wordList.length; i++){
			point.push(createPoint());
		}
		
		// 初始化点
		function createPoint(){
			var p = {
				num : pNum,
				x : Math.random() * canvasWidth,
				y : Math.random() * canvasHeight,
				size : Math.random() + 1, // 点的大小
				a : Math.random() * 2 * Math.PI, // 初始角度
				speed : Math.random() * 0.6, // 速度
				word : wordList[pNum++],
				isStop : false, // 是否停止
				distTo : function(p){ // 判断当前点与参数中的点的距离
					return Math.sqrt((this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y));
				}
			};
			return p;
		}
		
		// 绑定事件
		c.addEventListener("mousemove", function(e){
			var nums = 0; // 统计有多少个false
			mouseX = e.x;
			mouseY = e.y;

			point.forEach(function(p){
				if ( Math.abs(p.x  - mouseX) < 20 && Math.abs(p.y - mouseY) < 20){
					p.isStop = true;
					wordObj.innerHTML = p.word;
					wordObj.style.left = (mouseX + wordObj.offsetWidth < canvasWidth ? mouseX + 20 : mouseX - wordObj.offsetWidth) + "px";
					wordObj.style.top = (mouseY + wordObj.offsetHeight < canvasHeight ? mouseY + 20 : mouseY - wordObj.offsetHeight) + "px";
					wordObj.style.visibility = "visible";
				}else{
					p.isStop = false;
					nums++;
				}
				
			});
			
			if (nums == point.length){
				wordObj.style.visibility = "hidden";
			}
		
		}, true);
		
		draw();
	}
	
	window.onresize = function () {
		if (document.getElementsByTagName("canvas")){
			document.body.removeChild(document.getElementsByTagName("canvas")[0]);
		}
		point.length = 0;
		pNum = 0;
		mouseX = 0;
		mouseY = 0;
		
		// 防止数据请求之前出现画面
		if (wordList.length > 0){
			init();
		}
	};
	
	
	function draw(){
		
		var color = 190; // 初始颜色
		var distList = []; // 储存所有的距离
		
		// 计算新的点的位置
		point.forEach(function(p){
			if (! p.isStop){
				p.a = p.a > 2 * Math.PI ? p.a - 2 * Math.PI : p.a;
				p.a = p.a < 0 ? p.a + 2 * Math.PI : p.a;
				
				var nextX = p.x + p.speed * Math.cos(p.a),
					nextY = p.y + p.speed * Math.sin(p.a);
				
				if (nextY > canvasHeight || nextY < 0){
					p.a = -p.a;
				}
				if (nextX > canvasWidth || nextX < 0){
					p.a = -p.a - Math.PI;
				}
				
				p.x += p.speed * Math.cos(p.a);
				p.y += p.speed * Math.sin(p.a);
			}
		});
		
		// 计算距离
		for (var i = 0, len = point.length; i < len; i++){
			for (var j = 0; j < i; j++){
				distList.push({
							dist: point[i].distTo(point[j]),
							x1: point[i].x,
							y1: point[i].y,
							x2: point[j].x,
							y2: point[j].y});
			}
		}
		
		// 从大到小排序
		distList.sort(function(a, b){
			return b.dist - a.dist;
		});
		
		// 清除画布
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		// 画连接线
		distList.forEach(function(p){
			if (color + p.dist / 3 < 256){
				ctx.beginPath();
				ctx.strokeStyle = parseInt(color + p.dist / 3).toColor();
				ctx.moveTo(p.x1, p.y1);
				ctx.lineTo(p.x2, p.y2);
				ctx.stroke();
			}
		});
		
		// 画点的边框
		point.forEach(function(p){
			ctx.beginPath();
			
			// 判断当前点是否是停留状态
			if (p.isStop){
				ctx.strokeStyle = color.toColor(0.2);
				ctx.fillStyle = color.toColor(0.3);
				ctx.arc(p.x, p.y, p.size * 4, 0, 2 * Math.PI);
			}else{
				ctx.strokeStyle = color.toColor(0.1);
				ctx.fillStyle = color.toColor(0.15);
				ctx.arc(p.x, p.y, p.size * 3, 0, 2 * Math.PI);
			}
			
			ctx.fill();
			ctx.stroke();
		});
		
		// 画点
		ctx.strokeStyle = color.toColor(0.5);
		ctx.fillStyle = color.toColor(0.8);
		point.forEach(function(p){
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		});
		
		distList.length = 0;
		
		requestAnimationFrame(draw);
	}
	
};