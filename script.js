// Local testing:
const BACKEND_URL = "http://localhost:3000/api/chat";

// Production deployment (e.g., Render, Vercel, Railway):
// const BACKEND_URL = "https://your-backend-domain.com/api/chat";
var DB = {
  cart:[], wish:[], orders:[], returns:[], rents:[],
  tokens:{balance:0, spent:0, history:[]},
  users:[], loggedIn:null
};
var selPlanVal = 'normal';
var vTimerInt = null;
var curRent = null;
var vPage_cur = 1, vPage_tot = 5;
var selectedPayMethod = null;
var selectedBank = null;
var currentPayOpts = null;

var ALL_PAGES = ['home','books','about','cart','order','track','tokens','rent','account'];
var NAV_TABS  = ['home','books','about','cart','order','track','tokens','rent'];

function toggleMobileNav() {
  var mobileNav = document.getElementById('mobile-nav');
  if(mobileNav) {
    mobileNav.classList.toggle('open');
  }
}

function G(name) {
  ALL_PAGES.forEach(function(p){
    var el = document.getElementById('page-'+p);
    if(el) el.classList.remove('active');
  });
  var show = document.getElementById('page-'+name);
  if(show) show.classList.add('active');
  NAV_TABS.forEach(function(t){
    var el = document.getElementById('t-'+t);
    if(el) el.classList.toggle('active', t===name);
  });
  if(name==='cart')    refreshCart();
  if(name==='tokens')  refreshTokens();
  if(name==='account') refreshAccount();
  if(name==='rent')    refreshRentPage();
}

var BOOK_PAGES = {
  'Fundamentals of Programming':[
    {ch:'Chapter 1: Introduction to Programming', txt:'Programming is the art of giving instructions to a computer. A program is a set of instructions written in a language the computer understands. We begin with fundamentals — variables, data types, operators, and control flow. Whether writing your first line of code or revisiting basics, this chapter lays the foundation for everything that follows.'},
    {ch:'Chapter 2: Variables & Data Types', txt:'A variable is a named storage location in memory. In C, you must declare the type before using it. Common types include int (integer), float (decimal), char (character), and double (large decimal). Choosing the right data type is essential for efficient programs.'},
    {ch:'Chapter 3: Operators & Expressions', txt:'Operators are symbols that tell the compiler to perform operations. Arithmetic operators (+, -, *, /) do math. Relational operators (==, !=, <, >) compare values. Logical operators (&&, ||, !) combine conditions. Understanding operator precedence is critical for writing correct expressions.'},
    {ch:'Chapter 4: Control Flow', txt:'Control flow determines the order statements are executed. The if-else statement lets your program make decisions. The for loop repeats a block a fixed number of times. The while loop continues as long as a condition is true. Mastering control flow is the key to writing programs that respond to different inputs.'},
    {ch:'Chapter 5: Functions', txt:'A function is a reusable block of code that performs a specific task. Functions make programs modular, readable, and easy to debug. In C, every program starts with main(). Good practice means writing small, focused functions that do one thing well.'}
  ],
  'Virtues of Life':[
    {ch:'Chapter 1: The Virtue of Honesty', txt:'Honesty is the foundation of all virtues. When we speak the truth, we build trust. A person who is honest does not fear being questioned. A young student once found a wallet full of money. Though no one was watching, she returned it. That single act of honesty defined her character for life.'},
    {ch:'Chapter 2: The Virtue of Kindness', txt:'Kindness costs nothing yet is the most precious gift you can offer. A kind word can heal a broken heart. A kind act can change the direction of someone\'s life. Practice one deliberate act of kindness every day and watch how your world transforms.'},
    {ch:'Chapter 3: The Virtue of Courage', txt:'Courage is not the absence of fear — it is doing right despite fear. The courageous student raises their hand when no one else does. They speak truth when silence would be easier. Every act of courage, no matter how small, builds strength for greater challenges ahead.'},
    {ch:'Chapter 4: The Virtue of Patience', txt:'In a world demanding instant results, patience is rare and powerful. A seed does not become a tree overnight. A student does not master a subject in a single reading. Patience teaches us to trust the process and find peace in the journey.'},
    {ch:'Chapter 5: Building Virtue Every Day', txt:'Virtue is not a destination — it is a daily practice. Each morning we choose honesty over deception, kindness over indifference, courage over fear. Start small. These choices, made consistently, build character that lasts a lifetime.'}
  ]
};

