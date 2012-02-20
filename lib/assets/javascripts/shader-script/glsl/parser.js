/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"{":10,"}":11,"Identifier":12,"Assign":13,"Call":14,"Literal":15,"TypeConstructor":16,"Return":17,"Comment":18,"FunctionDefinition":19,"FunctionDeclaration":20,"VariableDeclaration":21,"STATEMENT":22,"Type":23,"CALL_START":24,"ArgumentDefs":25,")":26,",":27,"ArgumentList":28,"(":29,"Arguments":30,"=":31,"IDENTIFIER":32,"NUMBER":33,"VOID":34,"BOOL":35,"INT":36,"FLOAT":37,"VEC2":38,"VEC3":39,"VEC4":40,"BVEC2":41,"BVEC3":42,"BVEC4":43,"IVEC2":44,"IVEC3":45,"IVEC4":46,"MAT2":47,"MAT3":48,"MAT4":49,"MAT2X2":50,"MAT2X3":51,"MAT2X4":52,"MAT3X2":53,"MAT3X3":54,"MAT3X4":55,"MAT4X2":56,"MAT4X3":57,"MAT4X4":58,"SAMPLER1D":59,"SAMPLER2D":60,"SAMPLER3D":61,"SAMPLERCUBE":62,"SAMPLER1DSHADOW":63,"SAMPLER2DSHADOW":64,"Operation":65,"UNARY":66,"-":67,"+":68,"--":69,"SimpleAssignable":70,"++":71,"?":72,"MATH":73,"SHIFT":74,"COMPARE":75,"LOGIC":76,"RELATION":77,"COMPOUND_ASSIGN":78,"INDENT":79,"OUTDENT":80,"EXTENDS":81,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",10:"{",11:"}",14:"Call",17:"Return",18:"Comment",20:"FunctionDeclaration",22:"STATEMENT",24:"CALL_START",26:")",27:",",29:"(",31:"=",32:"IDENTIFIER",33:"NUMBER",34:"VOID",35:"BOOL",36:"INT",37:"FLOAT",38:"VEC2",39:"VEC3",40:"VEC4",41:"BVEC2",42:"BVEC3",43:"BVEC4",44:"IVEC2",45:"IVEC3",46:"IVEC4",47:"MAT2",48:"MAT3",49:"MAT4",50:"MAT2X2",51:"MAT2X3",52:"MAT2X4",53:"MAT3X2",54:"MAT3X3",55:"MAT3X4",56:"MAT4X2",57:"MAT4X3",58:"MAT4X4",59:"SAMPLER1D",60:"SAMPLER2D",61:"SAMPLER3D",62:"SAMPLERCUBE",63:"SAMPLER1DSHADOW",64:"SAMPLER2DSHADOW",66:"UNARY",67:"-",68:"+",69:"--",70:"SimpleAssignable",71:"++",72:"?",73:"MATH",74:"SHIFT",75:"COMPARE",76:"LOGIC",77:"RELATION",78:"COMPOUND_ASSIGN",79:"INDENT",80:"OUTDENT",81:"EXTENDS"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[7,1],[7,1],[5,2],[5,3],[8,1],[8,1],[8,1],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[21,2],[19,6],[19,5],[25,2],[25,4],[28,3],[28,2],[30,1],[30,3],[13,3],[12,1],[15,1],[16,2],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[23,1],[65,2],[65,2],[65,2],[65,2],[65,2],[65,2],[65,2],[65,2],[65,3],[65,3],[65,3],[65,3],[65,3],[65,3],[65,3],[65,3],[65,5],[65,3]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = new yy.Root(new yy.Block([]));
break;
case 2:return this.$ = new yy.Root($$[$0]);
break;
case 3:return this.$ = new yy.Root($$[$0-1]);
break;
case 4:this.$ = yy.Block.wrap([$$[$0]]);
break;
case 5:this.$ = (function () {
        $$[$0-2].push($$[$0]);
        return $$[$0-2];
      }());
break;
case 6:this.$ = $$[$0-1];
break;
case 7:this.$ = $$[$0];
break;
case 8:this.$ = $$[$0];
break;
case 9:this.$ = new yy.Block;
break;
case 10:this.$ = $$[$0-1];
break;
case 11:this.$ = $$[$0];
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = $$[$0];
break;
case 20:this.$ = $$[$0];
break;
case 21:this.$ = new yy.Literal($$[$0]);
break;
case 22:this.$ = new yy.Variable($$[$0-1], $$[$0]);
break;
case 23:this.$ = new yy.Function($$[$0-5], $$[$0-4], $$[$0-2], $$[$0]);
break;
case 24:this.$ = new yy.Function($$[$0-4], $$[$0-3], [], $$[$0]);
break;
case 25:this.$ = [new yy.Variable($$[$0-1], $$[$0])];
break;
case 26:this.$ = $$[$0-3].concat([new yy.Variable($$[$0-1], $$[$0])]);
break;
case 27:this.$ = $$[$0-1];
break;
case 28:this.$ = [];
break;
case 29:this.$ = [$$[$0]];
break;
case 30:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 31:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 32:this.$ = new yy.Identifier($$[$0]);
break;
case 33:this.$ = new yy.Literal($$[$0]);
break;
case 34:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
case 35:this.$ = $$[$0];
break;
case 36:this.$ = $$[$0];
break;
case 37:this.$ = $$[$0];
break;
case 38:this.$ = $$[$0];
break;
case 39:this.$ = $$[$0];
break;
case 40:this.$ = $$[$0];
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = $$[$0];
break;
case 46:this.$ = $$[$0];
break;
case 47:this.$ = $$[$0];
break;
case 48:this.$ = $$[$0];
break;
case 49:this.$ = $$[$0];
break;
case 50:this.$ = $$[$0];
break;
case 51:this.$ = $$[$0];
break;
case 52:this.$ = $$[$0];
break;
case 53:this.$ = $$[$0];
break;
case 54:this.$ = $$[$0];
break;
case 55:this.$ = $$[$0];
break;
case 56:this.$ = $$[$0];
break;
case 57:this.$ = $$[$0];
break;
case 58:this.$ = $$[$0];
break;
case 59:this.$ = $$[$0];
break;
case 60:this.$ = $$[$0];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = $$[$0];
break;
case 65:this.$ = $$[$0];
break;
case 66:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 67:this.$ = new yy.Op('-', $$[$0]);
break;
case 68:this.$ = new yy.Op('+', $$[$0]);
break;
case 69:this.$ = new yy.Op('--', $$[$0]);
break;
case 70:this.$ = new yy.Op('++', $$[$0]);
break;
case 71:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 72:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 73:this.$ = new yy.Existence($$[$0-1]);
break;
case 74:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 75:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 76:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 77:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 78:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 79:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 80:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 81:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 82:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 83:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:6,9:7,10:[1,5],12:8,13:9,14:[1,10],15:11,16:12,17:[1,13],18:[1,14],19:15,20:[1,16],21:17,22:[1,18],23:21,32:[1,19],33:[1,20],34:[1,22],35:[1,23],36:[1,24],37:[1,25],38:[1,26],39:[1,27],40:[1,28],41:[1,29],42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,34],47:[1,35],48:[1,36],49:[1,37],50:[1,38],51:[1,39],52:[1,40],53:[1,41],54:[1,42],55:[1,43],56:[1,44],57:[1,45],58:[1,46],59:[1,47],60:[1,48],61:[1,49],62:[1,50],63:[1,51],64:[1,52]},{1:[3]},{1:[2,2],6:[1,53]},{6:[1,54]},{1:[2,4],6:[2,4],11:[2,4]},{4:56,7:4,8:6,9:7,11:[1,55],12:8,13:9,14:[1,10],15:11,16:12,17:[1,13],18:[1,14],19:15,20:[1,16],21:17,22:[1,18],23:21,32:[1,19],33:[1,20],34:[1,22],35:[1,23],36:[1,24],37:[1,25],38:[1,26],39:[1,27],40:[1,28],41:[1,29],42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,34],47:[1,35],48:[1,36],49:[1,37],50:[1,38],51:[1,39],52:[1,40],53:[1,41],54:[1,42],55:[1,43],56:[1,44],57:[1,45],58:[1,46],59:[1,47],60:[1,48],61:[1,49],62:[1,50],63:[1,51],64:[1,52]},{1:[2,7],6:[2,7],11:[2,7]},{1:[2,8],6:[2,8],11:[2,8]},{1:[2,11],6:[2,11],11:[2,11],26:[2,11],27:[2,11],31:[1,57]},{1:[2,12],6:[2,12],11:[2,12],26:[2,12],27:[2,12]},{1:[2,13],6:[2,13],11:[2,13],26:[2,13],27:[2,13]},{1:[2,14],6:[2,14],11:[2,14],26:[2,14],27:[2,14]},{1:[2,15],6:[2,15],11:[2,15],26:[2,15],27:[2,15]},{1:[2,16],6:[2,16],11:[2,16]},{1:[2,17],6:[2,17],11:[2,17]},{1:[2,18],6:[2,18],11:[2,18]},{1:[2,19],6:[2,19],11:[2,19]},{1:[2,20],6:[2,20],11:[2,20]},{1:[2,21],6:[2,21],11:[2,21]},{1:[2,32],6:[2,32],11:[2,32],24:[2,32],26:[2,32],27:[2,32],31:[2,32]},{1:[2,33],6:[2,33],11:[2,33],26:[2,33],27:[2,33]},{12:59,28:58,29:[1,60],32:[1,19]},{29:[2,35],32:[2,35]},{29:[2,36],32:[2,36]},{29:[2,37],32:[2,37]},{29:[2,38],32:[2,38]},{29:[2,39],32:[2,39]},{29:[2,40],32:[2,40]},{29:[2,41],32:[2,41]},{29:[2,42],32:[2,42]},{29:[2,43],32:[2,43]},{29:[2,44],32:[2,44]},{29:[2,45],32:[2,45]},{29:[2,46],32:[2,46]},{29:[2,47],32:[2,47]},{29:[2,48],32:[2,48]},{29:[2,49],32:[2,49]},{29:[2,50],32:[2,50]},{29:[2,51],32:[2,51]},{29:[2,52],32:[2,52]},{29:[2,53],32:[2,53]},{29:[2,54],32:[2,54]},{29:[2,55],32:[2,55]},{29:[2,56],32:[2,56]},{29:[2,57],32:[2,57]},{29:[2,58],32:[2,58]},{29:[2,59],32:[2,59]},{29:[2,60],32:[2,60]},{29:[2,61],32:[2,61]},{29:[2,62],32:[2,62]},{29:[2,63],32:[2,63]},{29:[2,64],32:[2,64]},{29:[2,65],32:[2,65]},{1:[2,6],6:[2,6],7:61,8:6,9:7,11:[2,6],12:8,13:9,14:[1,10],15:11,16:12,17:[1,13],18:[1,14],19:15,20:[1,16],21:17,22:[1,18],23:21,32:[1,19],33:[1,20],34:[1,22],35:[1,23],36:[1,24],37:[1,25],38:[1,26],39:[1,27],40:[1,28],41:[1,29],42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,34],47:[1,35],48:[1,36],49:[1,37],50:[1,38],51:[1,39],52:[1,40],53:[1,41],54:[1,42],55:[1,43],56:[1,44],57:[1,45],58:[1,46],59:[1,47],60:[1,48],61:[1,49],62:[1,50],63:[1,51],64:[1,52]},{1:[2,3]},{1:[2,9],6:[2,9],11:[2,9]},{6:[1,53],11:[1,62]},{8:63,12:8,13:9,14:[1,10],15:11,16:12,23:64,32:[1,19],33:[1,20],34:[1,22],35:[1,23],36:[1,24],37:[1,25],38:[1,26],39:[1,27],40:[1,28],41:[1,29],42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,34],47:[1,35],48:[1,36],49:[1,37],50:[1,38],51:[1,39],52:[1,40],53:[1,41],54:[1,42],55:[1,43],56:[1,44],57:[1,45],58:[1,46],59:[1,47],60:[1,48],61:[1,49],62:[1,50],63:[1,51],64:[1,52]},{1:[2,34],6:[2,34],11:[2,34],26:[2,34],27:[2,34]},{1:[2,22],6:[2,22],11:[2,22],24:[1,65]},{8:68,12:8,13:9,14:[1,10],15:11,16:12,23:64,26:[1,67],30:66,32:[1,19],33:[1,20],34:[1,22],35:[1,23],36:[1,24],37:[1,25],38:[1,26],39:[1,27],40:[1,28],41:[1,29],42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,34],47:[1,35],48:[1,36],49:[1,37],50:[1,38],51:[1,39],52:[1,40],53:[1,41],54:[1,42],55:[1,43],56:[1,44],57:[1,45],58:[1,46],59:[1,47],60:[1,48],61:[1,49],62:[1,50],63:[1,51],64:[1,52]},{1:[2,5],6:[2,5],11:[2,5]},{1:[2,10],6:[2,10],11:[2,10]},{1:[2,31],6:[2,31],11:[2,31],26:[2,31],27:[2,31]},{28:58,29:[1,60]},{23:71,25:69,26:[1,70],34:[1,22],35:[1,23],36:[1,24],37:[1,25],38:[1,26],39:[1,27],40:[1,28],41:[1,29],42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,34],47:[1,35],48:[1,36],49:[1,37],50:[1,38],51:[1,39],52:[1,40],53:[1,41],54:[1,42],55:[1,43],56:[1,44],57:[1,45],58:[1,46],59:[1,47],60:[1,48],61:[1,49],62:[1,50],63:[1,51],64:[1,52]},{26:[1,72],27:[1,73]},{1:[2,28],6:[2,28],11:[2,28],26:[2,28],27:[2,28]},{26:[2,29],27:[2,29]},{26:[1,74],27:[1,75]},{5:76,10:[1,5]},{12:77,32:[1,19]},{1:[2,27],6:[2,27],11:[2,27],26:[2,27],27:[2,27]},{8:78,12:8,13:9,14:[1,10],15:11,16:12,23:64,32:[1,19],33:[1,20],34:[1,22],35:[1,23],36:[1,24],37:[1,25],38:[1,26],39:[1,27],40:[1,28],41:[1,29],42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,34],47:[1,35],48:[1,36],49:[1,37],50:[1,38],51:[1,39],52:[1,40],53:[1,41],54:[1,42],55:[1,43],56:[1,44],57:[1,45],58:[1,46],59:[1,47],60:[1,48],61:[1,49],62:[1,50],63:[1,51],64:[1,52]},{5:79,10:[1,5]},{23:80,34:[1,22],35:[1,23],36:[1,24],37:[1,25],38:[1,26],39:[1,27],40:[1,28],41:[1,29],42:[1,30],43:[1,31],44:[1,32],45:[1,33],46:[1,34],47:[1,35],48:[1,36],49:[1,37],50:[1,38],51:[1,39],52:[1,40],53:[1,41],54:[1,42],55:[1,43],56:[1,44],57:[1,45],58:[1,46],59:[1,47],60:[1,48],61:[1,49],62:[1,50],63:[1,51],64:[1,52]},{1:[2,24],6:[2,24],11:[2,24]},{26:[2,25],27:[2,25]},{26:[2,30],27:[2,30]},{1:[2,23],6:[2,23],11:[2,23]},{12:81,32:[1,19]},{26:[2,26],27:[2,26]}],
defaultActions: {54:[2,3]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
undefined
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}