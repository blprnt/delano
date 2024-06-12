let v;
let qSheet;
let qPage;

let wrapper;
let currentPageElement;
let currentVideo;
let currentPage = -1;
let currentQ = 0;
let startTime;

let scroller;

let timing = false;

let lang = "en";

let piled1 = false;
let piled2 = false;
let piled3 = false;

let xml;

let bump = 0;

let illiFactor = 1440.0 / 981.0;

function preload() {
  qSheet = loadJSON("qSheet.json");
  xml = loadXML("bigSpread.xml");
}

function setup() {
  //parseSpread(xml);
  wrapper = select(".comic");
  let i = 10;

  qSheet.queues = qSheet.queues.slice(bump);

  qSheet.queues.forEach((q) => {
    //let d = createDiv();
    let d = document.querySelector("#frame" + q.pageNum);
    console.log("#frame" + q.pageNum)
    console.log(d);
    //d.class("frame scrollStep");
    d.q = q;
    //select(".content").child(d);
  });

  init();
}

function draw() {
  if (timing) {
    doTimer();
  }
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
  currentQ = 0;
}

function doTimer() {
  let now = new Date();

  let frames = document.querySelectorAll(".frame");


  let elapsed = (now.getTime() - startTime.getTime()) / 1000;
  if (currentQ < qPage.queues.length) {
    if (elapsed > parseFloat(qPage.queues[currentQ].time)) {
      processQ(qPage.queues[currentQ]);
      currentQ++;
    }
  }
}

function loadVideoTrans(_url1, _url2, _offset) {
  /*
  
  <video width="600" height="100%" autoplay loop muted playsinline>
  <source 
    src="https://rotato.netlify.app/alpha-demo/movie-hevc.mov" 
    type='video/mp4; codecs="hvc1"'>
  <source 
    src="https://rotato.netlify.app/alpha-demo/movie-webm.webm" 
    type="video/webm">
  </video>

  */
  
  console.log("load vid trans");
  let vh = createDiv(`<video id="walkers" width="600" muted playsinline>
  <source 
    src="` + _url1 + `" 
    type="video/mp4; codecs="hvc1"">
  <source 
    src="` + _url2 + `" 
    type="video/webm">
  </video>`);
  vh.class("videoWrapperTrans");
  let sf = (windowHeight / qPage.backDims.height) * illiFactor;
  vh.style("left", round(1920 * 0.5 * sf) + "px");
  
  vh.parent(currentPageElement);
  
  currentVideo = document.querySelector("#walkers");
  
  
}

function loadVideo(_url) {
  console.log("load vid ");
  let vh = createDiv();
  vh.class("videoWrapper");
  vh.parent(currentPageElement);
  let v = createVideo(_url, function _vh(_v) {
    console.log(v);
    v.elt.muted = true;
    v.play();
  });

  v.parent(vh);
  //v.autoplay();
}

function loadImageQ(_q) {
  console.log("load image");
  
  let vh = createDiv("<div class='imageDiv'><img src=" + _q.url + "></div>");
  vh.class("imageWrapper");
  vh.parent(currentPageElement);
  //vh.style("background-image", "url(" + _q.url + ")");
  if (_q.width) {
    vh.style("width", _q.width + "px");
    vh.style("height", _q.height + "px");
  }
   if (_q.pos) {
    let sf = (windowHeight / qPage.backDims.height) * illiFactor;
    vh.position(_q.pos.x * sf, _q.pos.y * sf);
   }
   if (_q.animate) {
    vh.style("opacity", 0);
    if (_q.animate.indexOf("fade") != -1) {
      gsap.to(vh.elt, {opacity:1});
    }
   }
  
}

function imageDrift(_q) {
  let bi = currentPageElement.elt.querySelector(".imageWrapper");
  console.log("Image drift");
  console.log(bi);
  gsap.to(bi, { left: "-=10%", ease: "none", duration: 60, delay: 0 });
}

function capDrift(_q) {
  let bi = currentPageElement.elt.querySelector(".capwrap");
  let vi = currentPageElement.elt.querySelector(".videoWrapperTrans");
  console.log("Caption drift");
  console.log(bi);
  gsap.to(vi, { opacity:1, delay: 31.4, duration:2 });
  gsap.to(vi, { left: "-=15%", ease: "none", duration: 30, delay: 10 });
  gsap.to(bi, { left: "-=15%", ease: "none", duration: 30, delay: 10 });
}

function processQ(_q) {
  let t = _q.type;
  switch (t) {
    case "caption":
      addCaption(_q.caption);
      break;
    case "videoLoad":
      loadVideo(_q.url);
      break;
    case "videoLoadTrans":
      loadVideoTrans(_q.url, _q.url2, _q.offset);
      break;
    case "videoPlay":
      currentVideo.play();
      break;
    case "imageLoad":
      loadImageQ(_q);
      break;
    case "imageDrift":
      imageDrift(_q);
      break;
    case "capDrift":
      capDrift(_q);
      break;
  }
}

