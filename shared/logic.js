/* Little Logic Lab: the logic moves children use in the games, how to explain them to grown-ups,
   and how to turn the tracker's evidence into a level. Used by the Grown-ups corner page. */
(function(){
const E=(t='',c='')=>[t,c];
// kind groups, in the order the report shows them
const KINDS=[
  ['elim','Elimination: ruling things out'],
  ['only','Only one left'],
  ['neigh','Neighbours and edges'],
  ['ahead','Looking ahead'],
  ['num','Numbers']];
// Each move: id, name, kind, games (where it appears), practise (where to practise it),
// what / why / looks / home (the explainer), demo (an animated example from a named puzzle).
// demo cells: [text, class]; demo steps: [cell index, text, class, caption]
const MOVES=[
 {id:'zero',name:'Zero line',kind:'elim',games:['rovers'],practise:['rovers','Lost Rovers, any level'],
  what:'When a row or column says 0, nothing is in it, so every box there can be crossed out before doing anything else.',
  why:'This is elimination: making a problem smaller by first ruling out what cannot be true. It is the most common first step in any puzzle, and in everyday thinking.',
  looks:'They cross out 0 rows and columns first, without being told, and quickly.',
  home:'Put a coin under one of 4 cups and say "it isn\'t under the blue ones". Which cups are still worth lifting?',
  demo:{in:'Lost Rovers',cols:5,cells:[E('','gap'),E('0','clue'),E('1','clue'),E('1','clue'),E('0','clue'),E('0','clue'),E(),E(),E(),E(),E('2','clue'),E(),E(),E(),E()],
   steps:[[5,'0','clue mint','Row 1 says 0: no rovers here.'],[6,'✖','x','So every box in it…'],[7,'✖','x',''],[8,'✖','x',''],[9,'✖','x','…can be crossed out straight away.']]}},
 {id:'done',name:'Done line',kind:'elim',games:['rovers'],practise:['rovers','Lost Rovers, from level 3'],
  what:'When a row or column already has all the rover boxes its number asks for, the rest of it must be empty.',
  why:'This is elimination by counting: once a target is reached, everything else is ruled out. It needs the child to keep checking the count as they go.',
  looks:'They cross out the rest of a row as soon as it is full, instead of leaving it for later.',
  home:'Pack exactly 3 apples in a bag. Once 3 are in, does the bag need any more?',
  demo:{in:'Lost Rovers',cols:5,cells:[E('2','clue'),E('','rov'),E(),E('','rov'),E()],
   steps:[[0,'2','clue hl','This row needs 2 rover boxes…'],[0,'2','clue mint','…and it already has 2.'],[2,'✖','x','So the other boxes…'],[4,'✖','x','…must be empty.']]}},
 {id:'zone',name:'No-touch zone',kind:'elim',games:['rovers'],practise:['rovers','Lost Rovers, from level 2'],
  what:'Rovers never touch each other, even at the corners, so the ring of boxes around a parked rover must stay empty.',
  why:'Your child applies a space rule to the area around something, not just the thing itself. It is elimination plus thinking about neighbours.',
  looks:'They stop trying to park right next to another rover, and use the dashed spaces to cross out boxes.',
  home:'Place toy cars on a grid of tiles so no two cars touch, not even corner to corner. How many fit?',
  demo:{in:'Lost Rovers',cols:4,cells:[E(),E(),E(),E(),E(),E('🚀','rov'),E('','rov'),E(),E(),E(),E(),E()],
   steps:[[0,'','zone','Rovers never touch, not even at the corners.'],[1,'','zone',''],[2,'','zone',''],[3,'','zone',''],[4,'','zone',''],[7,'','zone',''],[8,'','zone',''],[9,'','zone',''],[10,'','zone',''],[11,'','zone','So every box around this one stays empty.']]}},
 {id:'once',name:'Once per row and column',kind:'elim',games:['sudoku','chips'],practise:['sudoku','Sudoku, 3×3 grids'],
  what:'Each number can appear only once in a row and once in a column, so any number already used there is ruled out for the other boxes.',
  why:'This is elimination using a rule. Your child has to keep the rule in mind and check every box in a row and a column against it.',
  looks:'They look along the row and up the column before choosing, and make fewer "two of the same" mistakes.',
  home:'Lay out 3 cups in a row. Each must hold a different coloured sweet. If two colours are used, which one goes in the last cup?',
  demo:{in:'Sudoku',cols:3,cells:[E('1','gold'),E(),E('3','gold'),E(),E('3','gold'),E(),E('3','gold'),E(),E()],
   steps:[[1,'','hl','Which number goes here?'],[1,'✖3','x hl','Not 3: this row already has a 3.'],[1,'✖1','x hl','Not 1: this row already has a 1.'],[1,'2','mint','So it must be 2.']]}},
 {id:'box',name:'Box rule',kind:'elim',games:['sudoku'],practise:['sudoku','Sudoku, 4×4 grids'],
  what:'On 4×4 boards, each small 2×2 box also holds every number once, so numbers already in the box are ruled out.',
  why:'A third rule to hold in mind at once. Juggling several rules together is a big step in logical thinking.',
  looks:'They make fewer mistakes that repeat a number inside a small box.',
  home:'Sort 4 different toys into a 2×2 egg box so each corner has a different one. If 3 are placed, which goes in the last spot?',
  demo:{in:'Sudoku',cols:2,cells:[E('1','gold'),E(),E(),E('3','gold')],
   steps:[[1,'','hl','This small box already has 1 and 3…'],[1,'2 4','x hl','…so this box can only be 2 or 4.']]}},
 {id:'last',name:'Last one missing',kind:'only',games:['sudoku','chips'],practise:['chips','Number Chips, levels 1 to 3'],
  what:'When every number but one is already in a row or column, the empty box must hold the missing one.',
  why:'This is "only one possibility left": counting what is there to see what is missing. It is often the first sure step a child learns in number puzzles.',
  looks:'They fill the last box of a row quickly and correctly, without trying numbers.',
  home:'Count out 1, 2, 3, 4 spoons, hide one behind your back and ask which number is missing.',
  demo:{in:'Number Chips',cols:3,cells:[E('2','gold'),E('3','gold'),E(),E(),E(),E(),E(),E(),E()],
   steps:[[2,'','hl','The row has 2 and 3…'],[2,'1','mint','…so the last box must be 1.']]}},
 {id:'only',name:'Only place for it',kind:'only',games:['sudoku'],practise:['sudoku','Sudoku, any grid'],
  what:'Sometimes a number can only fit in one box of a row, because every other box is blocked by its column.',
  why:'Instead of asking "what goes here?", your child asks "where can this number go?". Switching the question is a powerful thinking tool.',
  looks:'They place a number by scanning a whole row for it, even when that box could hold other numbers.',
  home:'Three friends and three chairs: Sam can\'t sit by the window and Ana can\'t either. Where must Lee sit?',
  demo:{in:'Sudoku',cols:3,cells:[E('1','gold'),E(),E(),E(),E('1','gold'),E(),E(),E(),E()],
   steps:[[6,'','hl','Where can 1 go in the bottom row?'],[6,'✖','x','Not here: this column has a 1.'],[7,'✖','x','Not here either.'],[8,'1','mint','Only one place left!']]}},
 {id:'full',name:'Full line',kind:'only',games:['rovers'],practise:['rovers','Lost Rovers, from level 4'],
  what:'When a row needs exactly as many rover boxes as it has free boxes left, every free box must be a rover.',
  why:'This matches a count against the space available: "only one way it can work". It joins counting with logic.',
  looks:'They fill a whole row in one go when the numbers match, instead of placing rovers one by one by trial.',
  home:'Five chairs, two are taken, and three friends arrive. Where must they sit?',
  demo:{in:'Lost Rovers',cols:5,cells:[E('3','clue'),E(),E('✖','x'),E(),E()],
   steps:[[0,'3','clue hl','This row needs 3 rover boxes…'],[1,'','hl','…and only 3 boxes are still free…'],[3,'','hl',''],[4,'','hl',''],[1,'','rov','…so all of them must be rover.'],[3,'','rov',''],[4,'','rov','']]}},
 {id:'edge',name:'Edge rule',kind:'neigh',games:['bulbs'],practise:['bulbs','Light the Bulbs, any level'],
  what:'A wire can\'t point off the edge of the board, so pieces on the edges and corners have only a few ways to sit.',
  why:'Starting from the most limited spots is a classic strategy: the edges give the most information for the least work.',
  looks:'They fix the corner and edge pieces first, then work inwards.',
  home:'When doing a jigsaw, ask: which pieces are easiest to place first? (The ones with a straight edge.)',
  demo:{in:'Light the Bulbs',cols:3,cells:[E('┘'),E('─'),E('┐'),E('│'),E('┼'),E('│'),E('└'),E('─'),E('┘')],
   steps:[[0,'┘','hl','This corner wire points off the board…'],[0,'┌','mint','…so it can only sit one way: turned inwards.']]}},
 {id:'match',name:'Matching neighbours',kind:'neigh',games:['bulbs'],practise:['bulbs','Light the Bulbs, from level 3'],
  what:'Wire ends must meet: if one piece points right, the piece next to it must point left to join it, and if it doesn\'t point there, the neighbour mustn\'t either.',
  why:'Each fixed piece decides its neighbours: one certain fact leads to the next. This chain reasoning is the heart of most logic puzzles.',
  looks:'After fixing one piece, they turn its neighbours to match, instead of tapping pieces at random.',
  home:'Lay dominoes end to end: the touching halves must match. Which domino can go next?',
  demo:{in:'Light the Bulbs',cols:3,cells:[E('─','mint'),E('│'),E('')],
   steps:[[0,'─','mint','This wire points right…'],[1,'│','hl','…so the next piece must point left to meet it.'],[1,'─','mint','Turned to join up!']]}},
 {id:'forced',name:'Forced move',kind:'ahead',games:['trails'],practise:['trails','Star Trails, any level'],
  what:'If a dot has only one free path left to it, the trail has to visit it now, or it can never be reached.',
  why:'This is thinking ahead: seeing what will go wrong a few moves from now and acting before it happens.',
  looks:'They visit corners and "nearly trapped" dots early, and get stuck less often.',
  home:'Walk a path that visits every square of a hopscotch grid once. Which squares must you visit early?',
  demo:{in:'Star Trails',cols:3,cells:[E('•'),E('•'),E('•'),E('🚀','path'),E('•'),E('•'),E('•'),E('•'),E('•')],
   steps:[[6,'•','hl','This corner dot has only one way in…'],[6,'🚀','path','…so the rocket must go there now, or it will be stuck later.']]}},
 {id:'cut',name:'Don\'t cut the board',kind:'ahead',games:['trails'],practise:['trails','Star Trails, 5×5 and up'],
  what:'A move that splits the remaining dots into two separate groups means one group can never be reached, so it is a move to avoid.',
  why:'This is looking at the whole board, not just the next step: checking that every part is still reachable.',
  looks:'They avoid moves through the middle that leave dots stranded on both sides.',
  home:'Draw a maze on paper with two rooms. Ask: if you close this door, can you still get into both rooms?',
  demo:{in:'Star Trails',cols:4,cells:[E('🚀','path'),E('','path'),E('•'),E('•'),E('•'),E('•'),E('•'),E('•'),E('•'),E('•'),E('•'),E('•')],
   steps:[[5,'✖','x hl','Going straight down here would split the board in two…'],[5,'•','','…so one side could never be visited.'],[2,'🚀','path','Going along the edge keeps every dot reachable.']]}},
 {id:'back',name:'Spot and fix',kind:'ahead',games:['trails'],practise:['trails','Star Trails, any level'],
  what:'When the trail gets stuck, slide back to the step where it went wrong and try another way, instead of starting over.',
  why:'Finding the exact mistake and repairing it is how good problem-solvers learn. It builds confidence that mistakes can be fixed.',
  looks:'When stuck, they slide back a few steps rather than pressing restart.',
  home:'Build a block tower that topples. Ask: which block made it wobble? Change just that one.',
  demo:{in:'Star Trails',cols:3,cells:[E('','path'),E('','path'),E('•'),E('•'),E('🚀','path'),E('•'),E('•'),E('•'),E('•')],
   steps:[[4,'🚀','path hl','Stuck: the top-right dot can\'t be reached now.'],[4,'•','','Slide back one step…'],[1,'🚀','path','…and go a different way.'],[2,'','path','']]}},
 {id:'bonds',name:'Number bonds (+)',kind:'num',games:['chips'],practise:['chips','Number Chips, levels 1 to 3'],
  what:'Splitting a total into two or three numbers that add up to it: 5 can be 1 + 4 or 2 + 3.',
  why:'Number bonds are the building blocks of mental maths. Here your child uses them as clues, not just as sums.',
  looks:'They fill sum groups correctly first time, and choose the right pair when the row also helps.',
  home:'Put 5 grapes on a plate, hide some under your hand and ask how many are hidden.',
  demo:{in:'Number Chips',cols:2,cells:[E('5+','clue'),E('','clue'),E('','cage'),E('','cage')],
   steps:[[0,'5+','clue hl','These two boxes add up to 5.'],[2,'2','cage mint','2 and 3 make 5…'],[3,'3','cage mint','…or it could be 1 and 4.']]}},
 {id:'diff',name:'Difference pairs (−)',kind:'num',games:['chips'],practise:['chips','Number Chips, level 4 and up'],
  what:'Finding two numbers that are a given distance apart: "2−" means the bigger one is 2 more than the smaller one.',
  why:'Thinking in differences is the start of subtraction and of comparing amounts, which is harder than adding for most young children.',
  looks:'Fewer mistakes in − groups, and they start with pairs like 1 and 3 without counting on fingers.',
  home:'Build two towers of blocks, one 2 taller than the other. Ask how many blocks each tower could have.',
  demo:{in:'Number Chips',cols:2,cells:[E('2−','clue'),E('','clue'),E('','cage'),E('','cage')],
   steps:[[0,'2−','clue hl','These two numbers are 2 apart.'],[2,'1','cage mint','1 and 3 are 2 apart…'],[3,'3','cage mint',''],[2,'2','cage','…and so are 2 and 4.'],[3,'4','cage','']]}},
 {id:'combine',name:'Combining two clues',kind:'num',games:['chips'],practise:['chips','Number Chips, level 3 and up'],
  what:'Using a group\'s total and the row\'s numbers together: on their own each allows several answers, but together only one fits.',
  why:'Putting two pieces of information together to reach a conclusion is the step from simple to real reasoning.',
  looks:'They fill boxes that no single clue decides, without guessing.',
  home:'"I\'m thinking of a number: it\'s more than 2, and it\'s less than 4." Which one is it?',
  demo:{in:'Number Chips',cols:3,cells:[E('3','gold'),E('','cage'),E('','cage')],
   steps:[[1,'','cage hl','This group adds up to 5: 2 and 3.'],[1,'✖3','cage x hl','The row already has a 3, so this box isn\'t 3…'],[1,'2','cage mint','…it is 2,'],[2,'3','cage mint','and the other one is 3.']]}},
 {id:'options',name:'Keeping options open',kind:'num',games:['chips'],practise:['chips','Number Chips, any level'],
  what:'When a box could be one of two numbers, writing both down and deciding later, instead of guessing.',
  why:'Holding several possibilities at once, and narrowing them down, is a grown-up thinking skill that needs good working memory.',
  looks:'They use the small "2 3" notes, and later replace them with the right number.',
  home:'Play "guess my animal": keep a list of animals it could still be, and cross them off as clues come.',
  demo:{in:'Number Chips',cols:2,cells:[E('','cage'),E('','cage')],
   steps:[[0,'2 3','cage x hl','Not sure yet: could be 2 or 3.'],[1,'3','cage mint','Later the other box turns out to be 3…'],[0,'2','cage mint','…so this one is 2.']]}}];
const GAMES={bulbs:['Light the Bulbs','light-the-bulbs/','💡','sun'],rovers:['Lost Rovers','lost-rovers/','🤖','sky'],
  chips:['Number Chips','number-chips/','🔢','lavender'],sudoku:['Sudoku','sudoku/','🧩','pink'],trails:['Star Trails','star-trails/','⭐','mint']};

// level from the evidence: needs enough chances before saying anything
function level(s){
  if(!s||s.used+s.missed+s.hint==0)return{n:0,label:'Not met yet',key:'none'};
  const r=s.recent||'',ok=[...r].filter(c=>c=='1').length,rate=r.length?ok/r.length:0;
  if(s.used>=8&&s.puz>=3&&r.length>=8&&rate>=.85)return{n:3,label:'Uses it confidently',key:'conf',rate};
  if(s.used>=3&&rate>=.6)return{n:2,label:'Practising',key:'prac',rate};
  return{n:1,label:'Just started',key:'start',rate}}
// one line of plain evidence
function evidence(m,s){
  if(!s||s.used+s.missed+s.hint==0)return 'Not come up yet. It appears in '+m.practise[1]+'.';
  const r=s.recent||'',ok=[...r].filter(c=>c=='1').length;
  let t='Used it <b>'+s.used+'</b> time'+(s.used==1?'':'s')+' in <b>'+s.puz+'</b> puzzle'+(s.puz==1?'':'s')+'.';
  if(r.length>=5)t+=' Right <b>'+ok+' of the last '+r.length+'</b> chances.';
  if(s.hint)t+=' Needed a hint here '+s.hint+' time'+(s.hint==1?'':'s')+'.';
  if(s.missed)t+=' '+s.missed+' mistake'+(s.missed==1?'':'s')+' where this rule would have helped.';
  return t}

// draws a small board (a demo or a saved moment) and, for demos, plays its steps in a loop
function board(cols,cells){return '<div class="ex-grid" style="grid-template-columns:repeat('+cols+',var(--exs,36px))">'+
  cells.map(([t,c])=>'<span class="'+(c||'')+'">'+t+'</span>').join('')+'</div>'}
function play(host,capEl,d){let k=0,stop=false;
  const reset=()=>{host.innerHTML=board(d.cols,d.cells);capEl.textContent=''};reset();
  const t=setInterval(()=>{if(stop)return;const g=host.firstChild;if(!g)return;
    if(k==d.steps.length+3){k=0;reset();return}
    if(k<d.steps.length){const[i,tx,c,s]=d.steps[k],el=g.children[i];if(el){el.textContent=tx;el.className=c||''}if(s)capEl.textContent=s}k++},1100);
  return()=>{stop=true;clearInterval(t)}}

window.LabLogic={KINDS,MOVES,GAMES,level,evidence,board,play,byId:id=>MOVES.find(m=>m.id==id)};
})();