function getPages(name){
  if(BOOK_PAGES[name]) return BOOK_PAGES[name];
  return [
    {ch:'Chapter 1: Introduction', txt:'Welcome to "'+name+'" by Nithiyasree P. This book covers essential knowledge to help you grow as a student and as a person. Each chapter is carefully crafted, taking you from fundamentals to mastery.'},
    {ch:'Chapter 2: Core Concepts', txt:'The core concepts of this subject are built on principles tested over time. Understanding them requires patience and practice. Read each section carefully and revisit material as many times as needed.'},
    {ch:'Chapter 3: Practical Applications', txt:'Knowledge without application is incomplete. Here we explore how the ideas covered so far apply in real situations. Every example is drawn from everyday life to make concepts as relatable and memorable as possible.'},
    {ch:'Chapter 4: Advanced Topics', txt:'As you grow comfortable with the basics, we venture into advanced territory. These topics require deeper thinking and a willingness to question assumptions. Approach them with an open mind.'},
    {ch:'Chapter 5: Conclusion & Reflection', txt:'We have reached the end of our journey. The knowledge you have gained is a tool — the more you use it, the sharper it becomes. Share what you have learned, teach others, and continue to seek wisdom every single day.'}
  ];
}

function filterBooks(){
  var q = document.getElementById('searchBox').value.toLowerCase();
  var c = document.getElementById('catFilter').value;
  var count = 0;
  document.querySelectorAll('.bkc').forEach(function(card){
    var nm = card.getAttribute('data-name').indexOf(q) !== -1;
    var ct = (c==='all') || (card.getAttribute('data-cat')===c);
    var show = nm && ct;
    card.style.display = show ? '' : 'none';
    if(show) count++;
  });
  document.getElementById('noResults').style.display = count===0 ? 'block' : 'none';
}

function addToCart(name, price){
  var found = null;
  DB.cart.forEach(function(i){ if(i.name===name) found=i; });
  if(found){ found.qty++; } else { DB.cart.push({name:name, price:price, qty:1}); }
  alert('"'+name+'" added to cart! \u2705');
}

function removeItem(idx){ DB.cart.splice(idx,1); refreshCart(); }

function refreshCart(){
  var el=document.getElementById('cart-items');
  var tot=document.getElementById('cart-total');
  var tn=document.getElementById('tok-earn');
  if(!DB.cart.length){
    el.innerHTML='<div class="empty">Your cart is empty. Browse books to add some!</div>';
    tot.textContent=''; tn.textContent='';
  } else {
    var total=0; el.innerHTML='';
    DB.cart.forEach(function(it,i){
      total += it.price*it.qty;
      el.innerHTML += '<div class="cit">'+
        '<span class="cin">'+it.name+'</span>'+
        '<span class="ciq">Qty: '+it.qty+'</span>'+
        '<span class="cip">\u20B9'+(it.price*it.qty)+'</span>'+
        '<button class="rmbtn" onclick="removeItem('+i+')">Remove</button>'+
        '</div>';
    });
    tot.textContent = 'Total: \u20B9'+total;
    var tk = Math.floor(total/100);
    tn.textContent = 'You will earn '+tk+' token'+(tk!==1?'s':'')+' on this order';
  }
  refreshReturns();
  refreshWishlist();
}

function refreshReturns(){
  var sec=document.getElementById('return-section');
  var list=document.getElementById('return-list');
  var items=[];
  DB.orders.forEach(function(o){
    o.items.forEach(function(it){
      var ret = DB.returns.some(function(r){ return r.orderId===o.id && r.name===it.name; });
      items.push({orderId:o.id, item:it, returned:ret});
    });
  });
  if(!items.length){ sec.style.display='none'; return; }
  sec.style.display='block';
  list.innerHTML='';
  items.forEach(function(e){
    var refund = e.item.price*e.item.qty;
    list.innerHTML += '<div class="retit">'+
      '<span class="rin">'+e.item.name+'</span>'+
      '<span class="ris">'+(e.returned?'\u2713 Returned':'Order: '+e.orderId)+'</span>'+
      '<span class="rir">\u20B9'+refund+'</span>'+
      '<button class="retbtn"'+(e.returned?' disabled':' onclick="doReturn(\''+e.orderId+'\',\''+e.item.name+'\','+refund+')"')+'>'+(e.returned?'Returned':'Return')+'</button>'+
      '</div>';
  });
}

function doReturn(orderId, name, refund){
  if(!confirm('Return "'+name+'" for a refund of \u20B9'+refund+'?')) return;
  DB.returns.push({orderId:orderId, name:name, refund:refund, date:new Date().toLocaleDateString()});
  alert('\u2705 Return placed! Refund of \u20B9'+refund+' will be processed in 3-5 business days.');
  refreshCart();
}

