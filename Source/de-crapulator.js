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
const formatBrailleFriendlyOutput = document.querySelector("#chk_brailleFriendlyOutput");
const filterAllHTMLcomments = document.querySelector("#chk_allHTMLcomments");
const filterEmptyComments = document.querySelector("#chk_emptyHTMLComments");
const filterCustomAttrs = document.querySelector("#txt_customAttrs");
const filterotherMiscAttrs = document.querySelector("#txt_otherMiscAttrs");
const filterAnyHTMLtag = document.querySelector("#txt_anyHTMLtag");
const removeAll = document.querySelector("#removeAll");
const tempDOMDumpingGround = document.querySelector("#tempDOMDumpingGround");
const log = document.querySelector("#log");
let addTableMarkupChoiceSet=false;
let addTableMarkup=false;

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



  let isTableCell=false;
  let isTableHeader=false;
  let isTableBody=false;
  let isTableRow=false;
  if ((raw.indexOf("<th")===0)||(raw.indexOf("<td")===0)) {
    isTableCell=true;
    isTableHeader=false;
    isTableBody=false;
    isTableRow=false;
  }
  if (raw.indexOf("<tr")===0) {
    isTableCell=false;
    isTableHeader=false;
    isTableBody=false;
    isTableRow=true;
  }
  if (raw.indexOf("<thead")===0) {
    isTableCell=false;
    isTableHeader=true;
    isTableBody=false;
    isTableRow=false;
  }
  if (raw.indexOf("<tbody")===0) {
    isTableCell=false;
    isTableHeader=false;
    isTableBody=true;
    isTableRow=false;
  }
  if (isTableCell||isTableHeader||isTableBody||isTableRow) {
    if (!addTableMarkupChoiceSet) {
      addTableMarkupChoiceSet=true;
      if(confirm("Looks like you've hit upon one of this tool's limitations - if the outermost node is a <thead>, <tbody>, <tr>, <th> or <td>, it gets removed during processing for reasons too boring to go into.\n\nIf you press 'OK', the tool will add in a simple table around your markup – you'll need to strip it out after manually.")) {
        addTableMarkup=true;
      }
    }
    if (addTableMarkup) {
      if (isTableCell) {
        raw="<table><tr>"+raw+"</tr></table>";  
      }
      if (isTableHeader||isTableBody||isTableRow) {
        raw="<table>"+raw+"</table>";  
      }
    }
  }



  raw = raw.replace(/\?/g, "QUESTION_MARK");

  beforeSize = raw.length;

  if (filterAngularNgCrapTags.checked) {
    raw = raw.replace(/<ng-(.*?)>/g, "");
    raw = raw.replace(/<\/ng-(.*?)>/g, "");
  }
  if (filterAllHTMLcomments.checked) {
    raw = raw.replace(/<!--(.*?)-->/g, "");
  }
  if (filterEmptyComments.checked) {
    raw = raw.replace(/<!--(-*?)-->/g, "");
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
  if (filterAnyHTMLtag.value !== "") {
    let arrAnyHTMLtags = filterAnyHTMLtag.value.split(",");
    Array.from(arrAnyHTMLtags).forEach((arrAnyHTMLtag) => {
      arrAnyHTMLtag = arrAnyHTMLtag.trim();
      let elsToStrip = tempDOMDumpingGround.querySelectorAll(arrAnyHTMLtag);
      Array.from(elsToStrip).forEach((elToStrip) => {
        elToStrip.parentNode.removeChild(elToStrip);
      });
    });
  }
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
    // if(filterAngularNgCrapClasses.checked) {
    //   let CSSclasses = el.classList;
    //   if (CSSclasses && CSSclasses.length > 0) {
    //     Array.from(CSSclasses).forEach((CSSclass) => {
    //       if (CSSclass.indexOf("ng-") === 0) {
    //         el.classList.remove(CSSclass);
    //       }
    //     });
    //   }
    // }
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
          if (arrFilterCustomAttr!==""){
            console.log("arrFilterCustomAttr=*"+arrFilterCustomAttr+"*")
            if (attr.name.indexOf(arrFilterCustomAttr) === 0) {
              el.removeAttribute(attr.name);
            }

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

  indented = tempDOMDumpingGround.innerHTML.split("><").join(">\n<").replaceAll(/\<(?<tag>\w+)([^>]*)\>\n\<\/\k<tag>\>/g, "<$1$2></$1>");
  if (formatBrailleFriendlyOutput.checked) {
    var arrayOfLines = indented.split('\n');
    for (i=0; i<arrayOfLines.length;i++) {
      console.log(arrayOfLines[i].length);
      if (arrayOfLines[i].length>80) {
        console.log("⚠️ Over " + 80 + " chars");
        arrayOfLines[i] = arrayOfLines[i].replace(/(.{1,80})/g, '$1\n')
      }
      console.log("Line " + (i+1) + ": " + arrayOfLines[i]);
    }
    indented = arrayOfLines.join("\n");
    indented = indented.replace(/\n\n/g, '\n');
  } else {
    indented = indent.js(indented, { tabString: indentStr });
  }
  indented = indented.split("<").join("&lt;");
  indented = indented.split(">").join("&gt;");
  indented = indented.split("QUESTION_MARK").join("?");
  output.innerHTML = indented;
  afterSize = output.textContent.length;
  let percentage = ((afterSize / beforeSize) * 100).toFixed(2);
  log.innerHTML = "<span class='visually-hidden'>Markup updated. </span>Size before: <span>" + beforeSize + " characters</span>. Size after: <span>" + afterSize + " characters</span>. Cleaned/indented = <span>" + percentage + "%</span> of original markup<div aria-hidden=\"true\" id=\"turd\"></div>";
  hljs.highlightBlock(output);
  const turd = document.querySelector("#turd");
  turd.style.width=percentage+"%";
}

formatBrailleFriendlyOutput.addEventListener("click", (e) => {
  generateMarkup();
})

clear.addEventListener("click", (ev) => {
  input.value="";
  input.focus();
  document.querySelector("#rad_Indentstyle_1").click();
  document.querySelector("#rad_Indentdepth_1").click();
  unsetAllCheckboxes();
  removeAll.setAttribute("aria-pressed", "false");
  filterCustomAttrs.value="";
  filterotherMiscAttrs.value="";

  for (var key in localStorage) {
    if (key.includes("dataStorage-")) {
    localStorage.removeItem(key);
    }
  }

});
input.addEventListener("blur", (ev) => {
  generateMarkup();
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
filterAnyHTMLtag.addEventListener("keyup", (e) => {
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
  filterAllHTMLcomments.click();
  filterEmptyComments.click();
}

//==================================================================
// Save pasted markup sample and any custom attributes entered
//==================================================================

let userEnteredData_id,userEnteredData_text;
let userEnteredData_id_count=0;
const userEnteredTextFields = document.querySelectorAll("[data-user-entered]");

function saveDescriptionDetails(timeout, field, time) {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        userEnteredData_id = field.getAttribute("id");
        userEnteredData_text = field.value;
        localStorage.setItem("dataStorage-" + userEnteredData_id, userEnteredData_text);
    }, time);
    return timeout;
}
function loadSavedData() {
    for (var key in localStorage) {
        if (key.includes("dataStorage-")) {
          const id = key.replace("dataStorage-", "");
            if (document.querySelector("#" + id)) {
            document.querySelector("#" + id).value = localStorage.getItem(key);
          }
        }
    }
}

Array.from(userEnteredTextFields).forEach((field) => {
  userEnteredData_id_count++;
  field.setAttribute("data-user-entered","true");
  let timeout = null;
  field.addEventListener("blur", (e) => {
    timeout = saveDescriptionDetails(timeout, field, 1);
  })
  field.addEventListener("keyup", (e) => {
   timeout = saveDescriptionDetails(timeout, field, 3000);
  })
 });

 document.addEventListener("DOMContentLoaded", function(){
  loadSavedData();
 });
