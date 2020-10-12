var btnConvert = document.querySelector("#convert");
var raw = "";
var indented = "";
var input = document.querySelector("#txtRaw");
var output = document.querySelector("#txtConverted");
var stat = document.querySelector("#stat");
var indentStyle;
var indentDepth;
var indent;
var filterEmpty = document.querySelector("#chk_emptyTags");
var filterClass = document.querySelector("#chk_class");
var filterStyle = document.querySelector("#chk_style");
var filterOnclick = document.querySelector("#chk_onclick");
var filterOnClickReact = document.querySelector("#chk_onClickReact");
var filterDataDash = document.querySelector("#chk_dataDash");
var filterAngularNgCrapAttributes1 = document.querySelector("#chk_angularNgCrapAttributes1");
var filterAngularNgCrapAttributes2 = document.querySelector("#chk_angularNgCrapAttributes2");
var filterAngularNgCrapTags = document.querySelector("#chk_angularNgCrapTags");
var filterHTMLcomments = document.querySelector("#chk_HTMLcomments");
var filterCustomAttrs = document.querySelector("#txt_customAttrs");
var filterotherMiscAttrs = document.querySelector("#txt_otherMiscAttrs");
var otherFilters = document.querySelectorAll("#otherFilters [type=checkbox]");
var removeAll = document.querySelector("#removeAll");
var tempDOMDumpingGround = document.querySelector("#tempDOMDumpingGround");

function removeStatus() {
  stat.textContent = "";
}

function generateMarkup() {
  indentStr = "";
  indentStyle = document.querySelector("[name=rad_Indentstyle]:checked").value;
  indentDepth = document.querySelector("[name=rad_Indentdepth]:checked").value;
  for (i = 0; i < indentDepth; i++) {
    indentStr += indentStyle;
  }

  raw = document.querySelector("#txtRaw").value;

  if (filterAngularNgCrapTags.checked) {
    raw = raw.replace(/<ng-(.*?)>/g, "");
    raw = raw.replace(/<\/ng-(.*?)>/g, "");
  }
  if (filterHTMLcomments.checked) {
    raw = raw.replace(/<!--(.*?)-->/g, "");
  }

  tempDOMDumpingGround.innerHTML = raw;

  var allElsInTempDom = tempDOMDumpingGround.querySelectorAll("*");
  Array.from(allElsInTempDom).forEach((el) => {
    if (filterEmpty.checked) {
      if (!el.hasChildNodes()) {
        console.log("nodeType", el.nodeType);
        el.parentNode.removeChild(el);
      }
    }

    var attrs = el.attributes;
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
        var arrFilterCustomAttrs = filterCustomAttrs.value.split(",");
        Array.from(arrFilterCustomAttrs).forEach((arrFilterCustomAttr) => {
          arrFilterCustomAttr = arrFilterCustomAttr.trim();
          if (attr.name.indexOf(arrFilterCustomAttr + "-") === 0) {
            el.removeAttribute(attr.name);
          }
        });
      }
      if (filterotherMiscAttrs.value !== "") {
        var arrOtherMiscAttrs = filterotherMiscAttrs.value.split(",");
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
  // input.value = indent.js(indented, { tabString: indentStr });
  // indented = indented.replace(/ class=\"([^"]*)\"/g, "");
  indented = indent.js(indented, { tabString: indentStr });

  indented = indented.split("<").join("&lt;");
  indented = indented.split(">").join("&gt;");
  
  output.innerHTML = indented;
  hljs.highlightBlock(output);
  stat.textContent = "Markup updated";
  setTimeout(function () {
    removeStatus();
  }, 5000);
}
btnConvert.addEventListener("click", (ev) => {
  generateMarkup();
});
var radios = document.querySelectorAll("[name=rad_Indentstyle],[name=rad_Indentdepth]");
Array.from(radios).forEach((radio) => {
  radio.addEventListener("change", (e) => {
    generateMarkup();
  });
});
var otherFilterCheckboxes = document.querySelectorAll("#otherFilters [type=checkbox]");
Array.from(otherFilterCheckboxes).forEach((otherFilterCheckboxes) => {
  otherFilterCheckboxes.addEventListener("click", (e) => {
    generateMarkup();
  });
});

removeAll.addEventListener("click", (e) => {
  if (removeAll.getAttribute("aria-pressed") === "false") {
    setAllCheckboxes();
    removeAll.setAttribute("aria-pressed", "true");
  } else {
    unsetAllCheckboxes();
    removeAll.setAttribute("aria-pressed", "false");
  }
});
filterCustomAttrs.addEventListener("keyup", (e) => {
  generateMarkup();
});
filterotherMiscAttrs.addEventListener("keyup", (e) => {
  generateMarkup();
});

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
// btnConvert.click();
