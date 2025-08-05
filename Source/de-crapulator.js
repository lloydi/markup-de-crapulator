// Cache DOM elements
const elements = {
  input: document.querySelector("#txtRaw"),
  outputRichText: document.querySelector("#txtConvertedRichText"),
  outputPlainText: document.querySelector("#txtConvertedPlainText"),
  convertedRichTextWrapper: document.querySelector("#convertedRichTextWrapper"),
  convertedPlainTextWrapper: document.querySelector("#convertedPlainTextWrapper"),
  tempDOMDumpingGround: document.querySelector("#tempDOMDumpingGround"),
  testDivForPointlessElements: document.querySelector("#testDivForPointlessElements"),
  log: document.querySelector("#log"),
  
  // Buttons
  btnDecrapulate: document.querySelector("#btnDecrapulate"),
  btnCopyToClipboard: document.querySelector("#btnCopyToClipboard"),
  btnDoAnotherPass: document.querySelector("#btnDoAnotherPass"),
  btnRemovePointlessNestedElements: document.querySelector("#btnRemovePointlessNestedElements"),
  btnMorePreferences: document.querySelector("#btnMorePreferences"),
  btnResetEverything: document.querySelector("#btnResetEverything"),
  btnApplyAttributeSettings: document.querySelector("#btnApplyAttributeSettings"),
  removeAll: document.querySelector("#removeAll"),
  
  // Filter checkboxes - organized by category
  filters: {
    empty: document.querySelector("#chk_emptyTags"),
    class: document.querySelector("#chk_stripClassAttributes"),
    style: document.querySelector("#chk_stripStyleAttributes"),
    dir: document.querySelector("#chk_stripDirAttributes"),
    lang: document.querySelector("#chk_stripLangAttributes"),
    onclick: document.querySelector("#chk_onclick"),
    onClickReact: document.querySelector("#chk_stripOnClickReactAttributes"),
    dataDash: document.querySelector("#chk_stripDataDashAttributes"),
    ariaDash: document.querySelector("#chk_stripARIADashAttributes"),
    angularNg1: document.querySelector("#chk_stripAngularCrapAttributes1"),
    angularNg2: document.querySelector("#chk_stripAngularCrapAttributes2"),
    angularTags: document.querySelector("#chk_stripAngularCrapTags"),
    allComments: document.querySelector("#chk_allHTMLcomments"),
    emptyComments: document.querySelector("#chk_emptyHTMLComments"),
    brailleFriendly: document.querySelector("#chk_brailleFriendlyOutput")
  },
  
  // Abbreviation checkboxes
  abbreviate: {
    classes: document.querySelector("#chk_abbreviateClasses"),
    styles: document.querySelector("#chk_abbreviateStyles"),
    hrefs: document.querySelector("#chk_abbreviateHrefs"),
    srcs: document.querySelector("#chk_abbreviateSrcs"),
    srcSets: document.querySelector("#chk_abbreviateSrcSets"),
    titles: document.querySelector("#chk_abbreviateTitles")
  },
  
  // Text inputs
  customAttrs: document.querySelector("#txt_customAttrs"),
  otherMiscAttrs: document.querySelector("#txt_otherMiscAttrs"),
  anyHTMLtag: document.querySelector("#txt_anyHTMLtag"),
  fartBigReductions: document.querySelector("#fartBigReductions"),
  
  // Radio groups
  indentRadios: document.querySelectorAll("[name=rad_Indentstyle],[name=rad_Indentdepth]"),
  allPrefInputs: document.querySelectorAll("#allPreferences input"),
  otherFilterCheckboxes: document.querySelectorAll("#otherFilters [type=checkbox]"),
  outputMarkupContainerTypeRads: document.querySelectorAll("[name='outputMarkupContainerType']"),
  whenShouldTheMarkupUpdateRads: document.querySelectorAll("[name='whenShouldTheMarkupUpdate']")
};

// State management
const state = {
  raw: "",
  indented: "",
  indentStyle: "",
  indentDepth: "",
  indentStr: "",
  urlEncoded: location.href.split("?markup=")[1],
  beforeSize: 0,
  afterSize: 0,
  addTableMarkupChoiceSet: false,
  isTableCell: false,
  isTableHeader: false,
  isTableBody: false,
  isTableRow: false,
  updateMarkupWithEachChange: true,
  isFirstPass: true,
  suppressalerts: location.href.indexOf("suppressalerts=true") !== -1,
  resetOK: false
};

