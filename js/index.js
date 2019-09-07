function LinkGame(dom, x, y, sameTimes, fillPercent) {
	this.dom = dom;
	this.x = x || 10; // 列数
	this.y = y || 10; // 行数
	this.sameTimes = sameTimes || 4;
	this.fillPercent = fillPercent || 1; // 显示格数占全部的格子的百分比，(x*y*fillPercent)%sameTimes必须为0，否则会无法成对消除
	this.mapArr = []; // 存放游戏每个格子数据的数组， 0： 为空，没有数据，即可通行，其他 当前格子的数据，注：实际图标从1开始，每个对应一个图标
	this.currSelect = null; // 当前选中项
	this.itemWidth = 28; // 每个格子的宽度

	this.init();
}

/**
 * [prototype description]
 * 每个方法里首先定义var that = this;，便于和某些局部this区分开
 * @type {Object}
 */
LinkGame.prototype = {
	/**
	 * [init 初始化]
	 * @return {[type]} [description]
	 */
	init: function(){
		var that = this;
		// 每个格子占像素that.itemWidth*that.itemWidth,根据实际列数和行数显示游戏区域的宽高
		that.dom.css({
			width: that.x*that.itemWidth,
			heigth: that.y*that.itemWidth
		});

		that.creatData();
		that.renderDom();
		that.setControl();
	},

	/**
	 * [creatData 创建数据对象]
	 * @return {[type]} [description]
	 */
	creatData: function(){
		var that = this;
		// 创建二位数组，保存每个游戏格子的数据，比实际显示的最大数据大一圈，上下左右都多出一排，便于在边缘处连接
		for (var i = 0, leni = that.y+2; i < leni; i++) {
			that.mapArr[i] = [];
			for (var j = 0, lenj = that.x+2; j < lenj; j++) {
				that.mapArr[i][j] = 0;
			}
		}

		var typeNum = Math.floor(that.x*that.y*that.fillPercent/that.sameTimes); // 种类个数
		var realArr = []; // 填充各个种类的数据合集
		for (var k = 0, lenk = that.sameTimes; k < lenk; k++) {
			for (var l = 0, lenl = typeNum; l < lenl; l++) {
				realArr.push(l+1);
			}
		}

		var orderArr = []; // 从0-that.x*that.y的顺序数组
		for (var m = 0, lenm = that.x*that.y; m < lenm; m++) {
			orderArr.push(m);
		}

		var disorderArr = []; // 从0-that.x*that.y的乱序数组
		for (var n = 0, lenn = that.x*that.y; n < lenn; n++) {
			// 每次从顺序数组中随机位置取出一个数，存入乱序数组，然后删除该数，保证生成从0-that.x*that.y的不重复的乱序数组
            var tempIndex = Math.floor(Math.random()*orderArr.length); // 生成随机下标
            var tempNum = orderArr.splice(tempIndex,1)[0]; // 取出随机下标中保存的在顺序数组中的数据，即顺序下标， 并删除顺序数组中该项数据
			disorderArr.push(tempNum); // 存入乱序数组中
		}
		// 此时disorderArr为一个从0-that.x*that.y的乱序数组

		// 遍历实际种类合集，根据乱序数组中保存的下标将种类合集填充到mapArr中
		for (var o = 0, leno = realArr.length; o < leno; o++) {
			that.mapArr[Math.floor(disorderArr[o]/that.x)+1][(disorderArr[o]%that.x+1)] = realArr[o];
		}
	},

	/**
	 * [renderDom 渲染格子dom元素]
	 * @return {[type]} [description]
	 */
	renderDom: function(){
		var that = this;
		var dom_str = '';
		for (var i = 0; i < that.y; i++) {
			for (var j = 0; j < that.x; j++) {
				dom_str += '<li class="list' + that.mapArr[i+1][j+1] + '"></li>';
			}
		}
		// 添加三条线用来显示连接线
		dom_str += '<div id="linkLine0" class="linkLine"></div><div id="linkLine1" class="linkLine"></div><div id="linkLine2" class="linkLine"></div>'
		that.dom.append(dom_str);
	},

	/**
	 * [setControl 游戏控制]
	 * @return {[type]} [description]
	 */
	setControl: function(){
        var that=this;
		that.dom.find('li:not(.list0)').bind('click', function(){
			if (!that.currSelect) { // 当前没有选中项
				$(this).addClass('active');
				that.currSelect = $(this);
			} else if (that.currSelect.index() != $(this).index()) { // 有选中项，并且点击了非当前选中项的其他项
				if (that.canConnect(that.currSelect, $(this))) { // 可连接
					that.currSelect.removeClass().addClass('list0').unbind('click');
					$(this).removeClass().addClass('list0').unbind('click');
					that.currSelect = null;
				} else {
					that.currSelect.removeClass('active');
					$(this).addClass('active');
					that.currSelect = $(this);
				}
			}
		})
	},

	/**
	 * [canConnect 判断两个点是否能够连接]
	 * @param  {[type]} last [上一次点击的点]
	 * @param  {[type]} curr [当前点击的点]
	 * @return {[type]}      [description]
	 */
	canConnect: function(last, curr){
		var that = this;
		// 由于最外层有一圈用来连接边缘点的空白点，所以这里的坐标需要统一加一
		var lastX = last.index() % that.x + 1; // 上一次点击点的x坐标
		var lastY = parseInt(last.index() / that.x) + 1; // 上一次点击点的y坐标
		var currX = curr.index() % that.x + 1; // 当前点击点的x坐标
		var currY = parseInt(curr.index() / that.x) + 1; // 当前点击点的y坐标
		var canConnectFlag = false;

		if (that.mapArr[lastY][lastX] == that.mapArr[currY][currX]) { // 两次点击的内容匹配，不匹配直接false
			if (lastY == currY) { // 两次点击同行
				if (that.isHorizontalOpen(lastY, lastX, currX)) { // 横向畅通可连接
					that.drawHorizontalLine(0, lastY, lastX, currX);
					canConnectFlag = true;
				} else {
					// 根据两点所在列，遍历所有行，判断是否存在中间两点可四点三线连接（其他两点在是当前点击点的同列不同行）
					for (var j = 0; j < that.y+2; j++) {
						// 判断四点是否通畅
						if (that.mapArr[j][lastX] == 0 && that.mapArr[j][currX] == 0 && that.isHorizontalOpen(j, lastX, currX) && that.isVerticalOpen(lastX, j, lastY) && that.isVerticalOpen(currX, j, currY)) {
							that.drawHorizontalLine(0, j, lastX, currX);
							that.drawVerticalLine(1, lastX, j, lastY);
							that.drawVerticalLine(2, currX, j, currY);
							canConnectFlag = true;
							break;
						}
					}
				}
			} else if (lastX == currX) { // 同列
				if (that.isVerticalOpen(lastX, lastY, currY)) {
					that.drawVerticalLine(0, lastX, lastY, currY);
					canConnectFlag = true;
				} else {
					// 根据两点所在行，遍历所有列，判断是否存在中间两点点可四点三线连接（其他两点在是当前点击点的同行不同列）
					for (var i = 0; i < that.x+2; i++) {
						// 判断四点是否通畅
						if (that.mapArr[lastY][i] == 0 && that.mapArr[currY][i] == 0 && that.isVerticalOpen(i, lastY, currY) && that.isHorizontalOpen(lastY, i, lastX) && that.isHorizontalOpen(currY, i, currX)) {
							that.drawVerticalLine(0, i, lastY, currY);
							that.drawHorizontalLine(1, lastY, i, lastX);
							that.drawHorizontalLine(2, currY, i, currX);
							canConnectFlag = true;
							break;
						}
					}
				}
			} else { // 不同行不同列
				if (that.mapArr[lastY][currX] == 0 && that.isHorizontalOpen(lastY, lastX, currX) && that.isVerticalOpen(currX, lastY, currY)) { // 存在一个中间点可三点两线连接，和上次点击点同行,当前点击点同列
					that.drawHorizontalLine(0, lastY, lastX, currX);
					that.drawVerticalLine(1, currX, lastY, currY);
					canConnectFlag = true;
				} else if (that.mapArr[currY][lastX] == 0 && that.isHorizontalOpen(currY, lastX, currX) && that.isVerticalOpen(lastX, lastY, currY)) { // 存在一个中间点可三点两线连接，和上次点击点同列,当前点击点同行
					that.drawHorizontalLine(0, currY, lastX, currX);
					that.drawVerticalLine(1, lastX, lastY, currY);
					canConnectFlag = true;
				} else {
					// 遍历每一行，判断是否存在中间两点可四点三线连接
					for (var j = 0; j < that.y+2; j++) {
						// 判断四点是否通畅
						if (that.mapArr[j][lastX] == 0 && that.mapArr[j][currX] == 0 && that.isHorizontalOpen(j, lastX, currX) && that.isVerticalOpen(lastX, j, lastY) && that.isVerticalOpen(currX, j, currY)) {
							that.drawHorizontalLine(0, j, lastX, currX);
							that.drawVerticalLine(1, lastX, j, lastY);
							that.drawVerticalLine(2, currX, j, currY);
							canConnectFlag = true;
							break;
						}
					}

					if (!canConnectFlag) {
						// 根据两点所在行，遍历所有列，判断是否存在中间两点点可四点三线连接（其他两点在是当前点击点的同行不同列）
						for (var i = 0; i < that.x+2; i++) {
							// 判断四点是否通畅
							if (that.mapArr[lastY][i] == 0 && that.mapArr[currY][i] == 0 && that.isVerticalOpen(i, lastY, currY) && that.isHorizontalOpen(lastY, i, lastX) && that.isHorizontalOpen(currY, i, currX)) {
								that.drawVerticalLine(0, i, lastY, currY);
								that.drawHorizontalLine(1, lastY, i, lastX);
								that.drawHorizontalLine(2, currY, i, currX);
								canConnectFlag = true;
								break;
							}
						}
					}
				}
			}
		}
		if (canConnectFlag) {
			that.mapArr[lastY][lastX] = 0;
			that.mapArr[currY][currX] = 0;
		}
		return canConnectFlag;
	},

	/**
	 * [isHorizontalOpen 判断横向是否畅通]
	 * @param  {[type]}  y     [第y列]
	 * @param  {[type]}  lastX [上一次点击点的X坐标]
	 * @param  {[type]}  currX [当前点击点的X坐标]
	 * @return {Boolean}       [description]
	 */
	isHorizontalOpen: function(y, lastX, currX){
		var that = this;
		if (Math.abs(lastX - currX) != 1) { // 不相邻
			for (var i = 1, len = Math.abs(lastX - currX); i < len; i++) {
				var tempX = lastX < currX ? lastX + i : currX + i;
				if (that.mapArr[y][tempX] != 0) { // 不通
					return false;
				}
			}
		}
		return true;
	},

	/**
	 * [isVerticalOpen 判断纵向是否畅通]
	 * @param  {[type]}  x     [第x行]
	 * @param  {[type]}  lastY [上一次点击点的Y坐标]
	 * @param  {[type]}  currY [当前点击点的Y坐标]
	 * @return {Boolean}       [description]
	 */
	isVerticalOpen: function(x, lastY, currY){
		var that = this;
		if (Math.abs(lastY - currY) != 1) { // 不相邻
			for (var i = 1, len = Math.abs(lastY - currY); i < len; i++) {
				var tempY = lastY < currY ? lastY + i : currY + i;
				if (that.mapArr[tempY][x] != 0) { // 不通
					return false;
				}
			}
		}
		return true;
	},

	/**
	 * [drawHorizontalLine 画横向连接线]
	 * @param  {[type]} id_num [连接线的idnum（取值0， 1， 2）]
	 * @param  {[type]}  y     [第y列]
	 * @param  {[type]}  lastX [上一次点击点的X坐标]
	 * @param  {[type]}  currX [当前点击点的X坐标]
	 * @return {[type]}        [description]
	 */
	drawHorizontalLine: function(id_num, y, lastX, currX){
		var that = this;
		// 根据格子位置计算线的位置和宽度
		var small = lastX < currX ? lastX : currX; // 较小的，即靠左的格子
		$('#linkLine' + id_num).css({
			width: Math.abs(lastX - currX)*that.itemWidth,
			height: 2,
			left: 34 + that.itemWidth*(small-1),
			top: 34 + that.itemWidth*(y-1)
		});
		// 线条延迟50ms后隐藏
		setTimeout(function(){
			$('#linkLine' + id_num).css({
				width: 0, 
				height: 0,
				left: 0,
				top: 0
			})
		}, 50);
	},

	/**
	 * [drawVerticalLine 画纵向连接线]
	 * @param  {[type]} id_num [连接线的idnum（取值0， 1， 2）]
	 * @param  {[type]}  x     [第x行]
	 * @param  {[type]}  lastY [上一次点击点的Y坐标]
	 * @param  {[type]}  currY [当前点击点的Y坐标]
	 * @return {[type]}        [description]
	 */
	drawVerticalLine: function(id_num, x, lastY, currY){
		var that = this;
		// 根据格子位置计算线的位置和高度
		var small = lastY < currY ? lastY : currY; // 较小的，即靠左的格子
		$('#linkLine' + id_num).css({
			width: 2,
			height: Math.abs(lastY - currY)*that.itemWidth,
			left: 34 + that.itemWidth*(x-1),
			top: 34 + that.itemWidth*(small-1)
		});
		// 线条延迟50ms后隐藏
		setTimeout(function(){
			$('#linkLine' + id_num).css({
				width: 0, 
				height: 0,
				left: 0,
				top: 0
			})
		}, 50);
	}
};