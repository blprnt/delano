let v;
let qSheet;
let qPage;

let wrapper;
let currentPageElement;
let currentVideo;
let currentPage = -1;
let currentQ = 0;
let startTime;
let lastTime;

let scroller;

let timing = false;

let lang = "en";

let piled1 = false;
let piled2 = false;
let piled3 = false;

let xml;

let illiFactor = 1440.0 / 981.0;

function preload() {
  qSheet = loadJSON("qSheet.json");
  //xml = loadXML("bigSpread.xml");
}

function setup() {
  console.log("setup");
  //Used to make the q page for the step down scene
  //parseSpread(xml);

  wrapper = select(".comic");

  //Run through the q sheet and make elements for each, and set up timers
  qSheet.queues.forEach((q) => {

    let d = document.querySelector("#frame" + q.pageNum);
    d.q = q;
    q.time = 0;

    //preload bubbles
    if (q.bubbleSet) {
      q.bubbleSet.forEach(b => {
        preloadImage(b.url);
      });
    }
    
    let p = processPage(q, d);
    processQ(q.queues[0], p, true);
    q.queues.shift();
    p.currentQ++;
    


  });

  //Set the timer value - this gets set again so may be redundant but I'm leaving it for now
  lastTime = new Date();

  //Initialize the scroll library
  init();
}

function draw() {
  if (timing) {
    
  }

  doTimer();
}

function preloadImage(url)
{
    var img=new Image();
    img.src=url;
}

function mousePressed() {}

function keyPressed() {
  if (key == "s") setLanguage("es");
  if (key == "e") setLanguage("en");
  if (key == " ") {
  }
}

function resetTimer() {
  startTime = new Date();
  timing = true;
  lastTime = new Date();
}

function doTimer() {
  let now = new Date();
  let ft = (now.getTime() - lastTime.getTime()) / 1000;

  let pages = document.querySelectorAll(".page");
  pages.forEach(p => {
    let isIn = isElementInViewport(p);
    if (isIn) {
      p.time += ft;
      if (p.currentQ < p.q.queues.length) {
        if (p.time > parseFloat(p.q.queues[p.currentQ].time)) {
          processQ(p.q.queues[p.currentQ], p.p5);
          p.currentQ++;
        }
      }
    }
  });

  lastTime = now;
}

//Scaling stuff



function doScaleAll() {
  let cwraps = document.querySelectorAll(".contentWrap");

  cwraps.forEach(cw => {
    doScale(cw.p5);
  });
}

function doScale(_cw) {
  

  let hf = ((windowWidth * 1) / 1920) * illiFactor;
    //let wf = (windowWidth / 1920) * illiFactor;
    let sf = hf;//max(hf, wf);
    //console.log(hf + ":" + wf);
    console.log(sf);
    console.log(_cw.elt);
    if (windowWidth / windowHeight < 1.77) _cw.elt.style.transform = "scale(" + sf +  ")";
    

}

window.onresize = doScaleAll;

screen.orientation.addEventListener("change", (event) => {
  console.log("orientation event");
  doScaleAll();
});


function isElementInViewport (el) {

    var rect = el.getBoundingClientRect();
    return (
        (rect.top >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight))|| rect.bottom >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
}

function loadVideoTrans(_url1, _url2, _offset, _elt, _slug) {
  
  let vh = createDiv(`<video id="` + _slug + `" muted playsinline>
  <source 
    src="` + _url1 + `" 
    type="video/mp4; codecs="hvc1"">
  <source 
    src="` + _url2 + `" 
    type="video/webm">
  </video>`);
  vh.class("videoWrapperTrans");
  gsap.to(vh.elt, {opacity:1})
  
  vh.parent(_elt.contentWrap);
  
  _elt.mainVideo = document.querySelector("#" + _slug);
}


function addBubbles(_i, _elt) {
  let bi = createImg(_elt.q.bubbleSet[_i].url, 'speech bubbles');
  bi.class("bubbleImage");
  _elt.bubbleWrap.child(bi);
}

