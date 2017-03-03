/*----------------------- 函数封装 ------------------------------*/
var myFn = {
	//判断节点是否存在相应的class
	hasClass : function(className,ele) {
		return new RegExp("(^|\\s)" + className + "(\\s|$)").test(ele.className);
	},

	//通过节点的class来获取节点
	getByClass : function(name,ele) {
		var ele = ele || document;
		if(ele.getElementsByClassName) {
			return ele.getElementsByClassName(name);
		} else {
			var allEle = ele.getElementsByTagName("*"),
				len = allEle.length,
				result = [];
				for (var i = 0; i < len; i++) {
				if(myFn.hasClass(name,allEle[i])) { //调用下面的hasClass函数
					result.push(allEle[i]);
				}
			}
			return result;
		}
	},

	// 事件兼容
	addHandler : function(ele, type, handler) {
        if(ele.addEventListener) {
          ele.addEventListener(type, handler, false);
        } else if(ele.attachEvent) {
          ele.attachEvent('on' + type, handler);
        } else {
          ele['on' + type] = handler;
        }
     },

    //获取样式
    getStyle : function(obj,attr) {
    	if(obj.currentStyle) {
    		return obj.currentStyle[attr];
    	} else {
    		return getComputedStyle(obj,false)[attr];
    	}
    },

    //阻止默认事件
    stopDefault : function(event) {
    	var e = event || window.event;
    	if(e.stopPropagation || e.preventDefault) {
    		e.stopPropagation();
    		e.preventDefault();
    	} else {
    		e.cancelBubble = true;
    		e.returnValue = false;
    	}
    },

	/*
		作用：根据参数创建内容为相关数字的按钮
		参数：obj，父级元素名称
			  ctx，按钮内容，可分为数字和文字两种
			  num, 多少个按钮
			  link,链接的页面
	*/
	createPageBtn : function(obj,ctx,num,link) {
		var obj = obj || document,
			aPage = null,
			link = link || null;
		if(typeof ctx === "number") {
			for (var i = ctx; i <= num + ctx - 1; i++) {
				aPage = document.createElement("a");
				aPage.setAttribute("href","#" + i);
				aPage.appendChild(document.createTextNode(i));
				obj.appendChild(aPage);
			}
		} else if(typeof ctx === "string") {
			aPage = document.createElement("a");
			aPage.setAttribute("href","#" + link);
			aPage.appendChild(document.createTextNode(ctx));
			obj.appendChild(aPage);
		}
	},

	/*
		作用：分页功能里的回调函数。分页的点击事件的相关内容处理
		参数：点击的页面的href值
	*/
	showPageContent : function(index) {
		var oPageNum = myFn.getByClass("page-num")[0];
		oPageNum.innerHTML = "-" + index + "-";
	}
}

