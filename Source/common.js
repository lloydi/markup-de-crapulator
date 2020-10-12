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