function loadVideo(_url, _elt, _isFirst) {

  let vh = createDiv();
  vh.class(_isFirst ? "videoWrapper frameBack":"videoWrapper");
  vh.parent(_elt.contentWrap);
  _elt.mediaWrap = vh;

  let v = createDiv(`<video id="currentvideo" muted playsinline>
  <source 
    src="` + _url + `" 
    type="video/mp4; codecs="hvc1"">
  </video>`);

  //v.elt.querySelector('#currentvideo').play();
  v.parent(vh);

  vh.style("opacity", 0);
  gsap.to(vh.elt, {opacity:1, duration:2});

  _elt.mainVideo = v.elt.querySelector('#currentvideo');

}

function loadImageQ(_q, _elt, _isFirst) {
  
  let vh = createDiv("<div class='imageDiv'><img src=" + _q.url + "></div>");
  vh.class(_isFirst ?"imageWrapper frameBack":"imageWrapper");
  vh.parent(_q.isBack ? _elt.contentWrap:_elt.contentWrap);


   if (_q.pos) {
    vh.elt.style.left = _q.pos.x + "px";
    vh.elt.style.top = _q.pos.y + "px";
   } else {
    _elt.mediaWrap = vh;
   }
   if (_q.animate) {
    vh.style("opacity", 0);
    if (_q.animate.indexOf("fade") != -1) {
      gsap.to(vh.elt, {opacity:1});
    }
   }
  
}

function imageDrift(_q, _elt) {
  let bi = _elt.elt.querySelector(".imageWrapper");
  gsap.to(bi, { left: "-=50%", ease: "none", duration: 10, delay: 10 });
}

function capDrift(_q, _elt) {
  let bi = _elt.elt.querySelector(".capwrap");
  let bw = _elt.elt.querySelector(".bubblewrap");
  let vi = _elt.elt.querySelector(".videoWrapperTrans");
  gsap.to(vi, { opacity:1, delay: 16.1, duration:1 });
  gsap.to(vi, { left: "-=50%", ease: "none", duration: 10, delay: 10 });
  gsap.to(bi, { left: "-=50%", ease: "none", duration: 10, delay: 10 });
  gsap.to(bw, { left: "-=50%", ease: "none", duration: 10, delay: 10 });
}

function processQ(_q, _elt, _isFirst) {
  let t = _q.type;
  switch (t) {
    case "caption":
      addCaption(_q.caption, _elt);
      break;
    case "bubbles":
      addBubbles(_q.index, _elt);
      break;
    case "videoLoad":
      loadVideo(_q.url, _elt, _isFirst);
      break;
    case "videoLoadTrans":
      loadVideoTrans(_q.url, _q.url2, _q.offset, _elt, _q.slug);
      break;
    case "videoPlay":
      _elt.mainVideo.play();
      break;
    case "imageLoad":
      loadImageQ(_q, _elt, _isFirst);
      break;
    case "imageDrift":
      imageDrift(_q, _elt);
      break;
    case "capDrift":
      capDrift(_q, _elt);
      break;
  }
}

function setLanguage(_code) {
  let captions = selectAll(".caption");
  captions.forEach((c) => {
    try {
     console.log(c);
      c.html(c.elt.params["text_" + _code]);
    } catch (e) {

    }
  });
  lang = _code;
}


function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}


function processPage(_q, _frame) {
  let pe = createDiv();
  pe.parent(_frame);
  pe.class("page");
  pe.q = _q;
  pe.elt.q = _q;
  pe.elt.time = 0;
  pe.elt.currentQ = 0;
  pe.elt.p5 = pe;

  //content holder - this gets scaled
  let contentWrap = createDiv();
  contentWrap.class("contentWrap");
  contentWrap.parent(pe);
  pe.contentWrap = contentWrap;
  contentWrap.q = _q;
  contentWrap.elt.q = _q;
  contentWrap.elt.p5 = contentWrap;

  //bubble wrapper
  let bubbleWrap = createDiv();
  bubbleWrap.class("bubblewrap");
  bubbleWrap.parent(contentWrap);
  pe.bubbleWrap = bubbleWrap;

  //caption wrapper
  let capWrap = createDiv();
  capWrap.class("capwrap");
  capWrap.parent(contentWrap);
  pe.capWrap = capWrap;

  gsap.to(pe.elt, { opacity: 1 });

  qPage = _q;

  doScale(contentWrap);

  return(pe);
}