function setLanguage(_code) {
  let captions = selectAll(".caption");
  captions.forEach((c) => {
    console.log(c);
    c.html(c.elt.params["text_" + _code]);
  });
  lang = _code;
}

function nextPage() {
  currentPage++;
  currentPageElement = createDiv();
  currentPageElement.parent(wrapper);
  currentPageElement.class("page");
  qPage = qSheet[currentPage];
  resetTimer();

  if (currentPage > 0)
    gsap.to(wrapper.elt, { top: -(currentPageElement.elt.offsetTop + 10) });
}

function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

function toPage(_q, _isStart) {
  if (_isStart) {
    //wrapper.position(0, 0, "relative");

    let cw = select(".comicwrapper");
    let yt = offset(select(".frame").elt).top;
    console.log("GO TO:" + yt);
    gsap.to(cw.elt, { top: yt, duration: 0 });
    gsap.to(select(".shade").elt, { opacity: 1 });
    gsap.to(cw.elt, {
      opacity: 1,
      onComplete: function () {
        gsap.to(cw.elt, { top: window.scrollY, duration: 1 });
      },
    });
  }

  currentPageElement = createDiv();
  currentPageElement.parent(wrapper);
  currentPageElement.class("page");

  //caption wrapper
  let capWrap = createDiv();
  capWrap.class("capwrap");
  capWrap.parent(currentPageElement);
  currentPageElement.capWrap = capWrap;

  gsap.to(currentPageElement.elt, { opacity: 1 });

  qPage = _q;

  resetTimer();
}

function clearComic() {
  wrapper.html("");
}

function addCaption(_params) {
  let e = createDiv(_params["text_" + lang]);
  e.parent(currentPageElement.capWrap);
  e.class("caption" + (_params.extra ? (" " + _params.extra) : "" ));
  e.elt.params = _params;

  //calculate scalefactor
  
  let sf = (windowHeight / qPage.backDims.height) * illiFactor;

  e.position(_params.pos.x * sf, _params.pos.y * sf);
  e.style("width", _params.width + "px");

  let trans = "scale(" + sf + ")";
  if (_params.transform) {
    trans = trans + " " + _params.transform;
  }
  e.style("transform", trans);

  gsap.to(e.elt, { opacity: 1 });
}

// scrollama event handlers
function handleStepEnter(response) {
  //console.log(response);
  console.log("ENTER" + response.index);
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
      let times = [0, 0.5, 1, 3];
      document.querySelectorAll(".pile2").forEach((c) => {
        gsap.to(c, { opacity: 1, delay: times[i] });
        i++;
      });
    }
  }

  if (response.index == 7) {
        gsap.to(document.querySelector("#triggerCaption"), { opacity: 1, delay: 0 });
  }

  //Hide comic on up scroll
  if (response.index == 8) {
    if (timing) {
      timing = false;
      gsap.to(document.querySelector(".shade"), {
        opacity: 0,
        duration: 1,
      });

      let i = 0;
      document.querySelectorAll(".pile2").forEach((c) => {
        gsap.to(c, { opacity: 1, delay: 0.5 + i * 0.1, top: "+=50px" });
        i++;
      });
      gsap.to(document.querySelector("#triggerCaption"), { opacity: 1, delay: 0 });
    }
  }

  if (response.index == 22) {
    if (timing) {
      timing = false;
      gsap.to(document.querySelector(".shade"), {
        opacity: 0,
        duration: 1,
      });
    }
  }

  if (response.index == 23) {
    gsap.to(document.querySelector("#endCaption"), {
      opacity: 1,
      rotation: "2deg",
      duration: 1,
    });
  }

  if (response.element.classList.contains("frame")) {
    let isStart = (!timing);

    timing = true;
    response.element.timing = true;
    //console.log(response.element.q);
    if (!response.element.played) {
      toPage(response.element.q, isStart);
      response.element.played = true;
    }
    
  }
}

function handleStepExit(response) {
  // response = { element, direction, index }
  console.log("EXIT" + response.index);
  if (response.index == 8) {
    console.log(timing);
    if (!timing) {
      //Start timing and show media holder
      gsap.to(document.querySelector(".comicwrapper"), {
        opacity: 1,
        duration: 5,
      });
      //Hide captions
      let times = [0, 0.5, 1, 2, 3];
      let i = 0;
      document.querySelectorAll(".pile2").forEach((c) => {
        gsap.to(c, { opacity: 0, delay: times[i], top: "-=50px" });
        i++;
      });
      gsap.to(document.querySelector("#triggerCaption"), { opacity: 0, delay: 1 });
      //toPage(qSheet.queues[0]);
    }
  }

  if (response.element.classList.contains("frame")) {
    response.element.timing = false;
  }
}

//Scrolling stuff
function init() {
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
  j.pageNumber = 6;
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
          text_en: firsts[i].en,
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
            time: 36,
          },
          {
            en: "many",
            sp: "many",
            time: 37.5,
          },
          {
            en: "stories",
            sp: "stories",
            time:39,
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
        cj.time = parseFloat(11.5 + (i - firsts.length) * 0.5);
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
  console.log(JSON.stringify(j, 3));
  //console.log(qSheet);
}
