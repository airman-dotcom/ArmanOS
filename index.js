const terminalKit = require("terminal-kit");
const term = terminalKit.terminal;
const { ScreenBuffer, ScreenBufferHD, TextBuffer } = terminalKit;
term.fullscreen();
term.grabInput({ mouse: "motion" });
let mousePos = { x: 1, y: 1 };

let background = new ScreenBufferHD({
  width: term.width,
  height: term.height,
  dst: term,
});
background.fill({
  attr: {
    // Both foreground and background must have the same color
    color: {
      r: 0,
      g: 0,
      b: 0,
    },
    bgColor: {
      r: 0,
      g: 0,
      b: 0,
    },
  },
});

ScreenBufferHD.loadImage(
  /*"assets/bg.png"*/ "win7-wall.jpg",
  { terminal: term, shrink: { width: term.width, height: term.height * 2 } },
  function(error, image) {
    if (error) {
      throw error;
    } // Doh!

    image.draw({ dst: background, blending: true });
    background.draw();
  }
);
let uname = new TextBuffer({
  dst: background,
  width: 30,
  height: 1,
  x: 5,
  y: 5,
});
let psw = new TextBuffer({ dst: background, width: 30, height: 1, x: 5, y: 8 });
let submitBtn = new TextBuffer({
  width: 6,
  height: 1,
  dst: background,
  x: 5,
  y: 11,
});
let states = { uname: false, psw: false };
let location = "login";
let buffers = [uname, psw, submitBtn];
let texts = { uname: "Username: ", psw: "Password: ", submitBtn: "Submit" };
let positions = [];
for (let x = 0; x < buffers.length; x++) {
  let buff = buffers[x];
  positions.push({
    x: [buff.x, buff.x + buff.width],
    y: [buff.y, buff.y + buff.height],
  });
}
function write(smth) {
  background.put(
    {
      x: 1,
      y: 1,
      width: 2,
      height: 2,
      dx: 2,
      attr: { bgColor: { r: 0, g: 0, b: 0 } },
    },
    " "
  );
  background.put(
    {
      x: 1,
      y: 1,
      markup: false,
      wrap: false,
      dx: 1,
      newLine: false,
      direction: "right",
    },
    smth
  );
}
setTimeout(function() {
  write("Enter your username and password");

  uname.setText("Username:");
  psw.setText("Password: ");
  submitBtn.setAttrRegion({
    color: { r: 255, g: 255, b: 255 },
    bgColor: { r: 255, g: 0, b: 0 },
  });
  submitBtn.setText("Submit");
  uname.draw();
  submitBtn.draw();
  psw.draw();
  background.draw();
}, 3000);
term.on("mouse", function(name, data) {
  if (location != "login") return;
  mousePos.x = data.x;
  mousePos.y = data.y;
  if (data.code == 0) {
    let buffUse = null;
    let buffName = null;
    for (let z = 0; z < positions.length; z++) {
      let buff = positions[z];
      if (
        data.x >= buff.x[0] &&
        data.x <= buff.x[1] &&
        data.y >= buff.y[0] &&
        data.y <= buff.y[1]
      ) {
        if (Object.values(states).includes(true)) {
          let a = Object.values(states).indexOf(true);
          let b = Object.keys(states)[a];
          states[b] = false;
        }
        buffUse = buffers[z];
        buffName = Object.keys(texts)[z];
      }
    }
    if (!buffUse || !buffName) {
      if (Object.values(states).includes(true)) {
        let a = Object.values(states).indexOf(true);
        let b = Object.keys(states)[a];
        states[b] = false;
      }
      for (let z = 0; z < buffers.length; z++) {
        buffers[z].setAttrRegion({ color: { r: 128, g: 128, b: 128 } });
      }

      refresh();
      return;
    }
    if (buffName == "submitBtn" && Authenticate(texts.uname, texts.psw)) {
      Desktop();
      return;
    }
    buffUse.setText("Type Now...");
    buffUse.setAttrRegion({ color: { r: 255, g: 255, b: 255 } });
    buffUse.moveTo(1, 11);
    buffUse.draw();
    background.draw();

    states[buffName] = true;
    texts[buffName] = "Type Now...";
  }
});