// Utility functions
const utils = {
  // Batch DOM operations for better performance
  batchStripAttribute(attr) {
    const elementsToStrip = elements.tempDOMDumpingGround.querySelectorAll(`[${attr}]`);
    elementsToStrip.forEach(el => el.removeAttribute(attr));
  },

  batchAbbreviateAttribute(attr) {
    const elementsToAbbreviate = elements.tempDOMDumpingGround.querySelectorAll(`[${attr}]`);
    elementsToAbbreviate.forEach(el => el.setAttribute(attr, "…"));
  },

  // Optimized checkbox operations
  setAllCheckboxes(checked = true) {
    elements.otherFilterCheckboxes.forEach(checkbox => checkbox.checked = checked);
    if (state.updateMarkupWithEachChange) generateMarkup();
  },

  // Local storage operations
  saveToStorage(key, value) {
    localStorage.setItem(`dataStorage-${key}`, value);
  },

  getFromStorage(key) {
    return localStorage.getItem(`dataStorage-${key}`);
  },

  clearStorageByPrefix(prefix) {
    Object.keys(localStorage)
      .filter(key => key.includes(prefix))
      .forEach(key => localStorage.removeItem(key));
  },

  // Get checked radio value
  getCheckedRadioValue(name) {
    return document.querySelector(`[name="${name}"]:checked`)?.value;
  },

  // Batch attribute processing
  processAttributesByPattern(pattern, shouldStrip) {
    const allElements = elements.tempDOMDumpingGround.querySelectorAll("*");
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (pattern(attr.name)) {
          if (shouldStrip) {
            el.removeAttribute(attr.name);
          }
        }
      });
    });
  }
};

// Event handler factories
const createEventHandlers = () => ({
  // Generic change handler for markup updates
  handleMarkupUpdate: () => {
    if (state.updateMarkupWithEachChange) generateMarkup();
  },

  // Generic keyup handler with tab exclusion
  handleKeyupUpdate: (e) => {
    if (state.updateMarkupWithEachChange && e.keyCode !== 9) {
      generateMarkup();
    }
  },

  // Abbreviation checkbox handlers
  createAbbreviationHandler: (abbreviateCheckbox, stripCheckbox) => () => {
    if (stripCheckbox?.checked) {
      stripCheckbox.checked = false;
      abbreviateCheckbox.checked = true;
    }
    if (state.updateMarkupWithEachChange) generateMarkup();
  }
});

