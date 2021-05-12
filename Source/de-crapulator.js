const input = document.querySelector("#txtRaw");
const outputRichText = document.querySelector("#txtConvertedRichText");
const outputPlainText = document.querySelector("#txtConvertedPlainText");
const convertedRichTextWrapper = document.querySelector("#convertedRichTextWrapper");
const convertedPlainTextWrapper = document.querySelector("#convertedPlainTextWrapper");
const filterEmpty = document.querySelector("#chk_emptyTags");
const filterClass = document.querySelector("#chk_class");
const filterStyle = document.querySelector("#chk_style");
const filterOnclick = document.querySelector("#chk_onclick");
const filterOnClickReact = document.querySelector("#chk_onClickReact");
const filterDataDash = document.querySelector("#chk_dataDash");
const filterAngularNgCrapAttributes1 = document.querySelector("#chk_angularNgCrapAttributes1");
const filterAngularNgCrapAttributes2 = document.querySelector("#chk_angularNgCrapAttributes2");
const fartBigReductions = document.querySelector("#fartBigReductions");
const filterAngularNgCrapTags = document.querySelector("#chk_angularNgCrapTags");
const formatBrailleFriendlyOutput = document.querySelector("#chk_brailleFriendlyOutput");
const filterAllHTMLcomments = document.querySelector("#chk_allHTMLcomments");
const filterEmptyComments = document.querySelector("#chk_emptyHTMLComments");
const filterCustomAttrs = document.querySelector("#txt_customAttrs");
const filterotherMiscAttrs = document.querySelector("#txt_otherMiscAttrs");
const filterAnyHTMLtag = document.querySelector("#txt_anyHTMLtag");
const removeAll = document.querySelector("#removeAll");
const tempDOMDumpingGround = document.querySelector("#tempDOMDumpingGround");
const testDivForPointlessElements = document.querySelector("#testDivForPointlessElements");
const log = document.querySelector("#log");
const indentRadios = document.querySelectorAll("[name=rad_Indentstyle],[name=rad_Indentdepth]");
const allPrefInputs = document.querySelectorAll("#allPreferences input");
const otherFilterCheckboxes = document.querySelectorAll("#otherFilters [type=checkbox]");
const outputMarkupContainerTypeRads = document.querySelectorAll("[name='outputMarkupContainerType']");
const whenShouldTheMarkupUpdateRads = document.querySelectorAll("[name='whenShouldTheMarkupUpdate']");
const btnDecrapulate = document.querySelector("#btnDecrapulate");
const btnCopyToClipboard = document.querySelector("#btnCopyToClipboard");
const btnDoAnotherPass = document.querySelector("#btnDoAnotherPass");
const btnRemovePointlessNestedElements = document.querySelector("#btnRemovePointlessNestedElements");
const btnMorePreferences = document.querySelector("#btnMorePreferences");
const btnResetEverything = document.querySelector("#btnResetEverything");
const chkAbbreviateSrcs = document.querySelector("#chkAbbreviateSrcs");
const chkAbbreviateSrcSets = document.querySelector("#chkAbbreviateSrcSets");
const chkAbbreviateHrefs = document.querySelector("#chkAbbreviateHrefs");
const chkAbbreviateTitles = document.querySelector("#chkAbbreviateTitles");
let raw = "";
let indented = "";
let indentStyle;
let indentDepth;
let indentStr = "";
let urlEncoded = location.href.split("?markup=")[1];
let beforeSize;
let afterSize;
let addTableMarkupChoiceSet;
let isTableCell ;
let isTableHeader;
let isTableBody;
let isTableRow;
let updateMarkupWithEachChange;
let isFirstPass;

