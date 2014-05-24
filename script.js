(function(){
	"use strict";
	
	var c = null,
		ctx = null,
		canvasWidth = null,
		canvasHeight = null,
		point = [], // 储存点的数组
		pNum = 0, // 点的序号
		word = "", // 显示的文字
		fontSize = 14, //字的大小
		pointNums = 30, // 点的数量
		mouseX = 0,
		mouseY = 0,
		i = 0;
	
	function init(){
		c = document.createElement("canvas");
		ctx = c.getContext("2d");
		
		// 设定画布大小
		canvasWidth = window.innerWidth,
		canvasHeight = window.innerHeight;
		
		c.width = canvasWidth;
		c.height = canvasHeight;   
		document.body.appendChild(c);
		
		// 创建 pointNums 个点
		for (i = 0; i < pointNums; i++){
			point.push(createPoint());
		}
		
		// 初始化点
		function createPoint(){
			var p = {
				num : pNum++,
				x : Math.random() * canvasWidth,
				y : Math.random() * canvasHeight,
				size : Math.random() + 1, // 点的大小
				a : Math.random() * 2 * Math.PI, // 初始角度
				speed : Math.random() * 0.6, // 速度
				word : "这是第 " + (pNum - 1) + " 个点",
				isStop : false // 是否停止
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
					word = p.word;
				}else{
					p.isStop = false;
					nums++;
				}
				
			});
			
			if (nums == point.length){
				word = "";
			}
		
		}, true);
	}
	
	window.onresize = function () {
		if (document.getElementsByTagName("canvas")){
			document.body.removeChild(document.getElementsByTagName("canvas")[0]);
		}
		point.length = 0;
		pNum = 0;
		word = "";
		mouseX = 0;
		mouseY = 0;
		
		init();
	};
	
	init();
	
	function draw(){
		var color = 190; // 初始颜色
		var distList = []; // 储存所有的距离
		
		ctx.lineWidth = "1";
		
		// 计算距离
		for (var i = 0, len = point.length; i < len; i++){
			for (var j = 0; j < i; j++){
				distList.push({
							dist: getDist(point[i], point[j]),
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
		
		
		// 画连接线
		distList.forEach(function(p){
			if (color + p.dist / 3 < 256){
				ctx.beginPath();
				ctx.strokeStyle = getColor(parseInt(color + p.dist / 3));
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
				ctx.strokeStyle = getColor(color, 0.2);
				ctx.fillStyle = getColor(color, 0.3);
				ctx.arc(p.x, p.y, p.size * 4, 0, 2 * Math.PI);
			}else{
				ctx.strokeStyle = getColor(color, 0.1);
				ctx.fillStyle = getColor(color, 0.15);
				ctx.arc(p.x, p.y, p.size * 3, 0, 2 * Math.PI);
			}
			
			ctx.fill();
			ctx.stroke();
		});
		
		// 画点
		ctx.strokeStyle = getColor(color, 0.5);
		ctx.fillStyle = getColor(color, 0.8);
		point.forEach(function(p){
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		});
		
		// 如果当前存在文字状态 即鼠标停留附近有点
		if (word !== ""){
			ctx.font = fontSize + "px 微软雅黑";
			ctx.fillStyle = getColor(140);
			
			if (word.length * fontSize + 20 + mouseX > canvasWidth){
				ctx.fillText(word, mouseX - word.length * fontSize, mouseY + 20);
			}else{
				ctx.fillText(word, mouseX + 20, mouseY + 20);
			}
			
		}
		
		distList.length = 0;
	}
	
	
	function getColor(color, opacity){
	
		// 这里可能会有 opacity 为 0 触发错误的问题 , 
		opacity = opacity || 1;
		return "rgba(" + color + ", " + color + ", " + color + ", " + opacity + ")";
	}
	
	function getDist(p1, p2){
		return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
	}
	
	var timer = setInterval(function(){
		
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
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		draw();
		
	}, 33);
	
	
	
})();