function toggleWish(name, price, btn){
  var idx = DB.wish.findIndex(function(i){ return i.name===name; });
  if(idx===-1){
    DB.wish.push({name:name, price:price});
    btn.innerHTML='\u2665 Wishlisted'; btn.classList.add('on');
  } else {
    DB.wish.splice(idx,1);
    btn.innerHTML='\u2661 Wish'; btn.classList.remove('on');
  }
}

function refreshWishlist(){
  var el=document.getElementById('wish-items');
  if(!DB.wish.length){ el.innerHTML='<div class="empty">No items in wishlist yet.</div>'; return; }
  el.innerHTML='';
  DB.wish.forEach(function(it,i){
    el.innerHTML += '<div class="wit">'+
      '<span class="win">'+it.name+'</span>'+
      '<span class="wip">\u20B9'+it.price+'</span>'+
      '<div style="display:flex;gap:4px;">'+
      '<button class="wiadd" onclick="addToCart(\''+it.name+'\','+it.price+')">+Cart</button>'+
      '<button class="wirm" onclick="removeWish('+i+')">\u2715</button>'+
      '</div></div>';
  });
}

function removeWish(i){ DB.wish.splice(i,1); refreshWishlist(); }

function placeOrder(){
  var n=document.getElementById('fname').value.trim();
  var e=document.getElementById('femail').value.trim();
  var c=document.getElementById('fcity').value.trim();
  var a=document.getElementById('faddress').value.trim();
  if(!n||!e||!c||!a){ alert('Please fill in all fields!'); return; }
  if(!DB.cart.length){ alert('Your cart is empty!'); return; }
  var total=0;
  DB.cart.forEach(function(it){ total+=it.price*it.qty; });
  var snap=JSON.parse(JSON.stringify(DB.cart));
  openPayModal({
    title:'Order Payment',
    amount:total,
    items:snap.map(function(it){ return {label:it.name+' x'+it.qty, price:it.price*it.qty}; }),
    onSuccess:function(method, ref){
      var id='AWS-'+Math.random().toString(36).substr(2,8).toUpperCase();
      DB.orders.push({id:id, name:n, email:e, city:c, address:a, items:snap,
        date:new Date().toLocaleDateString(), status:'Ordered', total:total,
        payMethod:method, payRef:ref});
      var tk=Math.floor(total/100);
      DB.tokens.balance+=tk; DB.tokens.spent+=total;
      DB.tokens.history.unshift({desc:'Order '+id, amt:'+'+tk, date:new Date().toLocaleDateString()});
      DB.cart=[];
      document.getElementById('order-form').style.display='none';
      document.getElementById('order-success').style.display='flex';
      document.getElementById('oid').textContent=id;
      document.getElementById('tok-earned-msg').textContent='Earned '+tk+' token'+(tk!==1?'s':'')+' | Ref: '+ref;
      document.getElementById('pay-method-msg').textContent='Payment Method: '+method;
    }
  });
}

function resetOrder(){
  document.getElementById('order-form').style.display='flex';
  document.getElementById('order-success').style.display='none';
  ['fname','femail','fcity','faddress'].forEach(function(id){ document.getElementById(id).value=''; });
  G('books');
}

function trackOrder(){
  var q=document.getElementById('tsearch').value.trim().toLowerCase();
  var found=DB.orders.filter(function(o){ return o.id.toLowerCase()===q || o.email.toLowerCase()===q; });
  var r=document.getElementById('track-result');
  if(!found.length){ r.innerHTML='<div class="empty">No orders found for that ID or email.</div>'; return; }
  var stages=['Ordered','Packed','Shipped','Delivered'];
  r.innerHTML='';
  found.forEach(function(o){
    var si=stages.indexOf(o.status);
    var steps='';
    stages.forEach(function(s,k){
      steps += '<div class="trsp">'+
        '<div class="trdot '+(k<=si?'done':'not')+'"></div>'+
        '<div class="trlb '+(k<=si?'done':'not')+'">'+s+'</div>'+
        '</div>';
    });
    r.innerHTML += '<div class="tcard">'+
      '<div class="trid">'+o.id+'</div>'+
      '<div class="trin">'+o.name+' &bull; '+o.city+' &bull; '+o.date+'</div>'+
      '<div class="trin" style="color:#6b3010;">Payment: '+(o.payMethod||'N/A')+' | Ref: '+(o.payRef||'N/A')+'</div>'+
      '<div class="trst"><div class="trln"></div>'+steps+'</div>'+
      '</div>';
  });
}