// Initialize event listeners
function addAllEventListeners() {
  const handlers = createEventHandlers();

  // Reset functionality
  elements.btnResetEverything.addEventListener("click", () => {
    if (!state.suppressalerts) {
      if (confirm("This will also remove any stored/saved values in the attributes to strip as well as preferences. Only press OK if you're, um, OK with that…")) {
        state.resetOK = true;
      }
    } else {
      state.resetOK = true;
    }
    
    if (state.resetOK) {
      initVals();
      elements.input.value = "";
      elements.input.focus();
      document.querySelector("#rad_Indentstyle_1").click();
      document.querySelector("#rad_Indentdepth_1").click();
      utils.setAllCheckboxes(false);
      elements.removeAll.setAttribute("aria-pressed", "false");
      elements.customAttrs.value = "";
      elements.otherMiscAttrs.value = "";
      utils.clearStorageByPrefix("dataStorage-");
    }
  });

  // Batch add event listeners for similar elements
  elements.indentRadios.forEach(radio => 
    radio.addEventListener("change", handlers.handleMarkupUpdate)
  );
  
  elements.allPrefInputs.forEach(input => 
    input.addEventListener("change", saveOtherPrefs)
  );
  
  elements.otherFilterCheckboxes.forEach(checkbox => 
    checkbox.addEventListener("click", handlers.handleMarkupUpdate)
  );

  // Abbreviation handlers with mutual exclusion
  const abbreviationPairs = [
    [elements.abbreviate.classes, elements.filters.class],
    [elements.abbreviate.styles, elements.filters.style]
  ];

  abbreviationPairs.forEach(([abbrev, strip]) => {
    abbrev.addEventListener("click", handlers.createAbbreviationHandler(abbrev, strip));
  });

  // Simple abbreviation handlers
  [elements.abbreviate.srcs, elements.abbreviate.srcSets, 
   elements.abbreviate.hrefs, elements.abbreviate.titles].forEach(element => {
    element.addEventListener("click", handlers.handleMarkupUpdate);
  });

  // Text input handlers
  [elements.customAttrs, elements.otherMiscAttrs, elements.anyHTMLtag].forEach(input => {
    input.addEventListener("keyup", handlers.handleKeyupUpdate);
  });

  // Button handlers
  elements.removeAll.addEventListener("click", () => {
    const isPressed = elements.removeAll.getAttribute("aria-pressed") === "true";
    utils.setAllCheckboxes(!isPressed);
    elements.removeAll.setAttribute("aria-pressed", !isPressed);
  });

  elements.filters.brailleFriendly.addEventListener("click", handlers.handleMarkupUpdate);
  elements.btnDecrapulate.addEventListener("click", generateMarkup);
  
  elements.btnCopyToClipboard.addEventListener("click", () => {
    const wasInPlaintextMode = elements.convertedRichTextWrapper.hasAttribute("hidden");
    showPlainTextOutput();
    elements.outputPlainText.focus();
    elements.outputPlainText.select();
    document.execCommand("copy");
    wasInPlaintextMode ? showPlainTextOutput() : showRichTextOutput();
    elements.btnCopyToClipboard.focus();
  });

  elements.btnApplyAttributeSettings.addEventListener("click", () => {
    closeModal();
    generateMarkup();
  });

  elements.btnDoAnotherPass.addEventListener("click", () => {
    state.isFirstPass = false;
    elements.input.value = elements.outputPlainText.textContent
      .split("> </").join("></")
      .split("<div></div>").join("")
      .split("<span></span>").join("");
    removeIndentsInInputText();
    elements.btnDecrapulate.click();
  });

  elements.btnRemovePointlessNestedElements.addEventListener("click", () => {
    let flattenOK = state.suppressalerts || 
      confirm("This will remove *all* DIV or SPAN elements that have no attributes applied, flattening down the structure (and may no longer represent the reality of the markup you started with, nor any CSS that may have been written based on that structure).\n\nIf that's what you want, hit the old 'OK' button…");
    
    if (flattenOK) {
      stripPointlessSpanOrDivElements(elements.testDivForPointlessElements, ["span", "div"]);
    }
  });

  elements.btnMorePreferences.addEventListener("click", () => {
    const isExpanded = elements.btnMorePreferences.getAttribute("aria-expanded") === "true";
    elements.btnMorePreferences.setAttribute("aria-expanded", !isExpanded);
  });

  // Radio button handlers
  elements.outputMarkupContainerTypeRads.forEach(radio => {
    radio.addEventListener("change", () => {
      radio.value === "plaintext" ? showPlainTextOutput() : showRichTextOutput();
    });
  });

  elements.whenShouldTheMarkupUpdateRads.forEach(radio => {
    radio.addEventListener("change", () => {
      state.updateMarkupWithEachChange = radio.value === "allChanges";
    });
  });

  keepCheckboxStatesBetweenMainDocumentAndModalInSync();
  triggerClicksForUrlEncodedData();
}

function initVals() {
  Object.assign(state, {
    beforeSize: 0,
    afterSize: 0,
    addTableMarkupChoiceSet: false,
    isTableCell: false,
    isTableHeader: false,
    isTableBody: false,
    isTableRow: false,
    updateMarkupWithEachChange: true,
    isFirstPass: true
  });
}

function removeIndentsInInputText() {
  elements.input.value = elements.input.value.split("\n").map(line => line.trim()).join("");
}

function showRichTextOutput() {
  elements.convertedRichTextWrapper.removeAttribute("hidden");
  elements.convertedPlainTextWrapper.setAttribute("hidden", "hidden");
}

function showPlainTextOutput() {
  elements.convertedRichTextWrapper.setAttribute("hidden", "hidden");
  elements.convertedPlainTextWrapper.removeAttribute("hidden");
}