function refresh() {
  let buffUse = buffers[Object.values(states).indexOf(true)];
  let buffName = Object.keys(texts)[Object.values(states).indexOf(true)];
  if (buffUse) {
    buffUse.setText(texts[buffName]);
    buffUse.setAttrRegion({ color: { r: 255, g: 255, b: 255 } });
  }
  buffers.forEach((e) => {
    e.draw();
  });
  background.draw();
}

term.on("key", function(name, data) {
  if (location != "login") return;
  if (Object.values(states).includes(true)) {
    let buffName = Object.keys(texts)[Object.values(states).indexOf(true)];
    let a = texts[buffName];

    if (data[0] == "BACKSPACE") {
      a = a.slice(0, -1);
      texts[buffName] = a;
      refresh();
    } else {
      a += data[0];
      texts[buffName] = a;
      refresh();
    }
  }
});

function Authenticate(uname, psw) {
  return true;
}







function Desktop() {
  term.clear();
  location = "desktop";
  ScreenBufferHD.loadImage(
    "plain.jpg",
    { terminal: term, shrink: { width: term.width, height: term.height * 2 } },
    function(error, image) {
      if (error) {
        throw error;
      } // Doh!

      image.draw({ dst: background, blending: true });
      background.draw();
    }
  );
  let bufferNames = ["ArmanChrome", "ArmanExplorer", "ArMSG", "TermArman", "Settings", "PowerDown"];
  let locations = [];
  //{x: [min, max], y: [min, max]}
  let textBuffers = [];
  let d = false;

  function locate(x, y) {
    if (!d) console.log(x, y)
    for (let z = 0; z < locations.length; z++) {
      if (z == 0) {
        if (!d) console.log(locations[0].x[0], locations[0].x[1])
        d = true;
      }
      if (x >= locations[z].x[0] && x <= locations[z].x[1]) {
        if (y >= locations[z].y[0] && y <= locations[z].y[1]) {
          return bufferNames[z];
        }
      }
      return null
    }
  }



  for (let z = 0; z < bufferNames.length; z++) {
    eval(`let ${bufferNames[z]} = new ScreenBufferHD({
    width: 6,
    height: 3,
    x: 1,
    y: ${1 + z * 5},
    dst: background,
    });
    ScreenBufferHD.loadImage(
      "assets/icons/${bufferNames[z]}.png",
      { terminal: background, shrink: { width: 6, height: 12 } },
      function (error, image) {
        if (error) {
          throw error;
        }
        image.draw({ dst: ${bufferNames[z]}, blending: true });
        ${bufferNames[z]}.draw();
      }
    );
    
    locations.push({x: [1, 7], y: [${1 + z * 5}, ${1 + z * 5 + 3}]});
    `)
    eval(`let ${bufferNames[z] + "Text"} = new TextBuffer({
    x:1,
    y: ${4 + z * 5},
    height:1,
    width: ${bufferNames[z].length + 4},
    dst: background
    });
    
    ${bufferNames[z] + "Text"}.setText("${bufferNames[z]}");

    ${bufferNames[z] + "Text"}.setAttrRegion({ color: { r: 255, g: 255, b: 255 } });


    textBuffers.push(${bufferNames[z] + "Text"});
    `)
  }
  setTimeout(function() {
    textBuffers.forEach(e => {
      e.draw();
    })
    background.draw();
  }, 2000);

  term.on("mouse", function(name, data) {
    if (data.code == "0") {
      let buffUse = locate(data.x, data.y);
      if (!buffUse) return;
      if (buffUse == "PowerDown") {
        term.clear();
        ScreenBufferHD.loadImage(
          "shuttingDown.jpg",
          { terminal: background, shrink: { width: 6, height: 12 } },
          function(error, image) {
            if (error) {
              throw error;
            }
            image.draw({ dst: background, blending: true });
            //"Thank you for using ArmanOS"-AboutabotCorleone
            let thx = new TextBuffer({ x: 1, y: 18, height: 1, width: 47, dst: background });
            thx.setText('"Thank you for using ArmanOS"-AboutabotCorleone');
            thx.setAttrRegion({ color: { r: 0, g: 0, b: 0 }, bgColor: { r: 255, g: 255, b: 0 } })
            thx.draw();
            background.draw();
          })
        setTimeout(function() {
          term.processExit
        })
      }
    }
  })
}