function refreshTokens(){
  document.getElementById('tok-disp').textContent=DB.tokens.balance;
  document.getElementById('tok-spent').textContent=DB.tokens.spent;
  document.getElementById('tok-bar').style.width=Math.min((DB.tokens.balance/50)*100,100)+'%';
  document.getElementById('tok-prog').textContent=DB.tokens.balance+' / 50 for a free book';
  ['rd-1','rd-2','rd-3'].forEach(function(id){ document.getElementById(id).disabled=DB.tokens.balance<50; });
  ['rd-4','rd-5'].forEach(function(id){ document.getElementById(id).disabled=DB.tokens.balance<75; });
  document.getElementById('rd-6').disabled=DB.tokens.balance<100;
  var el=document.getElementById('tok-hist');
  if(!DB.tokens.history.length){ el.innerHTML='<div class="empty">No token activity yet.</div>'; return; }
  el.innerHTML='';
  DB.tokens.history.forEach(function(h){
    el.innerHTML += '<div class="thi"><span class="thd">'+h.desc+' \u2014 '+h.date+'</span><span class="tha">'+h.amt+'</span></div>';
  });
}

function redeemBook(name, cost){
  if(DB.tokens.balance<cost){ alert('Not enough tokens! You need '+cost+' but have '+DB.tokens.balance+'.'); return; }
  DB.tokens.balance-=cost;
  DB.tokens.history.unshift({desc:'Redeemed: '+name, amt:'-'+cost+' tokens', date:new Date().toLocaleDateString()});
  alert('\u2705 "'+name+'" redeemed for free!\nAdded to your library.');
  refreshTokens();
}

var RENT_BOOKS=[
  {name:'Fundamentals of Programming', cov:'&#128187;', hr:30, dy:60, td:150},
  {name:'Data Structures Simplified',  cov:'&#128200;', hr:35, dy:70, td:175},
  {name:'Database Management Essentials',cov:'&#128194;',hr:33,dy:66,td:165},
  {name:'The Student Power Guide',     cov:'&#128170;', hr:25, dy:50, td:125},
  {name:'Focus and Flourish',          cov:'&#127919;', hr:23, dy:46, td:115},
  {name:'Dream Plan Achieve',          cov:'&#127775;', hr:27, dy:54, td:135},
  {name:'Virtues of Life',             cov:'&#9997;',   hr:22, dy:44, td:110},
  {name:'The Right Path',              cov:'&#128161;', hr:24, dy:48, td:120},
  {name:'Character Counts',            cov:'&#11088;',  hr:21, dy:42, td:105},
  {name:'Tamil Mozhi Amudam',          cov:'&#128218;', hr:20, dy:40, td:100},
  {name:'Uyir Ezhuthukal',             cov:'&#10024;',  hr:19, dy:38, td:95},
  {name:'Vetri Vazhi',                 cov:'&#127942;', hr:18, dy:36, td:90}
];

function isPremium(){
  if(!DB.loggedIn) return false;
  var u=DB.users.find(function(x){ return x.username===DB.loggedIn; });
  return u ? u.plan==='premium' : false;
}

function refreshRentPage(){
  var lock=document.getElementById('rent-lock');
  var rc=document.getElementById('rent-content');
  if(!isPremium()){ lock.style.display='flex'; rc.style.display='none'; return; }
  lock.style.display='none'; rc.style.display='flex';
  var now=Date.now();
  var grid=document.getElementById('rentGrid');
  grid.innerHTML='';
  RENT_BOOKS.forEach(function(b,i){
    var ar=DB.rents.find(function(r){ return r.bookName===b.name && r.expiresAt>now; });
    var timerHTML=ar?'<div class="rctmr" id="rt-'+i+'">'+fmtTime(ar.expiresAt-now)+'</div>':'';
    var btnClass=ar?'rcbtn ar':'rcbtn';
    var btnLabel=ar?'&#128065; Read Now':'&#128214; Rent';
    var btnClick=ar?'openViewer(\''+b.name+'\')':'openRpModal(\''+b.name+'\')';
    grid.innerHTML += '<div class="rcard">'+
      '<div class="rccov">'+b.cov+'</div>'+
      '<div class="rcnm">'+b.name+'</div>'+
      '<div class="rcau">&#8212; Nithiyasree P</div>'+
      '<div class="rcpr">&#8377;'+b.hr+'/hr &bull; &#8377;'+b.dy+'/day</div>'+
      timerHTML+
      '<button class="'+btnClass+'" onclick="'+btnClick+'">'+btnLabel+'</button>'+
      '</div>';
  });
  refreshMyRents();
}