function triggerClicksForUrlEncodedData() {
  if (state.urlEncoded) {
    utils.setAllCheckboxes(false);
    generateMarkup();
    [elements.filters.empty, elements.filters.angularNg1, elements.filters.angularNg2, 
     elements.filters.angularTags, elements.filters.allComments, elements.filters.emptyComments]
     .forEach(element => element.click());
  }
}

function applyIndenting() {
  state.indentStyle = utils.getCheckedRadioValue("rad_Indentstyle");
  state.indentDepth = utils.getCheckedRadioValue("rad_Indentdepth");
  
  const indentChar = state.indentStyle === "space" ? " " : "\t";
  state.indentStr = indentChar.repeat(parseInt(state.indentDepth));
}

// Optimized data persistence
function loadAndSaveData() {
  const userEnteredTextFields = document.querySelectorAll("[data-user-entered]");
  
  const savePreferredAttributesAndTagsToStrip = (field, timeout = 3000) => {
    const id = field.getAttribute("id");
    const text = field.value;
    utils.saveToStorage(id, text);
  };

  const loadPreferredAttributesAndTagsToStrip = () => {
    Object.keys(localStorage)
      .filter(key => key.includes("dataStorage-"))
      .forEach(key => {
        const id = key.replace("dataStorage-", "");
        const element = document.querySelector(`#${id}`);
        if (element) {
          element.value = localStorage.getItem(key) || "";
        }
      });
  };

  userEnteredTextFields.forEach(field => {
    field.setAttribute("data-user-entered", "true");
    let timeout = null;
    
    field.addEventListener("blur", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => savePreferredAttributesAndTagsToStrip(field), 1);
    });
    
    field.addEventListener("keyup", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => savePreferredAttributesAndTagsToStrip(field), 3000);
    });
  });

  document.addEventListener("DOMContentLoaded", loadPreferredAttributesAndTagsToStrip);
}

function saveOtherPrefs() {
  const prefs = {
    indentStyle: utils.getCheckedRadioValue("rad_Indentstyle"),
    indentDepth: utils.getCheckedRadioValue("rad_Indentdepth"),
    outputMarkupContainerType: utils.getCheckedRadioValue("outputMarkupContainerType"),
    whenShouldTheMarkupUpdate: utils.getCheckedRadioValue("whenShouldTheMarkupUpdate"),
    fartBigReductions: elements.fartBigReductions.checked.toString(),
    brailleFriendlyOutput: elements.filters.brailleFriendly.checked.toString()
  };

  Object.entries(prefs).forEach(([key, value]) => utils.saveToStorage(key, value));
}

function loadOtherPrefs() {
  const loadRadio = (name, storageKey) => {
    const value = utils.getFromStorage(storageKey);
    if (value) {
      const radio = document.querySelector(`[name='${name}'][value='${value}']`);
      if (radio) radio.checked = true;
    }
  };

  loadRadio("rad_Indentstyle", "indentStyle");
  loadRadio("rad_Indentdepth", "indentDepth");

  if (utils.getFromStorage("brailleFriendlyOutput") === "true") {
    elements.filters.brailleFriendly.checked = true;
  }

  if (utils.getFromStorage("outputMarkupContainerType") === "plaintext") {
    document.querySelector("#outputMarkupContainerType_plaintext").checked = true;
    showPlainTextOutput();
  }

  if (utils.getFromStorage("whenShouldTheMarkupUpdate") === "OnlyWithSubmit") {
    document.querySelector("#whenShouldTheMarkupUpdate_OnlyWithSubmit").checked = true;
    state.updateMarkupWithEachChange = false;
  }

  if (utils.getFromStorage("fartBigReductions") === "true") {
    elements.fartBigReductions.checked = true;
  }
}

function stripPointlessSpanOrDivElements(startElement, tagsToStrip) {
  elements.testDivForPointlessElements.innerHTML = elements.outputPlainText.value;
  const test = document.createElement("div");
  test.innerHTML = startElement.innerHTML;
  
  test.querySelectorAll("*").forEach(elem => {
    if (!elem.attributes.length && tagsToStrip.includes(elem.tagName.toLowerCase())) {
      elem.children.length ? elem.replaceWith(...elem.children) : elem.replaceWith(elem.innerText);
    }
  });
  
  elements.input.value = test.innerHTML;
  removeIndentsInInputText();
  elements.btnDecrapulate.click();
}

