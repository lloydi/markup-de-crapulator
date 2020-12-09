var textareas = document.querySelectorAll("textarea");
Array.from(textareas).forEach((textarea) => {
    textarea.addEventListener("focus", (ev) => {
        textarea.select();
    });
});
var inputTexts = document.querySelectorAll("input[type=text]");
Array.from(inputTexts).forEach((inputText) => {
    inputText.addEventListener("focus", (ev) => {
        inputText.select();
    });
});
var editableCodeAreas = document.querySelectorAll("code[contenteditable=true]");
Array.from(editableCodeAreas).forEach((editableCodeArea) => {
    editableCodeArea.addEventListener("focus", (ev) => {
        // See https://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element/6150060#6150060
        var range = document.createRange();
        range.selectNodeContents(editableCodeArea);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    });
});
