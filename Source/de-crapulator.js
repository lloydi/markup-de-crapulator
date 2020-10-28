let raw = "";
let indented = "";
let indentStyle;
let indentDepth;
let indentStr = "";
let beforeSize = 0;
let afterSize = 0;
let reduction = 0;
let urlEncoded = location.href.split("?markup=")[1];
const input = document.querySelector("#txtRaw");
const output = document.querySelector("#txtConverted");
const clear = document.querySelector("#clear");
const filterEmpty = document.querySelector("#chk_emptyTags");
const filterClass = document.querySelector("#chk_class");
const filterStyle = document.querySelector("#chk_style");
const filterOnclick = document.querySelector("#chk_onclick");
const filterOnClickReact = document.querySelector("#chk_onClickReact");
const filterDataDash = document.querySelector("#chk_dataDash");
const filterAngularNgCrapAttributes1 = document.querySelector("#chk_angularNgCrapAttributes1");
const filterAngularNgCrapAttributes2 = document.querySelector("#chk_angularNgCrapAttributes2");
const filterAngularNgCrapTags = document.querySelector("#chk_angularNgCrapTags");
const filterHTMLcomments = document.querySelector("#chk_HTMLcomments");
const filterCustomAttrs = document.querySelector("#txt_customAttrs");
const filterotherMiscAttrs = document.querySelector("#txt_otherMiscAttrs");
const removeAll = document.querySelector("#removeAll");
const tempDOMDumpingGround = document.querySelector("#tempDOMDumpingGround");
const log = document.querySelector("#log");