function generateMarkup() {
  // String manipulations
  const addTableMarkupToOrphanedInnerTableElements = () => {
    const tableStarts = ["<th", "<td", "<tr", "<thead", "<tbody"];
    const foundStart = tableStarts.find(start => state.raw.indexOf(start) === 0);
    
    if (foundStart) {
      state.addTableMarkupChoiceSet = true;
      state.isTableCell = foundStart.includes("t");
      state.isTableHeader = foundStart === "<thead";
      state.isTableBody = foundStart === "<tbody";
      state.isTableRow = foundStart === "<tr";
      
      if (state.isTableCell) {
        state.raw = `<table><tr>${state.raw}</tr></table>`;
      } else if (state.isTableHeader || state.isTableBody || state.isTableRow) {
        state.raw = `<table>${state.raw}</table>`;
      }
    }
  };

  const filterComments = () => {
    if (elements.filters.allComments.checked) {
      state.raw = state.raw.replace(/<!--(.*?)-->/g, "");
    }
    if (elements.filters.emptyComments.checked) {
      state.raw = state.raw.replace(/<!--(-*?)-->/g, "");
    }
  };

  const filterAngularTags = () => {
    if (elements.filters.angularTags.checked) {
      state.raw = state.raw.replace(/<\/?ng-[^>]*>/g, "");
    }
  };

  // DOM traversal operations
  const filterHtmlElements = () => {
    if (elements.anyHTMLtag.value.trim()) {
      const tagsToRemove = elements.anyHTMLtag.value.split(",").map(tag => tag.trim());
      tagsToRemove.forEach(tag => {
        const elementsToRemove = elements.tempDOMDumpingGround.querySelectorAll(tag);
        elementsToRemove.forEach(el => el.remove());
      });
    }
  };

  // Optimized attribute filtering using batch operations
  const filterAttributes = () => {
    const attributeFilters = {
      class: elements.filters.class,
      style: elements.filters.style,
      dir: elements.filters.dir,
      lang: elements.filters.lang,
      onclick: elements.filters.onclick,
      onClick: elements.filters.onClickReact
    };

    // Process simple attribute removals
    Object.entries(attributeFilters).forEach(([attr, checkbox]) => {
      if (checkbox.checked) {
        utils.batchStripAttribute(attr);
        // Uncheck abbreviation if stripping
        if (attr === "class" && elements.abbreviate.classes.checked) {
          elements.abbreviate.classes.checked = false;
        }
        if (attr === "style" && elements.abbreviate.styles.checked) {
          elements.abbreviate.styles.checked = false;
        }
      }
    });

    // Process pattern-based attributes
    const patternFilters = [
      { checkbox: elements.filters.ariaDash, pattern: name => name.startsWith("aria-") },
      { checkbox: elements.filters.dataDash, pattern: name => name.startsWith("data-") },
      { checkbox: elements.filters.angularNg1, pattern: name => name.startsWith("ng-") },
      { checkbox: elements.filters.angularNg2, pattern: name => name.startsWith("_ng") }
    ];

    patternFilters.forEach(({ checkbox, pattern }) => {
      if (checkbox.checked) {
        utils.processAttributesByPattern(pattern, true);
      }
    });

    // Process custom attributes
    if (elements.customAttrs.value.trim()) {
      const customAttrs = elements.customAttrs.value.split(",").map(attr => attr.trim()).filter(Boolean);
      customAttrs.forEach(attr => {
        utils.processAttributesByPattern(name => name.startsWith(attr), true);
      });
    }

    // Process other misc attributes
    if (elements.otherMiscAttrs.value.trim()) {
      const miscAttrs = elements.otherMiscAttrs.value.split(",").map(attr => attr.trim().toLowerCase()).filter(Boolean);
      miscAttrs.forEach(attr => {
        utils.processAttributesByPattern(name => name.toLowerCase() === attr, true);
      });
    }
  };

  const filterEmptyElements = () => {
    if (elements.filters.empty.checked) {
      const emptyEls = elements.tempDOMDumpingGround.querySelectorAll(":empty:not(area):not(base):not(br):not(col):not(embed):not(hr):not(img):not(input):not(keygen):not(link):not(meta):not(param):not(source):not(track):not(wbr)");
      emptyEls.forEach(el => el.remove());
    }
  };

  // Batch abbreviation operations
  const applyAbbreviations = () => {
    const abbreviations = {
      class: elements.abbreviate.classes,
      style: elements.abbreviate.styles,
      src: elements.abbreviate.srcs,
      srcset: elements.abbreviate.srcSets,
      href: elements.abbreviate.hrefs,
      title: elements.abbreviate.titles
    };

    Object.entries(abbreviations).forEach(([attr, checkbox]) => {
      if (checkbox.checked) {
        utils.batchAbbreviateAttribute(attr);
      }
    });
  };

  const checkActionsAppliedInModal = () => {
    if (typeof modal !== 'undefined' && modal) {
      const radioButtonsSetInModal = modal.querySelectorAll("input[type=radio]:checked");
      radioButtonsSetInModal.forEach(radio => {
        const [, action] = radio.getAttribute("id").split("_");
        const attribute = radio.getAttribute("data-attribute");
        
        if (action === "abbrev") {
          utils.batchAbbreviateAttribute(attribute);
        } else if (action === "strip") {
          utils.batchStripAttribute(attribute);
        }
      });
    }
  };

  const convertTempDomNodeToIndentedOutputRichText = () => {
    state.indented = elements.tempDOMDumpingGround.innerHTML
      .split("><").join(">\n<")
      .replaceAll(/<(?<tag>\w+)([^>]*)>\n<\/\k<tag>>/g, "<$1$2></$1>");

    if (elements.filters.brailleFriendly.checked) {
      const arrayOfLines = state.indented.split("\n");
      for (let i = 0; i < arrayOfLines.length; i++) {
        if (arrayOfLines[i].length > 80) {
          arrayOfLines[i] = arrayOfLines[i].replace(/(.{1,80})/g, "$1\n");
        }
      }
      state.indented = arrayOfLines.join("\n").replace(/\n\n/g, "\n");
    } else {
      state.indented = indent.js(state.indented, { tabString: state.indentStr });
    }
    
    state.indented = state.indented
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split("QUESTION_MARK").join("?");
  };

  const removeAddedTableMarkup = () => {
    let content = elements.outputRichText.textContent;
    
    if (state.isTableCell) {
      content = content
        .replace(`<table>\n${state.indentStyle}<tbody>\n${state.indentStyle}${state.indentStyle}<tr>\n`, "")
        .replace(`${state.indentStyle}${state.indentStyle}</tr>\n${state.indentStyle}</tbody>\n</table>`, "");
    }
    if (state.isTableHeader || state.isTableBody) {
      content = content.replace("<table>\n", "").replace("</table>", "");
    }
    if (state.isTableRow) {
      content = content
        .replace("<table>\n <tbody>\n  ", "")
        .replace("</tbody>\n</table>", "")
        .replace(`\n${state.indentStyle}${state.indentStyle}</tr>`, "\n</tr>");
    }
    
    elements.outputRichText.textContent = content.trim();
    elements.outputPlainText.textContent = content.trim();
    
    const hasContent = elements.outputRichText.textContent.length > 0;
    [elements.btnCopyToClipboard, elements.btnDoAnotherPass, elements.btnRemovePointlessNestedElements]
      .forEach(btn => {
        hasContent ? btn.removeAttribute("disabled") : btn.setAttribute("disabled", "disabled");
      });
  };

  const unencodeURL = () => {
    if (state.urlEncoded) {
      state.raw = decodeURI(state.urlEncoded)
        .replace(/%3D/g, "=")
        .replace(/%2F/g, "/");
      elements.input.value = state.raw;
    } else {
      state.raw = elements.input.value;
    }
  };

  const celebrateBigReductionsWithANiceLongFart = () => {
    if (elements.fartBigReductions.checked && percentage < 15) {
      new Audio("longfart.mp3").play();
    }
  };

  // Main execution
  applyIndenting();
  unencodeURL();
  
  if (state.isFirstPass) {
    state.beforeSize = state.raw.length;
  }
  
  addTableMarkupToOrphanedInnerTableElements();
  filterAngularTags();
  filterComments();
  
  state.raw = state.raw.replace(/\?/g, "QUESTION_MARK");
  elements.tempDOMDumpingGround.innerHTML = state.raw;
  
  filterHtmlElements();
  filterAttributes();
  filterEmptyElements();
  applyAbbreviations();
  checkActionsAppliedInModal();
  convertTempDomNodeToIndentedOutputRichText();
  
  elements.outputRichText.innerHTML = state.indented;
  state.afterSize = elements.outputRichText.textContent.length;
  
  const percentage = ((state.afterSize / state.beforeSize) * 100).toFixed(2);
  elements.log.innerHTML = `<span class='visually-hidden'>Markup updated. </span>Size before: <span>${state.beforeSize} characters</span>. Size after: <span>${state.afterSize} characters</span>. Cleaned/indented = <span>${percentage}%</span> of original markup<div aria-hidden="true" id="turd"></div>`;
  
  celebrateBigReductionsWithANiceLongFart();
  removeAddedTableMarkup();
  
  if (typeof hljs !== 'undefined') {
    hljs.highlightBlock(elements.outputRichText);
  }
  
  const turd = document.querySelector("#turd");
  if (turd) {
    turd.style.width = `${percentage}%`;
  }
}