function refreshMyRents(){
  var el=document.getElementById('my-rents');
  var now=Date.now();
  var active=DB.rents.filter(function(r){ return r.expiresAt>now; });
  if(!active.length){ el.innerHTML='<div class="empty">No active rentals. Rent a book above!</div>'; return; }
  el.innerHTML='';
  active.forEach(function(r){
    el.innerHTML += '<div class="cit">'+
      '<span class="cin">'+r.bookName+'</span>'+
      '<span class="ciq" style="color:#2e5d00;font-weight:700;">'+r.label+'</span>'+
      '<span class="rctmr">'+fmtTime(r.expiresAt-now)+'</span>'+
      '<button class="rcbtn ar" style="padding:4px 7px;font-size:0.7rem;" onclick="openViewer(\''+r.bookName+'\')">Read</button>'+
      '</div>';
  });
}

var rpBookName='';

function openRpModal(bookName){
  rpBookName=bookName;
  var b=RENT_BOOKS.find(function(x){ return x.name===bookName; });
  if(!b) return;
  document.getElementById('rp-title').textContent='Rent: '+bookName;
  var btns=document.getElementById('rp-btns');
  btns.innerHTML=
    '<button class="rpdur" onclick="pickDuration(1)">&#9201; 1 Hour &mdash; \u20B9'+b.hr+'</button>'+
    '<button class="rpdur" onclick="pickDuration(2)">&#128197; 1 Day &mdash; \u20B9'+b.dy+'</button>'+
    '<button class="rpdur" onclick="pickDuration(3)">&#128336; 3 Days &mdash; \u20B9'+b.td+'</button>';
  document.getElementById('rpModal').classList.add('open');
}

function closeRpModal(){ document.getElementById('rpModal').classList.remove('open'); }

function pickDuration(choice){
  closeRpModal();
  var b=RENT_BOOKS.find(function(x){ return x.name===rpBookName; });
  if(!b) return;
  var durations={
    1:{ms:3600000,    label:'1 Hour',  price:b.hr},
    2:{ms:86400000,   label:'1 Day',   price:b.dy},
    3:{ms:259200000,  label:'3 Days',  price:b.td}
  };
  var d=durations[choice];
  openPayModal({
    title:'Rental Payment',
    amount:d.price,
    items:[{label:'Rent: '+rpBookName, price:d.price},{label:'Duration: '+d.label, price:''}],
    onSuccess:function(method, ref){
      var now=Date.now();
      DB.rents.push({bookName:rpBookName, ms:d.ms, label:d.label, price:d.price,
        startedAt:now, expiresAt:now+d.ms, payRef:ref, payMethod:method});
      DB.tokens.history.unshift({desc:'Rented: '+rpBookName+' ('+d.label+')', amt:'-\u20B9'+d.price, date:new Date().toLocaleDateString()});
      refreshRentPage();
      openViewer(rpBookName);
    }
  });
}

function quickRent(bookName){
  if(!DB.loggedIn){ alert('Please login to rent books!'); G('account'); return; }
  if(!isPremium()){ openUpgradeModal(); return; }
  openRpModal(bookName);
}

function openViewer(bookName){
  var now=Date.now();
  var rent=DB.rents.find(function(r){ return r.bookName===bookName && r.expiresAt>now; });
  if(!rent){ alert('No active rental for "'+bookName+'". Please rent it first!'); return; }
  curRent=rent; vPage_cur=1;
  var pages=getPages(bookName);
  vPage_tot=pages.length;
  document.getElementById('v-title').textContent=bookName;
  renderViewerPage(bookName, 1);
  document.getElementById('viewerModal').classList.add('open');
  if(vTimerInt) clearInterval(vTimerInt);
  vTimerInt=setInterval(function(){
    var left=curRent.expiresAt-Date.now();
    if(left<=0){
      document.getElementById('v-timer').textContent='EXPIRED';
      var eo=document.getElementById('exp-ov');
      if(eo) eo.classList.add('show');
      clearInterval(vTimerInt);
    } else {
      document.getElementById('v-timer').textContent=fmtTime(left);
    }
  },1000);
  document.getElementById('v-timer').textContent=fmtTime(rent.expiresAt-now);
}