function addCaption(_params, _elt) {
  let e = createDiv(_params["text_" + lang]);
  e.parent(_elt.capWrap);
  e.class("caption" + (_params.extra ? (" " + _params.extra) : "" ));
  e.elt.params = _params;

  e.elt.style.left = (_params.pos.x) + "px";
  e.elt.style.top = (_params.pos.y) + "px";
  e.elt.style.width = _params.width + "px";

  if (_params.transform) {
    e.elt.style.transform = _params.transform;
  }

  gsap.to(e.elt, { opacity: 1 });
}

// scrollama event handlers
function handleStepEnter(response) {
  //console.log(response);
  //console.log("ENTER" + response.index);

  if (response.index < 9) {
    hideComic();
  }

  if (response.index == 1) {
    gsap.to(document.querySelector("#mcclellanCaption"), {
      opacity: 1,
      rotation: "-2deg",
      duration: 1,
    });
  }
  if (response.index == 2) {
    gsap.to(document.querySelector("#yooCaption"), {
      opacity: 1,
      rotation: "2deg",
      duration: 1,
    });
  }
  if (response.index == 3) {
    gsap.to(document.querySelector("#mullenCaption"), {
      opacity: 1,
      rotation: "2deg",
      duration: 1,
    });
  }
  if (response.index == 4 && !piled3) {
    piled3 = true;
    let i = 0;
    document.querySelectorAll(".pile3").forEach((c) => {
      gsap.to(c, { opacity: 1, delay: 0.5 + i * 0.25, top: "+=50px" });
      i++;
    });
  }
  if (response.index == 5 && !piled1) {
    piled1 = true;
    let i = 0;
    document.querySelectorAll(".pile").forEach((c) => {
      gsap.to(c, { opacity: 1, delay: 0.5 + i * 0.5, top: "+=50px" });
      i++;
    });
  }
  if (response.index == 6) {
    if (!piled2) {
      piled2 = true;
      let i = 0;
      let times = [0, 0.5, 1, 2];
      document.querySelectorAll(".pile2").forEach((c) => {
        gsap.to(c, { opacity: 1, delay: times[i] });
        i++;
      });
    }
  }

  if (response.index == 6) {
        gsap.to(document.querySelector("#triggerCaption"), { opacity: 1, delay: 4 });
  }

  if (response.index == 22) {
    hideComic();
  }

  if (response.index == 23) {
    gsap.to(document.querySelector("#endCaption"), {
      opacity: 1,
      rotation: "2deg",
      duration: 1,
    });
  }

  if (response.element.classList.contains("frame")) {
    if (document.querySelector("#frameset").style.opacity == 0) {
      gsap.to(document.querySelector("#frameset"), { opacity: 1, delay: 0 });
    }
    console.log("ENTER FRAME");
    timing = true;
    response.element.timing = true;
    lastTime = new Date();
  } else {
    if (document.querySelector("#frameset").style.opacity == 1) {
      gsap.to(document.querySelector("#frameset"), { opacity: 0, delay: 0 });
    }
  }
}

function handleStepExit(response) {
  console.log("EXIT:" + response.index);
  if (response.element.classList.contains("frame")) {
    response.element.timing = false;
  }

  if (response.index == 8) {
        //gsap.to(document.querySelector("#triggerCaption"), { opacity: 0, top:"-=100", delay: 0 });
  }
}

function hideComic() {
  if (timing) {
      timing = false;
      gsap.to(document.querySelector(".shade"), {
        opacity: 0,
        duration: 1,
      });

      let i = 0;
      document.querySelectorAll(".pile2").forEach((c) => {
        gsap.to(c, { opacity: 1, delay: 0.5 + i * 0.1});
        i++;
      });

      gsap.to(document.querySelector("#triggerCaption"), { opacity: 1, delay: 0 });
    }
}

//Scrolling stuff
function init() {
  console.log("init");
  scroller = scrollama();
  // 1. setup the scroller with the bare-bones options
  // 		this will also initialize trigger observations
  // 2. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      step: ".content .scrollStep",
      debug: false,
      offset: 0.5,
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);
}