function generateMarkup() {
  indentStr = "";
  indentStyle = document.querySelector("[name=rad_Indentstyle]:checked").value;
  indentDepth = document.querySelector("[name=rad_Indentdepth]:checked").value;
  for (i = 0; i < indentDepth; i++) {
    indentStr += indentStyle;
  }

  if (urlEncoded) {
    raw = decodeURI(urlEncoded);
    raw = raw.replace(/%3D/g, "=");
    raw = raw.replace(/%2F/g, "/");
    input.value = raw;
  } else {
    raw = document.querySelector("#txtRaw").value;
  }
  beforeSize = raw.length;

  if (filterAngularNgCrapTags.checked) {
    raw = raw.replace(/<ng-(.*?)>/g, "");
    raw = raw.replace(/<\/ng-(.*?)>/g, "");
  }
  if (filterHTMLcomments.checked) {
    raw = raw.replace(/<!--(.*?)-->/g, "");
  }

  tempDOMDumpingGround.innerHTML = raw;

  let emptyEls = tempDOMDumpingGround.querySelectorAll(":empty:not(area):not(base):not(br):not(col):not(embed):not(hr):not(img):not(input):not(keygen):not(link):not(meta):not(param):not(source):not(track):not(wbr)");
  if (filterEmpty.checked) {
    let emptyElCount = emptyEls.length;
    Array.from(emptyEls).forEach((el) => {
      el.parentNode.removeChild(el);
    });
    emptyEls = tempDOMDumpingGround.querySelectorAll("*:empty");
    emptyElCount = emptyEls.length;
  }
  
  let allElsInTempDom = tempDOMDumpingGround.querySelectorAll("*");
  Array.from(allElsInTempDom).forEach((el) => {
    let attrs = el.attributes;
    if (filterClass.checked) {
      el.removeAttribute("class");
    }
    if (filterStyle.checked) {
      el.removeAttribute("style");
    }
    if (filterOnclick.checked) {
      el.removeAttribute("onclick");
    }
    if (filterOnClickReact.checked) {
      el.removeAttribute("onClick");
    }
    Array.from(attrs).forEach((attr) => {
      if (filterDataDash.checked) {
        if (attr.name.indexOf("data-") === 0) {
          el.removeAttribute(attr.name);
        }
      }
      if (filterAngularNgCrapAttributes1.checked) {
        if (attr.name.indexOf("ng-") === 0) {
          el.removeAttribute(attr.name);
        }
      }
      if (filterAngularNgCrapAttributes2.checked) {
        if (attr.name.indexOf("_ng") === 0) {
          el.removeAttribute(attr.name);
        }
      }

      if (filterCustomAttrs.value !== "") {
        let arrFilterCustomAttrs = filterCustomAttrs.value.split(",");
        Array.from(arrFilterCustomAttrs).forEach((arrFilterCustomAttr) => {
          arrFilterCustomAttr = arrFilterCustomAttr.trim();
          if (attr.name.indexOf(arrFilterCustomAttr + "-") === 0) {
            el.removeAttribute(attr.name);
          }
        });
      }
      if (filterotherMiscAttrs.value !== "") {
        let arrOtherMiscAttrs = filterotherMiscAttrs.value.split(",");
        Array.from(arrOtherMiscAttrs).forEach((arrOtherMiscAttr) => {
          arrOtherMiscAttr = arrOtherMiscAttr.trim();
          if (attr.name.toLowerCase() === arrOtherMiscAttr.toLowerCase()) {
            el.removeAttribute(attr.name);
          }
        });
      }
    });
  });
  indented = tempDOMDumpingGround.innerHTML.split("><").join(">\n<");
  indented = indent.js(indented, { tabString: indentStr });
  indented = indented.split("<").join("&lt;");
  indented = indented.split(">").join("&gt;");
  output.innerHTML = indented;
  afterSize = output.textContent.length;
  log.innerHTML = "<span class='visually-hidden'>Markup updated. </span>Size before: <span>" + beforeSize + " characters</span>. Size after: <span>" + afterSize + " characters</span>. Cleaned/indented = <span>" + ((afterSize / beforeSize) * 100).toFixed(2) + "%</span> of original markup";
  hljs.highlightBlock(output);
}
clear.addEventListener("click", (ev) => {
  input.value="";
  input.focus();
  document.querySelector("#rad_Indentstyle_1").click();
  document.querySelector("#rad_Indentdepth_1").click();
  unsetAllCheckboxes();
  removeAll.setAttribute("aria-pressed", "false");
  filterCustomAttrs.value="";
  filterotherMiscAttrs.value="";
});
const radios = document.querySelectorAll("[name=rad_Indentstyle],[name=rad_Indentdepth]");
Array.from(radios).forEach((radio) => {
  radio.addEventListener("change", (e) => {
    generateMarkup();
  });
});
const otherFilterCheckboxes = document.querySelectorAll("#otherFilters [type=checkbox]");
Array.from(otherFilterCheckboxes).forEach((otherFilterCheckboxes) => {
  otherFilterCheckboxes.addEventListener("click", (e) => {
    generateMarkup();
  });
});

removeAll.addEventListener("click", (e) => {
  removeAllCrap();
});
filterCustomAttrs.addEventListener("keyup", (e) => {
  generateMarkup();
});
filterotherMiscAttrs.addEventListener("keyup", (e) => {
  generateMarkup();
});

function removeAllCrap() {
  if (removeAll.getAttribute("aria-pressed") === "false") {
    setAllCheckboxes();
    removeAll.setAttribute("aria-pressed", "true");
  } else {
    unsetAllCheckboxes();
    removeAll.setAttribute("aria-pressed", "false");
  }
}

function setAllCheckboxes() {
  Array.from(otherFilterCheckboxes).forEach((otherFilterCheckbox) => {
    // otherFilterCheckbox.setAttribute('checked','checked');
    otherFilterCheckbox.checked = true;
  });
  generateMarkup();
}
function unsetAllCheckboxes() {
  Array.from(otherFilterCheckboxes).forEach((otherFilterCheckbox) => {
    // otherFilterCheckbox.removeAttribute('checked');
    otherFilterCheckbox.checked = false;
  });
  generateMarkup();
}

if (urlEncoded) {
  unsetAllCheckboxes();
  generateMarkup();
  filterEmpty.click();
  filterAngularNgCrapAttributes1.click();
  filterAngularNgCrapAttributes2.click();
  filterAngularNgCrapTags.click();
  filterHTMLcomments.click();
}

// removeAllCrap();
// generateMarkup();