function renderViewerPage(bookName, pg){
  var pages=getPages(bookName);
  var p=pages[pg-1];
  document.getElementById('v-body').innerHTML=
    '<div class="expov" id="exp-ov"></div>'+
    '<div class="vbtit">'+bookName+'</div>'+
    '<div class="vch">'+p.ch+'</div>'+
    '<div class="vtxt">'+p.txt+'</div>';
  document.getElementById('v-pg').textContent='Page '+pg+' of '+vPage_tot;
  document.getElementById('v-prev').disabled=pg===1;
  document.getElementById('v-next').disabled=pg===vPage_tot;
}

function vPage(dir){
  if(curRent && curRent.expiresAt<=Date.now()){
    var eo=document.getElementById('exp-ov');
    if(eo) eo.classList.add('show');
    return;
  }
  var np=vPage_cur+dir;
  if(np<1||np>vPage_tot) return;
  vPage_cur=np;
  renderViewerPage(document.getElementById('v-title').textContent, vPage_cur);
}

function closeViewer(){
  document.getElementById('viewerModal').classList.remove('open');
  if(vTimerInt){ clearInterval(vTimerInt); vTimerInt=null; }
  curRent=null;
  refreshRentPage();
}

function openUpgradeModal() { document.getElementById('upgModal').classList.add('open'); }
function closeUpgradeModal(){ document.getElementById('upgModal').classList.remove('open'); }

function confirmUpgrade(){
  if(!DB.loggedIn){ closeUpgradeModal(); alert('Please login first!'); G('account'); return; }
  closeUpgradeModal();
  openPayModal({
    title:'Premium Membership',
    amount:199,
    items:[{label:'Premium Membership - 1 Month', price:199}],
    onSuccess:function(method, ref){
      var u=DB.users.find(function(x){ return x.username===DB.loggedIn; });
      if(u) u.plan='premium';
      alert('\u2B50 Premium Activated!\nRef: '+ref+'\nYou can now rent and read books online!');
      refreshAccount();
      refreshRentPage();
    }
  });
}

function selPlan(p){
  selPlanVal=p;
  document.getElementById('plan-normal').classList.toggle('sel', p==='normal');
  document.getElementById('plan-premium').classList.toggle('sel', p==='premium');
}

function switchTab(t){
  document.getElementById('tab-login').classList.toggle('active', t==='login');
  document.getElementById('tab-reg').classList.toggle('active', t==='reg');
  document.getElementById('login-form').style.display=t==='login'?'flex':'none';
  document.getElementById('reg-form').style.display=t==='reg'?'flex':'none';
}

function doLogin(){
  var u=document.getElementById('l-user').value.trim();
  var p=document.getElementById('l-pass').value;
  var found=DB.users.find(function(x){ return x.username===u && x.password===p; });
  if(!found){ document.getElementById('l-err').style.display='block'; return; }
  document.getElementById('l-err').style.display='none';
  DB.loggedIn=u;
  refreshAccount();
}

function doRegister(){
  var u=document.getElementById('r-user').value.trim();
  var e=document.getElementById('r-email').value.trim();
  var p=document.getElementById('r-pass').value;
  var p2=document.getElementById('r-pass2').value;
  var err=document.getElementById('r-err');
  var ok=document.getElementById('r-ok');
  err.style.display='none'; ok.style.display='none';
  if(!u||!e||!p){ err.textContent='All fields are required!'; err.style.display='block'; return; }
  if(p!==p2){ err.textContent='Passwords do not match!'; err.style.display='block'; return; }
  if(DB.users.find(function(x){ return x.username===u; })){ err.textContent='Username already taken!'; err.style.display='block'; return; }
  DB.users.push({username:u, email:e, password:p, plan:selPlanVal});
  ok.textContent=(selPlanVal==='premium'?'Premium account':'Account')+' created! Please login.';
  ok.style.display='block';
  setTimeout(function(){ switchTab('login'); }, 1500);
}

function doLogout(){ DB.loggedIn=null; refreshAccount(); }

function refreshAccount(){
  if(DB.loggedIn){
    document.getElementById('auth-section').style.display='none';
    document.getElementById('acc-dash').style.display='flex';
    var u=DB.users.find(function(x){ return x.username===DB.loggedIn; });
    document.getElementById('dash-uname').textContent=u?u.username:DB.loggedIn;
    document.getElementById('dash-email').textContent=u?u.email:'';
    var plan=u?u.plan:'normal';
    document.getElementById('dash-badge').innerHTML='<span class="badge '+(plan==='premium'?'prem':'norm')+'">'+(plan==='premium'?'\u2605 PREMIUM':'\uD83D\uDC64 NORMAL')+'</span>';
    document.getElementById('upg-sec').style.display=plan==='premium'?'none':'flex';
    var mo=DB.orders.filter(function(o){ return u && o.email===u.email; });
    var mel=document.getElementById('my-orders');
    if(!mo.length){ mel.innerHTML='<div class="empty" style="padding:5px 0;">No orders yet.</div>'; }
    else{
      mel.innerHTML='';
      mo.forEach(function(o){
        mel.innerHTML += '<div class="orit"><span class="oiid">'+o.id+'</span><span class="oidt">'+o.date+'</span><span class="oits">'+o.status+'</span></div>';
      });
    }
  } else {
    document.getElementById('auth-section').style.display='block';
    document.getElementById('acc-dash').style.display='none';
  }
}