// Modal sync function (keeping original structure)
function keepCheckboxStatesBetweenMainDocumentAndModalInSync() {
  const modalElements = {
    all_attributes_abbrev: document.querySelector("#all_attributes_abbrev"),
    all_attributes_strip: document.querySelector("#all_attributes_strip"),
    all_attributes_leave: document.querySelector("#all_attributes_leave")
  };

  const attributeTypes = ["class", "style", "href", "src", "srcset", "title"];
  const actions = ["abbrev", "strip", "leave"];

  // Batch create modal elements object
  attributeTypes.forEach(attr => {
    actions.forEach(action => {
      modalElements[`${attr}_${action}`] = document.querySelector(`#${attr}_${action}`);
    });
  });

  // All attributes handlers
  modalElements.all_attributes_abbrev?.addEventListener("click", () => {
    document.querySelector("#listOfAttributes").querySelectorAll("[id*='_abbrev']").forEach(radio => radio.click());
  });

  modalElements.all_attributes_strip?.addEventListener("click", () => {
    document.querySelector("#listOfAttributes").querySelectorAll("[id*='_strip']").forEach(radio => radio.click());
  });

  modalElements.all_attributes_leave?.addEventListener("click", () => {
    document.querySelector("#listOfAttributes").querySelectorAll("[id*='_leave']").forEach(radio => radio.click());
  });

  // Individual attribute handlers
  const attributeHandlers = {
    abbrev: {
      class: () => {
        elements.abbreviate.classes.checked = true;
        elements.filters.class.checked = false;
      },
      style: () => {
        elements.abbreviate.styles.checked = true;
        elements.filters.style.checked = false;
      },
      href: () => elements.abbreviate.hrefs.checked = true,
      src: () => elements.abbreviate.srcs.checked = true,
      srcset: () => elements.abbreviate.srcSets.checked = true,
      title: () => elements.abbreviate.titles.checked = true
    },
    strip: {
      class: () => {
        elements.abbreviate.classes.checked = false;
        elements.filters.class.checked = true;
      },
      style: () => {
        elements.abbreviate.styles.checked = false;
        elements.filters.style.checked = true;
      },
      href: () => elements.abbreviate.hrefs.checked = false,
      src: () => elements.abbreviate.srcs.checked = false,
      srcset: () => elements.abbreviate.srcSets.checked = false,
      title: () => elements.abbreviate.titles.checked = false
    },
    leave: {
      class: () => {
        elements.abbreviate.classes.checked = false;
        elements.filters.class.checked = false;
      },
      style: () => {
        elements.abbreviate.styles.checked = false;
        elements.filters.style.checked = false;
      },
      href: () => elements.abbreviate.hrefs.checked = false,
      src: () => elements.abbreviate.srcs.checked = false,
      srcset: () => elements.abbreviate.srcSets.checked = false,
      title: () => elements.abbreviate.titles.checked = false
    }
  };

  // Batch add event listeners for modal elements
  attributeTypes.forEach(attr => {
    actions.forEach(action => {
      const element = modalElements[`${attr}_${action}`];
      if (element && attributeHandlers[action][attr]) {
        element.addEventListener("click", attributeHandlers[action][attr]);
      }
    });
  });
}

// Initialize everything
initVals();
addAllEventListeners();
loadAndSaveData();
loadOtherPrefs();