function initVals() {
  beforeSize = 0;
  afterSize = 0;
  addTableMarkupChoiceSet=false;
  isTableCell = false;
  isTableHeader = false;
  isTableBody = false;
  isTableRow = false;
  updateMarkupWithEachChange=true;
  isFirstPass=true;
}
initVals();
function addAllEventListeners() {
  btnResetEverything.addEventListener("click", (e) => {
    if (confirm("This will also remove any stored/saved values in the attributes to strip as well as preferences. Only press OK if you're, um, OK with that…")){
      initVals();
      input.value = "";
      input.focus();
      document.querySelector("#rad_Indentstyle_1").click();
      document.querySelector("#rad_Indentdepth_1").click();
      unsetAllCheckboxes();
      removeAll.setAttribute("aria-pressed", "false");
      filterCustomAttrs.value = "";
      filterotherMiscAttrs.value = "";
      for (var key in localStorage) {
        if (key.includes("dataStorage-")) {
          localStorage.removeItem(key);
        }
      }
    }

  });
  Array.from(indentRadios).forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (updateMarkupWithEachChange) {
        generateMarkup();
      }
    });
  });
  Array.from(allPrefInputs).forEach((input) => {
    input.addEventListener("change", (e) => {
      saveOtherPrefs();
    });
  });
  Array.from(otherFilterCheckboxes).forEach((otherFilterCheckboxes) => {
    otherFilterCheckboxes.addEventListener("click", (e) => {
      if (updateMarkupWithEachChange) {
        generateMarkup();
      }
    });
  });
  chkAbbreviateSrcs.addEventListener("click", (e) => {
    if (updateMarkupWithEachChange) {
      generateMarkup();
    }
  });
  chkAbbreviateSrcSets.addEventListener("click", (e) => {
    if (updateMarkupWithEachChange) {
      generateMarkup();
    }
  });
  chkAbbreviateHrefs.addEventListener("click", (e) => {
    if (updateMarkupWithEachChange) {
      generateMarkup();
    }
  });
  chkAbbreviateTitles.addEventListener("click", (e) => {
    if (updateMarkupWithEachChange) {
      generateMarkup();
    }
  });
  removeAll.addEventListener("click", (e) => {
    removeAllCrap();
  });
  filterCustomAttrs.addEventListener("keyup", (e) => {
    if (updateMarkupWithEachChange) {
      if (e.keyCode!==9) {
        generateMarkup();
      }
    }
  });
  filterotherMiscAttrs.addEventListener("keyup", (e) => {
    if (updateMarkupWithEachChange) {
      if (e.keyCode!==9) {
        generateMarkup();
      }
    }
  });
  filterAnyHTMLtag.addEventListener("keyup", (e) => {
    if (updateMarkupWithEachChange) {
      if (e.keyCode!==9) {
        generateMarkup();
      }
    }
  });
  formatBrailleFriendlyOutput.addEventListener("click", (e) => {
    if (updateMarkupWithEachChange) {
      generateMarkup();
    }
  })
  btnDecrapulate.addEventListener("click", (e) => {
    generateMarkup();
  });
  btnCopyToClipboard.addEventListener("click", (e) => {
    let wasInPlaintextMode = false;
    if (convertedRichTextWrapper.getAttribute("hidden")) {
      showPlainTextOutput();
      wasInPlaintextMode=true;
    }
    outputRichText.focus();
    document.execCommand('copy');
    if (wasInPlaintextMode) {
      showPlainTextOutput();
    }
    btnCopyToClipboard.focus();
  });
  btnDoAnotherPass.addEventListener("click", (e) => {
    isFirstPass=false;
    input.value = outputPlainText.textContent;
    input.value = input.value.split("> </").join("></");
    input.value = input.value.split("<div></div>").join("");
    input.value = input.value.split("<span></span>").join("");
    removeIndentsInInputText();
    btnDecrapulate.click();
  });
  btnRemovePointlessNestedElements.addEventListener("click", (e) => {
    if (confirm("This will remove *all* DIV or SPAN elements that have no attributes applied, flattening down the structure (and may no longer represent the reality of the markup you started with, nor any CSS that may have been wrtten based on that structure).\n\nIf that's what you want, hit the old 'OK' button…")) {
      stripPointlessSpanOrDivElements(testDivForPointlessElements,['span','div']);
    }
  });
    btnMorePreferences.addEventListener("click", (e) => {
    if (btnMorePreferences.getAttribute("aria-expanded")==="false") {
        btnMorePreferences.setAttribute("aria-expanded","true");
    } else {
        btnMorePreferences.setAttribute("aria-expanded","false");
    }
  });
  Array.from(outputMarkupContainerTypeRads).forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (radio.value === "plaintext") {
        showPlainTextOutput();
      } else {
        showRichTextOutput();
      }
    });
  });
  Array.from(whenShouldTheMarkupUpdateRads).forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (radio.value === "allChanges") {
        updateMarkupWithEachChange = true;
      } else {
        updateMarkupWithEachChange = false;
      }
    });
  });
  triggerClicksForUrlEncodedData();
}
function removeIndentsInInputText() {
  let arrInput = input.value.split("\n");
  let trimmed = "";
  for (let i = 0; i < arrInput.length; i++) {
    trimmed += arrInput[i].trim();
  }
  input.value = trimmed;
}
function showRichTextOutput() {
  convertedRichTextWrapper.removeAttribute("hidden");
  convertedPlainTextWrapper.setAttribute("hidden", "hidden");
}
function showPlainTextOutput() {
  convertedRichTextWrapper.setAttribute("hidden", "hidden");
  convertedPlainTextWrapper.removeAttribute("hidden");
}
function triggerClicksForUrlEncodedData() {
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
}
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
    otherFilterCheckbox.checked = true;
  });
  if (updateMarkupWithEachChange) {
    generateMarkup();
  }
}
function unsetAllCheckboxes() {
  Array.from(otherFilterCheckboxes).forEach((otherFilterCheckbox) => {
    otherFilterCheckbox.checked = false;
  });
  if (updateMarkupWithEachChange) {
    generateMarkup();
  }
}
function applyIndenting() {
  indentStr = "";
  indentStyle = document.querySelector("[name=rad_Indentstyle]:checked").value;
  indentDepth = document.querySelector("[name=rad_Indentdepth]:checked").value;
  if (indentStyle === "space") {
    indentStyle = " "; //space character
  } else {
    indentStyle = " "; //tab character
  }
  for (let i = 0; i < indentDepth; i++) {
    indentStr += indentStyle;
  }
}
function loadAndSaveData(){
  let userEnteredData_id,userEnteredData_text;
  const userEnteredTextFields = document.querySelectorAll("[data-user-entered]");
  
  function savePreferredAttributesAndTagsToStrip(timeout, field, time) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
          userEnteredData_id = field.getAttribute("id");
          userEnteredData_text = field.value;
          localStorage.setItem("dataStorage-" + userEnteredData_id, userEnteredData_text);
        }, time);
        return timeout;
      }
      function loadPreferredAttributesAndTagsToStrip() {
        for (var key in localStorage) {
          if (key.includes("dataStorage-")) {
            const id = key.replace("dataStorage-", "");
            if (document.querySelector("#" + id)) {
              if (localStorage.getItem(key)) {
                document.querySelector("#" + id).value = localStorage.getItem(key);
              }
            }
          }
        }
      }

  Array.from(userEnteredTextFields).forEach((field) => {
    field.setAttribute("data-user-entered","true");
    let timeout = null;
    field.addEventListener("blur", (e) => {
      timeout = savePreferredAttributesAndTagsToStrip(timeout, field, 1);
    })
    field.addEventListener("keyup", (e) => {
     timeout = savePreferredAttributesAndTagsToStrip(timeout, field, 3000);
    })
  });
  
  document.addEventListener("DOMContentLoaded", function(){
  loadPreferredAttributesAndTagsToStrip();
  });
}
function saveOtherPrefs() {
  localStorage.setItem("dataStorage-indentStyle", document.querySelector("[name='rad_Indentstyle']:checked").value);
  localStorage.setItem("dataStorage-indentDepth", document.querySelector("[name='rad_Indentdepth']:checked").value);
  localStorage.setItem("dataStorage-outputMarkupContainerType", document.querySelector("[name='outputMarkupContainerType']:checked").value);
  localStorage.setItem("dataStorage-whenShouldTheMarkupUpdate", document.querySelector("[name='whenShouldTheMarkupUpdate']:checked").value);
  if (document.querySelector("#fartBigReductions").checked) {
    localStorage.setItem("dataStorage-fartBigReductions", "true");
  } else {
    localStorage.setItem("dataStorage-fartBigReductions", "false");

  }
  if (document.querySelector("#chk_brailleFriendlyOutput").checked) {
    localStorage.setItem("dataStorage-brailleFriendlyOutput", "true");
  } else {
    localStorage.setItem("dataStorage-brailleFriendlyOutput", "false");

  }
}
function loadOtherPrefs() {
  document.querySelector("[name='rad_Indentstyle'][value='" + localStorage.getItem("dataStorage-indentStyle") + "']").checked=true;
  document.querySelector("[name='rad_Indentdepth'][value='" + localStorage.getItem("dataStorage-indentDepth") + "']").checked=true;
  if (localStorage.getItem("dataStorage-brailleFriendlyOutput")==="true") {
    document.querySelector("#chk_brailleFriendlyOutput").checked=true;
  }
  if (localStorage.getItem("dataStorage-outputMarkupContainerType")==="plaintext") {
    document.querySelector("#outputMarkupContainerType_plaintext").checked=true;
    showPlainTextOutput();
  }
  if (localStorage.getItem("dataStorage-whenShouldTheMarkupUpdate")==="OnlyWithSubmit") {
    document.querySelector("#whenShouldTheMarkupUpdate_OnlyWithSubmit").checked=true;
    updateMarkupWithEachChange=false;
  }
  if (localStorage.getItem("dataStorage-fartBigReductions")==="true") {
    document.querySelector("#fartBigReductions").checked=true;
  }
}
function stripPointlessSpanOrDivElements(startElement, toStrip) {
  testDivForPointlessElements.innerHTML=outputPlainText.value;
  const test = document.createElement("div");
  test.innerHTML = startElement.innerHTML;
  [...test.querySelectorAll('*')].forEach(elem => {
    if (!elem.attributes.length && toStrip.includes(elem.tagName.toLowerCase())) {
      if (elem.children.length) elem.replaceWith(...elem.children);
      else elem.replaceWith(elem.innerText);
    }
  });
  input.value = test.innerHTML;
  removeIndentsInInputText();
  btnDecrapulate.click();
}
function generateMarkup() {

  //String manipulations (on raw)
  function addTableMarkupToOrphanedInnerTableElements() {
    isTableCell = false;
    isTableHeader = false;
    isTableBody = false;
    isTableRow = false;
    if ((raw.indexOf("<th") === 0) || (raw.indexOf("<td") === 0)) {
      isTableCell = true;
      isTableHeader = false;
      isTableBody = false;
      isTableRow = false;
    }
    if (raw.indexOf("<tr") === 0) {
      isTableCell = false;
      isTableHeader = false;
      isTableBody = false;
      isTableRow = true;
    }
    if (raw.indexOf("<thead") === 0) {
      isTableCell = false;
      isTableHeader = true;
      isTableBody = false;
      isTableRow = false;
    }
    if (raw.indexOf("<tbody") === 0) {
      isTableCell = false;
      isTableHeader = false;
      isTableBody = true;
      isTableRow = false;
    }
    if (isTableCell || isTableHeader || isTableBody || isTableRow) {
      if (!addTableMarkupChoiceSet) {
        addTableMarkupChoiceSet = true;
      }
      if (isTableCell) {
        raw = "<table><tr>" + raw + "</tr></table>";
      }
      if (isTableHeader || isTableBody || isTableRow) {
        raw = "<table>" + raw + "</table>";
      }
    }
  }
  function filterComments() {
    if (filterAllHTMLcomments.checked) {
      raw = raw.replace(/<!--(.*?)-->/g, "");
    }
    if (filterEmptyComments.checked) {
      raw = raw.replace(/<!--(-*?)-->/g, "");
    }
  }
  function filterAngularTags() {
    if (filterAngularNgCrapTags.checked) {
      raw = raw.replace(/<ng-(.*?)>/g, "");
      raw = raw.replace(/<\/ng-(.*?)>/g, "");
    }
  }
  // DOM traversal operations
  function filterHtmlElements() {
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
  }

  function filterAttributes() {
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
            if (arrFilterCustomAttr !== "") {
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
  }
  function filterEmptyElements() {
    let emptyEls = tempDOMDumpingGround.querySelectorAll(":empty:not(area):not(base):not(br):not(col):not(embed):not(hr):not(img):not(input):not(keygen):not(link):not(meta):not(param):not(source):not(track):not(wbr)");
    if (filterEmpty.checked) {
      Array.from(emptyEls).forEach((el) => {
        el.parentNode.removeChild(el);
      });
      emptyEls = tempDOMDumpingGround.querySelectorAll("*:empty");
    }
  }
  function abbreviateSrcs(){
    const allElsWithSrc = tempDOMDumpingGround.querySelectorAll("[src]");
    if (chkAbbreviateSrcs.checked) {
      Array.from(allElsWithSrc).forEach((el) => {
        el.setAttribute("src","…");
      });
    } 
  }
  function abbreviateSrcSets(){
    const allElsWithSrcSet = tempDOMDumpingGround.querySelectorAll("[srcset]");
    if (chkAbbreviateSrcSets.checked) {
      Array.from(allElsWithSrcSet).forEach((el) => {
        el.setAttribute("srcset","…");
      });
    } 
  }
  function abbreviateHrefs(){
    const allHElsWithref = tempDOMDumpingGround.querySelectorAll("[href]");
    if (chkAbbreviateHrefs.checked) {
      Array.from(allHElsWithref).forEach((el) => {
        el.setAttribute("href","…");
      });
    }
  }
  function abbreviateTitles(){
    const allTElsWittitle = tempDOMDumpingGround.querySelectorAll("[title]");
    if (chkAbbreviateTitles.checked) {
      Array.from(allTElsWittitle).forEach((el) => {
        el.setAttribute("title","…");
      });
    } 
  }

  // Convert back to indented outputRichText
  function convertTempDomNodeToIndentedOutputRichText() {
    indented = tempDOMDumpingGround.innerHTML.split("><").join(">\n<").replaceAll(/<(?<tag>\w+)([^>]*)>\n<\/\k<tag>>/g, "<$1$2></$1>");
    if (formatBrailleFriendlyOutput.checked) {
      var arrayOfLines = indented.split('\n');
      for (let i = 0; i < arrayOfLines.length; i++) {
        if (arrayOfLines[i].length > 80) {
          arrayOfLines[i] = arrayOfLines[i].replace(/(.{1,80})/g, '$1\n');
        }
      }
      indented = arrayOfLines.join("\n");
      indented = indented.replace(/\n\n/g, '\n');
    } else {
      indented = indent.js(indented, { tabString: indentStr });
    }
    indented = indented.split("<").join("&lt;");
    indented = indented.split(">").join("&gt;");
    indented = indented.split("QUESTION_MARK").join("?");
  }
  function removeAddedTableMarkup() {
    if (isTableCell) {
      outputRichText.textContent = outputRichText.textContent.replace("<table>\n" + indentStyle + "<tbody>\n" + indentStyle + indentStyle + "<tr>\n", "");
      outputRichText.textContent = outputRichText.textContent.replace(indentStyle + indentStyle + "</tr>\n" + indentStyle + "</tbody>\n</table>", "");
    }
    if (isTableHeader || isTableBody) {
      outputRichText.textContent = outputRichText.textContent.replace("<table>\n", "");
      outputRichText.textContent = outputRichText.textContent.replace("</table>", "");
    }
    if (isTableRow) {
      outputRichText.textContent = outputRichText.textContent.replace("<table>\n <tbody>\n  ", "");
      outputRichText.textContent = outputRichText.textContent.replace("</tbody>\n</table>", "");
      outputRichText.textContent = outputRichText.textContent.replace("\n" + indentStyle + indentStyle + "</tr>", "\n</tr>");
    }
    outputRichText.textContent = outputRichText.textContent.trim();
    outputPlainText.textContent = outputRichText.textContent.trim();
    if (outputRichText.textContent.length>0) {
      btnCopyToClipboard.removeAttribute("disabled");
      btnDoAnotherPass.removeAttribute("disabled");
      btnRemovePointlessNestedElements.removeAttribute("disabled");
    } else {
      btnCopyToClipboard.setAttribute("disabled","disabled");
      btnDoAnotherPass.setAttribute("disabled","disabled");
      btnRemovePointlessNestedElements.setAttribute("disabled","disabled");
    }
  }
  // Other stuff
  function unencodeURL() {
    if (urlEncoded) {
      raw = decodeURI(urlEncoded);
      raw = raw.replace(/%3D/g, "=");
      raw = raw.replace(/%2F/g, "/");
      input.value = raw;
    } else {
      raw = document.querySelector("#txtRaw").value;
    }
  }
  function celebrateBigReductionsWithANiceLongFart() {
    if (fartBigReductions.checked) {
      if (percentage < 15) {
        var audio = new Audio('longfart.mp3');
        audio.play();
      }
    }
  }
  applyIndenting();
  unencodeURL();
  if (isFirstPass) {
    beforeSize = raw.length;
  }
  addTableMarkupToOrphanedInnerTableElements();
  filterAngularTags();
  filterComments();
  raw = raw.replace(/\?/g, "QUESTION_MARK");
  tempDOMDumpingGround.innerHTML = raw;
  let allElsInTempDom = tempDOMDumpingGround.querySelectorAll("*");
  filterHtmlElements();
  filterAttributes();
  filterEmptyElements();
  abbreviateSrcs();
  abbreviateSrcSets();
  abbreviateHrefs();
  abbreviateTitles();
  convertTempDomNodeToIndentedOutputRichText();
  outputRichText.innerHTML = indented;
  afterSize = outputRichText.textContent.length;
  let percentage = ((afterSize / beforeSize) * 100).toFixed(2);
  log.innerHTML = "<span class='visually-hidden'>Markup updated. </span>Size before: <span>" + beforeSize + " characters</span>. Size after: <span>" + afterSize + " characters</span>. Cleaned/indented = <span>" + percentage + "%</span> of original markup<div aria-hidden=\"true\" id=\"turd\"></div>";
  celebrateBigReductionsWithANiceLongFart();
  removeAddedTableMarkup();
  hljs.highlightBlock(outputRichText);
  const turd = document.querySelector("#turd");
  turd.style.width=percentage+"%";
}
addAllEventListeners();
loadAndSaveData();
loadOtherPrefs();