function changePassword(){
  var old=document.getElementById('cp-old').value;
  var nw=document.getElementById('cp-new').value;
  var err=document.getElementById('cp-err');
  var ok=document.getElementById('cp-ok');
  err.style.display='none'; ok.style.display='none';
  var u=DB.users.find(function(x){ return x.username===DB.loggedIn; });
  if(!u||u.password!==old){ err.textContent='Current password is wrong!'; err.style.display='block'; return; }
  if(!nw){ err.textContent='New password cannot be empty!'; err.style.display='block'; return; }
  u.password=nw;
  ok.style.display='block';
  document.getElementById('cp-old').value='';
  document.getElementById('cp-new').value='';
}

function openPayModal(opts){
  currentPayOpts=opts;
  selectedPayMethod=null;
  selectedBank=null;
  document.getElementById('pay-modal-title').textContent='\u{1F4B3} '+opts.title;
  var si=document.getElementById('pay-summary-items');
  si.innerHTML='';
  opts.items.forEach(function(it){
    si.innerHTML += '<div class="paysumir"><span>'+it.label+'</span>'+(it.price!==''?'<span>\u20B9'+it.price+'</span>':'')+'</div>';
  });
  document.getElementById('pay-total-disp').textContent='\u20B9'+opts.amount;
  document.getElementById('cod-amt').textContent=opts.amount;
  document.getElementById('pay-next-btn').disabled=true;
  ['pm-cod','pm-upi','pm-card','pm-netbank'].forEach(function(id){ document.getElementById(id).classList.remove('sel'); });
  document.getElementById('step-method').style.display='block';
  document.getElementById('step-details').style.display='none';
  document.getElementById('pay-done-screen').classList.remove('show');
  document.getElementById('pay-main-content').style.display='block';
  document.getElementById('payModal').classList.add('open');
}

function closePayModal(){ document.getElementById('payModal').classList.remove('open'); currentPayOpts=null; }

function selPayMethod(method){
  selectedPayMethod=method;
  ['cod','gpay','phonepe','upi','card','netbank'].forEach(function(m){ document.getElementById('pm-'+m).classList.toggle('sel', m===method); });
  document.getElementById('pay-next-btn').disabled=false;
}

function goToPayDetails(){
  if(!selectedPayMethod) return;
  document.getElementById('step-method').style.display='none';
  document.getElementById('step-details').style.display='block';
  ['cod','gpay','phonepe','upi','card','netbank'].forEach(function(m){
    var sec=document.getElementById('pay-'+m+'-section');
    if(sec) sec.classList.toggle('show', m===selectedPayMethod);
  });
  selectedBank=null;
  // Update amounts for new payment methods
  if(selectedPayMethod==='gpay' || selectedPayMethod==='phonepe'){
    var amt = currentPayOpts ? currentPayOpts.amount : 0;
    document.getElementById(selectedPayMethod+'-amt').textContent = amt;
  }
}

function backToMethod(){
  document.getElementById('step-details').style.display='none';
  document.getElementById('step-method').style.display='block';
}

function selBank(bank){
  selectedBank=bank;
  ['SBI','HDFC','ICICI','Axis','Canara','BOI'].forEach(function(b){
    document.getElementById('bank-'+b).classList.toggle('sel', b===bank);
  });
}

function fmtCard(el){ var v=el.value.replace(/\D/g,'').substr(0,16); el.value=v.replace(/(\d{4})(?=\d)/g,'$1 '); }
function fmtExp(el){ var v=el.value.replace(/\D/g,'').substr(0,4); if(v.length>=3) v=v.substr(0,2)+'/'+v.substr(2); el.value=v; }