function parseSpread(_x) {
  let firsts = [
    {
      en: "These photographs tell the story of a time",
      sp: "These photographs tell the story of a time",
      time: 1,
    },
    {
      en: "The story of a place",
      sp: "The story of a place",
      time: 2,
    },
    {
      en: "The story of a nation.",
      sp: "The story of a nation.",
      time: 3,
    },
    {
      en: "The story of a people.",
      sp: "The story of a people.",
      time: 4,
    },
    {
      en: "In this one there is a whole life left to be lived",
      sp: "In this one there is a whole life left to be lived",
      time: 5,
    },
    {
      en: "In this one there is an answer",
      sp: "In this one there is an answer",
      time: 6.5,
    },
    {
      en: "In this photograph there is a dream",
      sp: "In this photograph there is a dream",
      time: 7.5,
    },
    {
      en: "There are",
      sp: "There are",
      time: 8.5,
    },
    {
      en: "In this one there's a tragedy",
      sp: "In this one there's a tragedy",
      time: 9.5,
    },
    {
      en: "In this image there is a question",
      sp: "In this image there is a question",
      time: 10.5,
    },
    {
      en: "so",
      sp: "so",
      time: 11,
    },
    {
      en: "many",
      sp: "many",
      time: 11.5,
    },
  ];
  //<rect x="1093.75" y="173" class="st0" width="31.82" height="20.45"/>
  /*
  {
          "time": 12.0,
          "type": "caption",
          "caption": {
            "text_en": "THIS WAS THE START OF A YEARs-long project THAT WOULD RESULT IN SOME OF THE most iconic and  important images OF THE ERA.",
            "text_es": "Este fue el comienzo de un proyecto, el cual duró varios años, que daría como resultado algunas de las imágenes más icónicas e importantes de la época.",
            "pos": { "x": 653, "y": 358 },
            "transform": "rotate(8deg)",
            "width": 270
          }
        }
  */
  let captions = _x.getChildren("rect");

  //Sort the captions on X
  captions.sort(function (_a, _b) {
    return _a.getNum("x") - _b.getNum("x");
  });

  let j = {};
  j.pageNum = 6;
  j.backDims = {
    width: 1920,
    height: 1080,
  };
  j.queues = [];
  let i = 0;
  captions.forEach((c) => {
    let cj = {};
    if (c.getString("class") == "st0") {
      cj.type = "caption";
      if (i < firsts.length) {
        cj.time = firsts[i].time;
        cj.caption = {
          text_ven: firsts[i].en,
          text_sp: firsts[i].sp,
          pos: {
            x: c.getNum("x"),
            y: c.getNum("y"),
          },
          width: c.getNum("width"),
        };
      } else if (i > 56) {
        let ends = [
          {
            en: "so",
            sp: "so",
            time: 11,
          },
          {
            en: "many",
            sp: "many",
            time: 12.5,
          },
          {
            en: "stories",
            sp: "stories",
            time:14,
          },
        ];
        cj.time = ends[i - 57].time;
        cj.caption = {
          text_en: ends[i - 57].en,
          text_sp: ends[i - 57].sp,
          pos: {
            x: c.getNum("x"),
            y: c.getNum("y"),
          },
          width: c.getNum("width"),
        };
      } else {
        cj.time = parseFloat(11.5 + (i - firsts.length) * 0.2);
        cj.caption = {
          text_en: i % 2 == 0 ? "so" : "many",
          text_sp: i % 2 == 0 ? "so" : "many",
          pos: {
            x: c.getNum("x"),
            y: c.getNum("y"),
          },
          width: i % 2 == 0 ? 36 : 54,
          extra: "small",
        };
      }
      i++;
      j.queues.push(cj);
    }
  });

  j.queues.unshift({
    time: 0.2,
    type: "capDrift",
  });

  j.queues.unshift({
    time: 0.2,
    type: "imageDrift",
  });

  j.queues.unshift({
    type: "imageLoad",
    time: 0.1,
    url: "https://cdn.glitch.global/0b4cb25c-9c9e-4557-837e-1a280c87accf/11-14back.png?v=1718024184489",
    width: 3840,
    height: 1080,
  });

  //qSheet.queues.unshift(j);
  console.log(JSON.stringify(j, null, 2));
  //console.log(qSheet);
}
