///////////////////////////////////////////////////////RENDERING
var canvas = document.getElementById("mainView");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ctx = canvas.getContext("2d");

var maxBlocksVertical = 2;

var colorsArray = ["green", "yellow", "cyan", "red", "orange", "blue"];
var colorIndex = 0;
var getNextColor = function() {
  return colorsArray[(colorIndex++) % colorsArray.length];
}

var marginSize = 8;

var emptyString = "";
var emptyArray = [];

var Order = {
  PREFIX : 0,
  POSTFIX : 1,
  INFIX : 2,
  TERNARY : 3,
}

var CodeNode = function(name, params) {
  //Code representation
  if(typeof name === "object") name = name.toString();
  this.name = name || emptyString;
  this.params = params ||emptyArray;
  this.order = Order.PREFIX
  this.ternOp = emptyString;
  this.blank = (name === undefined);

  //Visual representation
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;

  this.parent = null;

};

CodeNode.prototype.containsPoint = function(x, y) {
    return (x > this.x && x < this.x + this.width) && (y > this.y && y < this.y + this.height);
};

CodeNode.prototype.toString = function() {
	return this.name;
};

var nodeAt = function(node, x, y, depthlimit) {
  depthlimit = depthlimit || -1;
  if(Array.isArray(node)) {
    if(depthlimit === 0) return null;
    else {
      var i;
      for(i = 0; i < node.length; i++) {
        var childTest = nodeAt(node[i], x, y, depthlimit - 1);
        if(childTest !== null) return childTest;
      }
      return null;
    }
  } else {
    if(!node.containsPoint(x, y)) return null;
    if(depthlimit > 0) {
      var i;
      for(i = 0; i < node.params.length; i ++) {
        var childTest = nodeAt(node.params[i], x, y, depthlimit - 1);
        if(childTest !== null) return childTest;
      }
    }
    return node;
  }
};

var displayedRoot = null;

var DrawNode = function(node, x, y, width, height) {
  if(width < 1 || height < 1) {
  	node.x = -1;
  	node.y = -1;
  	node.widh = 1;
  	node.height = 1;
  	return;
  }
  
  if(Array.isArray(node)) {
    node.x = x;
    node.y = y;
    node.width = width;
    node.height = height;
    var i = 0;
    var len = node.length;
    var subHeight = height / len;
    for(i = 0; i < len; i ++) {
      DrawNode(node[i], x, y + subHeight * i, width, subHeight);
      node[i].parent = node;
    }
  } else {

	if(!node) console.trace("OHHHHH NOOOOO");
    if(!node.params.map) console.log(node);
    node.params.map(function(p) { p.parent = node; });

	ctx.fillStyle = "white";

    ctx.strokeStyle = "#000000";
    
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = getNextColor();
    if(node.blank) ctx.fillStyle = "white";
    
    var len = node.params.length;
    var subWidth = width / (len + ((node.order === Order.TERNARY) ? 2 : 1));

    node.x = x;
    node.y = y;
    node.width = width;
    node.height = height;

    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
   
    var offset = 0;
    if(node.order === Order.INFIX || node.order === Order.TERNARY) offset = 1;
    else if(node.order === Order.POSTFIX) offset = len;

    var size = Math.min(Math.floor((subWidth / node.name.length) * 0.75), height);
    ctx.font = size + "pt Times";
    ctx.fillStyle = "black";
    ctx.fillText(node.name, x + subWidth / 2 + subWidth * offset, y + height / 2);
    if(node.order !== Order.INFIX && node.order !== Order.TERNARY) {
      var i = 0;
      var paramOffset = 1;
      if(node.order === Order.POSTFIX) paramOffset = 0;
      for(i = 0; i < len; i ++) {
        DrawNode(node.params[i], x + subWidth * (i + paramOffset) + marginSize, y + marginSize, subWidth - marginSize * 2, height - marginSize * 2);
      }
    } else if(node.order === Order.INFIX) {
      DrawNode(node.params[0], x + marginSize, y + marginSize, subWidth - marginSize * 2, height - marginSize * 2);
      DrawNode(node.params[1], x + marginSize + subWidth * 2, y + marginSize, subWidth - marginSize * 2, height - marginSize * 2);
    } else if(node.order === Order.TERNARY) {
      DrawNode(node.params[0], x + marginSize, y + marginSize, subWidth - marginSize * 2, height - marginSize * 2);
      DrawNode(node.params[1], x + marginSize + subWidth * 2, y + marginSize, subWidth - marginSize * 2, height - marginSize * 2);
      DrawNode(node.params[2], x + marginSize + subWidth * 4, y + marginSize, subWidth - marginSize * 2, height - marginSize * 2);
      ctx.font = size + "pt Times";
      ctx.fillText(node.ternOp, x + subWidth / 2 + subWidth * 3, y + height / 2);
    }
  }
};