function confirmPayment(){
  if(!selectedPayMethod){ alert('Please select a payment method!'); return; }
  var method='';
  var ref='';
  if(selectedPayMethod==='cod'){
    method='Cash on Delivery';
    ref='COD-'+Math.random().toString(36).substr(2,8).toUpperCase();
  } else if(selectedPayMethod==='gpay'){
    var gref=document.getElementById('gpay-ref').value.trim();
    if(!gref){ alert('Please enter the transaction ID from Google Pay!'); return; }
    method='Google Pay';
    ref='GPAY-'+gref.toUpperCase();
  } else if(selectedPayMethod==='phonepe'){
    var pref=document.getElementById('phonepe-ref').value.trim();
    if(!pref){ alert('Please enter the transaction ID from PhonePe!'); return; }
    method='PhonePe';
    ref='PHONEPE-'+pref.toUpperCase();
  } else if(selectedPayMethod==='upi'){
    var uid=document.getElementById('upi-id').value.trim();
    if(!uid){ alert('Please enter your UPI ID or select a UPI app!'); return; }
    method='UPI ('+uid+')';
    ref='UPI-'+Math.random().toString(36).substr(2,8).toUpperCase();
  } else if(selectedPayMethod==='card'){
    var cnum=document.getElementById('card-num').value.replace(/\s/g,'');
    var cexp=document.getElementById('card-exp').value;
    var ccvv=document.getElementById('card-cvv').value;
    var cname=document.getElementById('card-name').value.trim();
    if(cnum.length!==16){ alert('Please enter a valid 16-digit card number!'); return; }
    if(cexp.length!==5){ alert('Please enter a valid expiry date (MM/YY)!'); return; }
    if(ccvv.length!==3){ alert('Please enter a valid 3-digit CVV!'); return; }
    if(!cname){ alert('Please enter the name on your card!'); return; }
    method='Card (****'+cnum.slice(-4)+')';
    ref='CRD-'+Math.random().toString(36).substr(2,8).toUpperCase();
  } else if(selectedPayMethod==='netbank'){
    if(!selectedBank){ alert('Please select your bank!'); return; }
    method='Net Banking ('+selectedBank+')';
    ref='NB-'+Math.random().toString(36).substr(2,8).toUpperCase();
  }
  document.getElementById('pay-main-content').style.display='none';
  var doneScr=document.getElementById('pay-done-screen');
  doneScr.classList.add('show');
  document.getElementById('pay-done-id').textContent='Reference: '+ref;
  var noteMap={'Cash on Delivery':'Your order will be delivered soon. Pay in cash on delivery.',
    'Google Pay':'Google Pay payment successful. Order confirmed!',
    'PhonePe':'PhonePe payment successful. Order confirmed!',
    'UPI':'Payment received via UPI. Order confirmed!',
    'Card':'Card payment successful. Order confirmed!',
    'Net Banking':'Net banking payment successful. Order confirmed!'};
  var noteKey=Object.keys(noteMap).find(function(k){ return method.startsWith(k); }) || method;
  document.getElementById('pay-done-note').textContent=noteMap[noteKey]||'Payment confirmed!';
  currentPayOpts._method=method;
  currentPayOpts._ref=ref;
}

function onPayDone(){
  var opts=currentPayOpts;
  closePayModal();
  if(opts && opts.onSuccess) opts.onSuccess(opts._method, opts._ref);
}

function fmtTime(ms){
  if(ms<=0) return 'Expired';
  var s=Math.floor(ms/1000);
  var h=Math.floor(s/3600); s %= 3600;
  var m = Math.floor(s/60); s %= 60;
  return pad(h)+':'+pad(m)+':'+pad(s);
}
function pad(n){ return n<10?'0'+n:''+n; }

window.addEventListener('DOMContentLoaded', function(){ G('home'); });
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STORE_SYSTEM_PROMPT = `You are the official AI Assistant for 'Ancient Wisdom Store', created by author Nithiyasree P.
Use the following store details to assist customers:
- Author: Nithiyasree P
- Books: Fundamentals of Programming (₹299), Data Structures Simplified (₹349), Database Management Essentials (₹329), The Student's Power Guide (₹249), Focus & Flourish (₹229), Dream Plan Achieve (₹269), Virtues of Life (₹219), The Right Path (₹239), Character Counts (₹209), Tamil Mozhi Amudam (₹199), Uyir Ezhuthukal (₹189), Vetri Vazhi (₹179).
- Rentals: Requires Premium Plan (₹199/month). Timed online reading access.
- Tokens: ₹100 spent = 1 Token. Collect 50-100 tokens to redeem free books.`;

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: STORE_SYSTEM_PROMPT }, ...messages],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }
    res.end();
  } catch (error) {
    console.error("Backend Chat Error:", error);
    res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
    res.end();
  }
});

app.listen(3000, () => console.log("Ancient Wisdom Chatbot Backend running on port 3000"));