/*------------------------ 主程序，名称里带有res的都为响应式处理 -----------------------------*/
var component = (function() {
/*----------------------------------------------- 导航 -------------------------------------------------------*/
	var navbar = function() {
		var oNavbar = myFn.getByClass("navbar")[0],
			oNavbarBtn = oNavbar.getElementsByTagName("li"),
			oPaginationBtn = myFn.getByClass("demo1",oNavbar)[0];

		//显隐分页功能
		oPaginationBtn.onclick = function() {
			var oPageStage = document.getElementById("page-stage");
			oPageStage.style.display = (myFn.getStyle(oPageStage,"display") === "none") ? "block" : "none";
		}
	}

	// 小屏时点击Navbar按钮展示组件，进行了封装
	navbar.resNavbar = {
		oResNavbar : myFn.getByClass("navbar")[0],
		oResNavList : myFn.getByClass("nav-list")[0],
		showNavbar : function() {
			var oResNavbar = this.oResNavbar, //通过this拿到对象内的变量
				oResNavbarBtn = oResNavbar.getElementsByTagName("li");
			oResNavbar.style.cssText = "display: none";
			this.oResNavList.onclick = function() {
				oResNavbar.style.display = (myFn.getStyle(oResNavbar,"display") === "none") ? "block" : "none";
			}

			var oNavbar = myFn.getByClass("navbar")[0],
				oPaginationBtn = myFn.getByClass("demo1",oNavbar)[0];

			//小页面时的显隐分页功能。点击完分页功能的按钮后，需要隐藏导航
			oPaginationBtn.onclick = function() {
				var oPageStage = document.getElementById("page-stage");
				oPageStage.style.display = (myFn.getStyle(oPageStage,"display") === "none") ? "block" : "none";
				oResNavbar.style.display = "none";
			}
		},
		//从小页面恢复成大页面时，需转换导航的显示状态（CSS里对大页面的导航设置成flex布局）
		hideNavbar : function() {
			this.oResNavbar = myFn.getByClass("navbar")[0];
			this.oResNavbar.style.cssText = "display: -webkit-box;display: -ms-flexbox;display: flex;";
		}
	}

/*----------------------------------------------- 导航结束 ---------------------------------------------------*/

/*------------------------------------------------- 分页 -----------------------------------------------------*/ 
	var pagination = function(opt) {
		if(!opt.id) {return;}
		else {
			var allNum = opt.num || 5,
				nowNum = opt.now || 1,
				callBack = opt.callBack || function() {};

			var	showPage = (function() {
				var doc = document,
					oStage = doc.getElementById(opt.id),
					oPagination = myFn.getByClass("pagination",oStage)[0],
					oPageList = doc.createDocumentFragment(); //添加按钮的片段
					
				/*
					分页思路：1.最重要的思想是传递点击的当前页面的页数进行函数递归
							  2.通过当前页和总页数的相互关系来创造相应按钮，并给href赋值
				*/
				if(nowNum >= 4 && allNum >= 6) { //创建首页按钮条件：当前页大于3，总页数大于5
					myFn.createPageBtn(oPageList,"首页",1,1);
				}
				if(nowNum >= 2) { //创建上一页条件；当前页大于1
					myFn.createPageBtn(oPageList,"上一页",1,nowNum - 1);
				}
				if(allNum <= 5) { //总页数小于5，则直接创建相应按钮数
					myFn.createPageBtn(oPageList,1,allNum);
				} else { //总页数大于5则分以下情况
					if(nowNum < 3) { //当前页为1或2时，保持按钮仍为1-5
						myFn.createPageBtn(oPageList,1,5);
					} else if(nowNum > allNum - 3) { //当前页为总页数-1或总页数-2时，保持总页数-4至总页数
						myFn.createPageBtn(oPageList,allNum - 4,5);
					} else { //其他情况则让当前页的按钮处于中间
						myFn.createPageBtn(oPageList,nowNum - 2,5);
					}
				}
				if(nowNum < allNum) { //创建下一页条件：当前页小于总页数
					myFn.createPageBtn(oPageList,"下一页",1,nowNum + 1);
				} 
				if(nowNum <= allNum - 3 && allNum >= 6) { //创建尾页条件：当前页小于总页数-2，总页数大于5
					myFn.createPageBtn(oPageList,"尾页",1,allNum);
				}
				
				oPagination.appendChild(oPageList);

				callBack(nowNum); //执行回调函数

				//按键点击
				var clickBtn = (function() {
					var allBtn = oPagination.getElementsByTagName("a"),
						len = allBtn.length;
					for (var i = 0; i < len; i++) {
						myFn.addHandler(allBtn[i],"click",function() {
							var newNum = parseInt(this.getAttribute("href").substring(1)); //获取点击页的href的数值

							oPagination.innerHTML = ""; //清空按钮
							//重新传参来递归
							pagination({
								id : "page-stage",
								num : allNum,
								now : newNum, //传入新的当前页
								callBack : callBack
							})
						})
					}
				})()
			})() //shouPage
		}
	} //pagination

	//因为是属于分页功能里的响应式按钮事件，所以封装成pagination的子对象。将共用的变量直接拿出来，通过this来引用
	pagination.resPage = {
		oPagination : myFn.getByClass("pagination")[0],
		oPageWrap : myFn.getByClass("pagination-wrap")[0],
		showResPage : function() {
			var oPagination = this.oPagination;
			oPagination.style.display = "none";
			this.oPageWrap.onclick = function() {
				oPagination.style.display = (myFn.getStyle(oPagination,"display") === "none") ? "block" : "none";
			}
		},
		hideResPage : function() {
			this.oPageWrap.onclick = function(){return;};
			this.oPagination.style.cssText = "display: -webkit-box;display: -ms-flexbox;display: flex;";
		}
	}
/*--------------------------------------------------- 分页结束 ---------------------------------------------*/

/*--------------------------------------------------- 接口提供 ---------------------------------------------*/
	return {
		navbar : navbar,
		pagination : pagination
	}
/*----------------------------------------------------------------------------------------------------------*/
})();
//响应式的交互处理
window.onresize = function() {
	var oEleWidth = Math.floor(document.documentElement.clientWidth); //获取屏幕宽度
	if(oEleWidth < 768) {
		component.navbar.resNavbar.showNavbar();
		component.pagination.resPage.showResPage();
	} else {
		component.navbar();
		component.navbar.resNavbar.hideNavbar();
		component.pagination.resPage.hideResPage();
	}
}
//页面加载后的起始状态
window.onload = function() {
	component.navbar();
	component.pagination({
		id : "page-stage",
		num : 10,
		now : 1,
		callBack : function(num) {
			myFn.showPageContent(num);
		}
	});
}


