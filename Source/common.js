function selectElementContents(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

var textareas = document.querySelectorAll("textarea,code[contenteditable]");
Array.from(textareas).forEach((textarea) => {
    textarea.addEventListener("focus", (ev) => {
        selectElementContents(textarea);
    });
});
var inputTexts = document.querySelectorAll("input[type=text]");
Array.from(inputTexts).forEach((inputText) => {
    inputText.addEventListener("focus", (ev) => {
        inputText.select();
    });
});