var RenderFromRoot = function (node) {
  if(Array.isArray(node)) {
    canvas.width = window.innerWidth;
    canvas.height = (window.innerHeight / maxBlocksVertical) * (node.length + 0.5);
  } else {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  displayedRoot = node;
  colorIndex = 0;
  DrawNode(node, 0, 0, canvas.width, canvas.height - (window.innerHeight / maxBlocksVertical) / 2);
  if(Array.isArray(node)) {
	var size = Math.min(Math.floor((canvas.width / 3) * 0.75), window.innerHeight / maxBlocksVertical / 4);
    ctx.font = size + "pt Times";
    ctx.fillStyle = "gray";
    ctx.fillText("...", canvas.width / 2, canvas.height - (window.innerHeight / (maxBlocksVertical * 4)));
  }
} 

////////////////////////////////////////////////////////////////////////////////////PARSING

var esprimaToCodeNodes = function(syntaxObj) {
	
	//TO ADD:
	// TryStatement - try { <block> } <handlers> <finalizer>
	//		CatchClause - catch (<param>) <body>
	// *UnaryExpression - same as UpdateExpression
	// *NewExpression - new <callee>(<arguments>)
	// *ConditionalExpression - <test> ? <consequent> : <alternate>
	// *ForInStatement - for(<left> in <right>) <body>
	// *LogicalExpression - same as BinaryExpression
	
	//TODO- build trie system for faster checks
	if(syntaxObj.type === "Program" || syntaxObj.type === "BlockStatement") {
		if(syntaxObj.body.length === 0) return new CodeNode("{}");
		return syntaxObj.body.map(esprimaToCodeNodes);
	} else if (syntaxObj.type === "ExpressionStatement") {
		return esprimaToCodeNodes(syntaxObj.expression);
	} else if (syntaxObj.type === "WhileStatement") {
		var whileNode = new CodeNode("while", [esprimaToCodeNodes(syntaxObj.test), 
										esprimaToCodeNodes(syntaxObj.body)]);
		return whileNode;
	} else if (syntaxObj.type === "IfStatement") {
		if(syntaxObj.alternate) return new CodeNode("if", [esprimaToCodeNodes(syntaxObj.test), esprimaToCodeNodes(syntaxObj.consequent), esprimaToCodeNodes(syntaxObj.alternate)]);
		else return new CodeNode("if", [esprimaToCodeNodes(syntaxObj.test), esprimaToCodeNodes(syntaxObj.consequent)]);
	} else if (syntaxObj.type === "TryStatement") {
		params = [esprimaToCodeNodes(syntaxObj.block), syntaxObj.handlers.map(esprimaToCodeNodes)];
		if(syntaxObj.finalizer) params.push(esprimaToCodeNodes(syntaxObj.finalizer));
		return new CodeNode("try", params);
	} else if (syntaxObj.type ==="CatchClause") {
		return new CodeNode("catch", [esprimaToCodeNodes(syntaxObj.param), esprimaToCodeNodes(syntaxObj.body)]);
	} else if (syntaxObj.type === "ConditionalExpression") {
		var tern = new CodeNode("?", [esprimaToCodeNodes(syntaxObj.test), esprimaToCodeNodes(syntaxObj.consequent), esprimaToCodeNodes(syntaxObj.alternate)]);
		tern.ternOp = ":";
		tern.order = Order.TERNARY;
		return tern;
	} else if (syntaxObj.type === "ForStatement") {
		return new CodeNode("for", [esprimaToCodeNodes(syntaxObj.init), esprimaToCodeNodes(syntaxObj.test),esprimaToCodeNodes(syntaxObj.update), esprimaToCodeNodes(syntaxObj.body)]);
	} else if (syntaxObj.type === "ForInStatement") {
		return new CodeNode("for", [esprimaToCodeNodes(syntaxObj.left),esprimaToCodeNodes(syntaxObj.right), esprimaToCodeNodes(syntaxObj.body)]);
	} else if (syntaxObj.type === "BinaryExpression" || syntaxObj.type === "AssignmentExpression" || syntaxObj.type === "LogicalExpression") {
		var lhs = esprimaToCodeNodes(syntaxObj.left);
		var rhs = esprimaToCodeNodes(syntaxObj.right);
		var binOpNode = new CodeNode(syntaxObj.operator, [lhs, rhs]);
		binOpNode.order = Order.INFIX;
		return binOpNode;
	} else if (syntaxObj.type === "CallExpression" || syntaxObj.type === "NewExpression") {
		//TODO better support for callee names
		return new CodeNode(esprimaToCodeNodes(syntaxObj.callee), syntaxObj.arguments.map(esprimaToCodeNodes));
	} else if (syntaxObj.type === "UpdateExpression" || syntaxObj.type === "UnaryExpression") {
		var updateNode = new CodeNode(syntaxObj.operator, [esprimaToCodeNodes(syntaxObj.argument)]);
		if(!syntaxObj.prefix) updateNode.order = Order.POSTFIX;
		return updateNode;
	} else if (syntaxObj.type === "Identifier") {
		return new CodeNode(syntaxObj.name);
	} else if (syntaxObj.type === "Literal") {
		return new CodeNode(syntaxObj.raw);
	} else if (syntaxObj.type === "ThisExpression") {
		return new CodeNode("this");
	} else if (syntaxObj.type === "BreakStatement") {
		return new CodeNode("break");
	} else if (syntaxObj.type === "VariableDeclaration") {
		if(syntaxObj.declarations.length === 1) return esprimaToCodeNodes(syntaxObj.declarations[0]);
		else return syntaxObj.declarations.map(esprimaToCodeNodes);
	} else if (syntaxObj.type === "VariableDeclarator") {
		if(syntaxObj.init === null) {
			return new CodeNode("var", [esprimaToCodeNodes(syntaxObj.id)]);
		} else {	
			//TODO: add explicit support for variable declarations (var statements)
			var lhs = esprimaToCodeNodes(syntaxObj.id);
			var rhs = esprimaToCodeNodes(syntaxObj.init);
			var dec = new CodeNode("=", [lhs, rhs]);
			dec.order = Order.INFIX;
			return dec;
		}
	} else if(syntaxObj.type === "MemberExpression") {
		return new CodeNode(esprimaToCodeNodes(syntaxObj.object).name + "." + esprimaToCodeNodes(syntaxObj.property).name);
	} else if(syntaxObj.type === "ObjectExpression") {
		if(syntaxObj.properties.length === 0) return new CodeNode("{}");
		return syntaxObj.properties.map(esprimaToCodeNodes);
	} else if(syntaxObj.type === "Property") {
		var prop = new CodeNode(" : ", [esprimaToCodeNodes(syntaxObj.key), esprimaToCodeNodes(syntaxObj.value)]);
		prop.order = Order.INFIX;
		return prop;
	} else if(syntaxObj.type === "FunctionExpression") {
		var params = syntaxObj.params.map(esprimaToCodeNodes);
		params.push(esprimaToCodeNodes(syntaxObj.body));
		return new CodeNode("function", params);
	} else if(syntaxObj.type === "FunctionDeclaration") {
		var params = syntaxObj.params.map(esprimaToCodeNodes);
		params.push(esprimaToCodeNodes(syntaxObj.body));
		return new CodeNode("function " + syntaxObj.id.name, params);
	} else if(syntaxObj.type === "ArrayExpression") {
		if(syntaxObj.elements.length === 0) return new CodeNode("[]");
		return syntaxObj.elements.map(esprimaToCodeNodes);
	} else if(syntaxObj.type === "ReturnStatement") {
		if(syntaxObj.argument) return new CodeNode("return", [esprimaToCodeNodes(syntaxObj.argument)]);
		else return new CodeNode("return"); 
	} else if(syntaxObj.type === "SwitchStatement") {
		var params = syntaxObj.cases.map(esprimaToCodeNodes);
		params.unshift(esprimaToCodeNodes(syntaxObj.discriminant));
		return new CodeNode("switch", params);
	} else if(syntaxObj.type === "SwitchCase") {
		//TODO default case?
		return new CodeNode("case", [esprimaToCodeNodes(syntaxObj.test), syntaxObj.consequent.map(esprimaToCodeNodes)]);
	} else {
		console.log("TODO: Add handler for " + syntaxObj.type);
		console.log(syntaxObj);
	}
}

var parse = function(code) {
	var syntax = esprima.parse(code);
	console.log(syntax);
	return esprimaToCodeNodes(syntax);
}



var addIndents = function(n) {
  try {
  if(n === 0) return "";
  else return new Array(n+1).join("\t");
  } catch (e) {
  	console.trace("OHHHH NOOOOOOO! " + n)
  	return "";
  }
}

//TODO: put the code block outside the parens of flow controllers like 'while' and 'if' 
var writeCode = function(node, indent) {
  var code = "";
  if(Array.isArray(node)) {
    var i = 0;
    code += "{\n";
    for(i = 0; i < node.length; i ++) {
       code += addIndents(indent) + writeCode(node[i], indent+1) + "\n";
    }
    code += addIndents(indent - 1) + "}\n";
  } else {
    if(node.order === Order.PREFIX) code += node.name;
    if(node.params.length != 0) {
      if(node.order === Order.PREFIX) {
        code += "(";
        var i = 0;
        for(i = 0; i < node.params.length; i ++) {
          if(Array.isArray(node.params[i])) code += ") ";
          code += writeCode(node.params[i], indent);
          if(i < node.params.length - 1 && !Array.isArray(node.params[i+1])) code += ",";
        }
        if(code[code.length-2] !== "}") code += ")";
      } else if (node.order === Order.POSTFIX) {
        var i = 0;
        for(i = 0; i < node.params.length; i ++) {
          code += writeCode(node.params[i], indent);
          if(i < node.params.length - 1 && !Array.isArray(node.params[i+1])) code += ",";
        }
        code += node.name;
      } else if (node.order === Order.INFIX) {
        code += writeCode(node.params[0], indent);
        code += node.name;
        code += writeCode(node.params[1], indent);
      } else if (node.order === Order.TERNARY) {
        code += writeCode(node.params[0], indent);
        code += " " + node.name + " ";
        code += writeCode(node.params[1]), indent;
        code += " " + node.ternOp + " ";
        code += writeCode(node.params[2]), indent;
      }
    }
  }

  return code;
}

///////////////////////////////////////////////////////////////////////////////////DEMO
var infixGT = function () {
  var cn = new CodeNode(">", [new CodeNode("x"), new CodeNode("0")]);
  cn.order = Order.INFIX;
  return cn;
}

var postfixDecr = new CodeNode("--", [new CodeNode("x")]);
postfixDecr.order = Order.POSTFIX;

var infixAssign = function() { var cn = new CodeNode("=", [new CodeNode("x"), new CodeNode("10")]);
cn.order = Order.INFIX;
return cn; }

var ternIf = new CodeNode("?", [infixGT(), new CodeNode("'impossible!'"), new CodeNode("'wow!'")]);
ternIf.order = Order.TERNARY;
ternIf.ternOp = ":";

var testnode = [infixAssign(),
 new CodeNode("while", [infixGT(),
 	[
 		new CodeNode("alert", [new CodeNode("x")]), postfixDecr]]),
 new CodeNode("alert", [new CodeNode("'wow!'")])];
 //new CodeNode("if", [infixGT(), [infixAssign(), infixAssign(), infixAssign(), infixAssign(), infixAssign()]])];


//RenderFromRoot(parse(prompt("put code here")));

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var codeStr = getParameterByName("codestring");
if(!codeStr && codeStr === "") codeStr = prompt("enter code here");
RenderFromRoot(parse(codeStr));

//alert(writeCode(displayedRoot, 1));


var traverseUpToBlock = function(node) {
  if(!node.parent) return node;
  if(Array.isArray(node.parent)) return node.parent;
  return traverseUpToBlock(node.parent);
}

var upOne = function() {
    if(displayedRoot.parent) {
      var oldRoot = displayedRoot;
      RenderFromRoot(traverseUpToBlock(displayedRoot));
      window.scrollTo(0, oldRoot.y);
    }
}

var appendBlank = function() {
	var newNode = new CodeNode();
	displayedRoot.push(newNode);
	RenderFromRoot(displayedRoot);
}

window.onkeydown = function(e) {
  if(e.keyCode === 8) {
    upOne();
  }
}

var mc = new Hammer.Manager(canvas);

mc.add(new Hammer.Tap({event: 'doubletap', taps: 2, posThreshold: 32}) );
mc.add(new Hammer.Tap({event: 'singletap'}) );
mc.add(new Hammer.Swipe({event: 'swiperight', direction: Hammer.DIRECTION_RIGHT}));
//mc.add(new Hammer.Swipe({event: 'swipeup', direction: Hammer.DIRECTION_UP, domEvents: true}));

mc.get('doubletap').recognizeWith('singletap');
mc.get('singletap').requireFailure('doubletap');

mc.on("swiperight", function(ev) {
	upOne();
});

mc.on("singletap", function(ev) {
		console.log(ev);
		var e = ev.pointers[0];
	  var node = null;
		var i = 0;
		if(Array.isArray(displayedRoot)) {
		  while(i < displayedRoot.length && node === null) {
			node = nodeAt(displayedRoot[i], e.pageX, e.pageY, 10);
			i++;
		 }
		} else {
		  node = nodeAt(displayedRoot, e.pageX, e.pageY, 10);
		}
		if(node) {
		  //alert(writeCode(node, 1));
		  if(node.blank) {
				node.blank = false;
				node.name = "new code";
				RenderFromRoot(displayedRoot);
				//window.scrollTo(0, node.y);
		  } else {
			var target = traverseUpToBlock(node);
			//if(target === displayedRoot) target = node;
			RenderFromRoot(target);
		  }
		} else {
			appendBlank();
		}
});

mc.on("doubletap", function(ev) {
	var node = null;
	var e = ev.pointers[0];
	node = nodeAt(displayedRoot, e.pageX, e.pageY, 10);
	if(node) {
		alert(writeCode(node, 1));
	}
});