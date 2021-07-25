const body = document.querySelector('body');
const nonModalContent = document.querySelector('#allPageContent');
const modalCurtain = document.querySelector('.modal-curtain');
let supportsInert, modal, triggerEl;
let modalTriggers = document.querySelectorAll('.modal-trigger'); //test to see if browser supports `inert` attribute. If it does, we 
let testEl = document.createElement('div');
supportsInert = 'inert' in testEl;
let allFocusableElsOutsideModal = nonModalContent.querySelectorAll('input:not([disabled]),textarea:not([disabled]),select:not([disabled]),button:not([disabled]),a[href],iframe,object,embed,*[tabindex]:not([tabindex="-1"]),*[contenteditable=true]');
let firstFocusable;
let lastFocusable;
let trapModalFocus = true;

modalCurtain.addEventListener('click', function (e) {
  closeModal();
});
document.addEventListener('keydown', function (e) {
  if (e.key === "Escape") {
    closeModal();
  }

  if (trapModalFocus) {
    if (e.key === "Tab") {
      if (document.activeElement === firstFocusable && e.shiftKey) {
        lastFocusable.focus();
        e.preventDefault();
      }

      if (document.activeElement === lastFocusable && !e.shiftKey) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }
});

function showModal(modalTrigger, e) {
  //is it a link or a button opening? Use href # value or data-target?
  if (modalTrigger.hash) {
    //link
    modal = document.querySelector(modalTrigger.hash);
  } else {
    //button
    modal = document.querySelector(modalTrigger.getAttribute('data-target'));
  } // is modal set to completely trap focus within dialog?

  body.classList.add('no-scroll');

  trapModalFocus = modal.getAttribute('data-trap-focus') === 'true';

  if (trapModalFocus) {
    //find focusable elements in case option to trap focus is set
    let focusableEls = modal.querySelectorAll('input:not([disabled]),textarea:not([disabled]),select:not([disabled]),button:not([disabled]),a[href],iframe,object,embed,*[tabindex]:not([tabindex="-1"]),*[contenteditable=true]');
    firstFocusable = focusableEls[0];
    lastFocusable = focusableEls[focusableEls.length - 1];
  } //hide content outside of modal to AT and make focusable elements temporarily unfocusable


  if (supportsInert) {
    nonModalContent.setAttribute('inert', 'inert');
  } else {
    nonModalContent.setAttribute('aria-hidden', 'true'); // set negative tabindexes

    Array.from(allFocusableElsOutsideModal).forEach(function (focusableEl) {
      if (focusableEl.getAttribute('tabindex')) {
        focusableEl.setAttribute('data-original-tabindex', focusableEl.getAttribute('tabindex'));
      }

      focusableEl.setAttribute('tabindex', '-1');
      focusableEl.classList.add('temporarilyNonFocusable');
    });
  } //show the dialog and curtain


  modalCurtain.removeAttribute('hidden');
  modal.removeAttribute('hidden'); //focus on the dialog
  //focus on the modal

  modal.setAttribute('tabindex', '-1');
  modal.focus();
  firstFocusable.focus();
  modal.removeAttribute('tabindex'); //set up this modal's close button behaviour

  e.preventDefault();
  let mCloseButtons = modal.querySelectorAll('button.close, button.cancel');
  Array.from(mCloseButtons).forEach(mCloseButton => {
    mCloseButton.addEventListener('click', function (e) {
      closeModal();
    });
  });
}

function closeModal() {
  body.classList.remove('no-scroll');
  if (supportsInert) {
    nonModalContent.removeAttribute('inert');
  } else {
    nonModalContent.removeAttribute('aria-hidden');
    let temporarilyNonFocusableEls = document.querySelectorAll('.temporarilyNonFocusable');
    Array.from(temporarilyNonFocusableEls).forEach(function (temporarilyNonFocusableEl) {
      if (temporarilyNonFocusableEl.getAttribute('data-original-tabindex')) {
        temporarilyNonFocusableEl.setAttribute('tabindex', temporarilyNonFocusableEl.getAttribute('data-original-tabindex'));
        temporarilyNonFocusableEl.removeAttribute('data-original-tabindex');
      } else {
        temporarilyNonFocusableEl.removeAttribute('tabindex');
      }

      temporarilyNonFocusableEl.classList.remove('temporarilyNonFocusable');
    });
  }

  modal.setAttribute('hidden', 'hidden');
  modalCurtain.setAttribute('hidden', 'hidden');
  triggerEl.focus();
}

Array.from(modalTriggers).forEach(function (modalTrigger) {
  modalTrigger.addEventListener('click', function (e) {
    triggerEl = modalTrigger;
    showModal(modalTrigger, e);
  });
});
