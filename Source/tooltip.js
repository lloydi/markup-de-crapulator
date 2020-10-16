function doTooltips() {
  var tooltips = document.querySelectorAll('.tooltip');

  function findAncestor (el, sel) {
    while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el,sel)));
    return el;
  }  

  document.addEventListener('keydown', function(e) {
   if (e.keyCode === 27) {
    unsetAllTooltips();
   }
  });
  document.addEventListener('click', function(e) {
    var onToolTipTrigger = findAncestor(e.srcElement,'.tooltip');//((e.srcElement.parentNode.parentNode)&&(e.srcElement.parentNode.parentNode.classList.contains('tooltip')));
    if (!findAncestor(e.srcElement,'[role=tooltip]')) {
      if (!onToolTipTrigger) {
        unsetAllTooltips();
      }
    } 
    if (onToolTipTrigger) {
      e.stopPropagation();
    }
  });

  Array.from(tooltips).forEach(tooltip => {
    var trigger = tooltip.querySelector('button');
    var tooltipText = tooltip.querySelector('[role=tooltip]');
    var userActivated = tooltip.classList.contains('user-activated');
    setDynamicAriaLabels(tooltipText, trigger);

    if (userActivated) {
      trigger.addEventListener('keydown', function(e) {
        if ((e.keyCode === 32)||(e.keyCode === 13)) {
          if (trigger.getAttribute('aria-expanded')==='false') {
           showThisTooltip(trigger, tooltipText);
          } else {
           hideThisTooltip(trigger, tooltipText);
          }
         e.preventDefault();
        }
      });
      trigger.addEventListener('mousedown', function(e) {
        if (trigger.getAttribute('aria-expanded')==='false') {
         showThisTooltip(trigger, tooltipText);
        } else {
         hideThisTooltip(trigger, tooltipText);
        }
      });
    } else {
      trigger.addEventListener('mouseover', function(e) {
        showThisTooltip(trigger, tooltipText);
      });
      trigger.addEventListener('mouseout', function(e) {
        unsetAllTooltips();
      });
      trigger.addEventListener('focus', function(e) {
        showThisTooltip(trigger, tooltipText);
      });
      trigger.addEventListener('blur', function(e) {
        unsetAllTooltips();
      });
    }
    //iOS needs this as selecting the trigger using VoiceOver isn't classed as a focus event
    trigger.addEventListener('click', function(e) {
      if (trigger.getAttribute('aria-expanded') === 'true') {
        showThisTooltip(trigger, tooltipText);
      } else {
        unsetAllTooltips();
      }
    });
  });

  function setDynamicAriaLabels(tooltipText, trigger) {
    var triggerLabel = 'Help';
    var overrideExistingLabel = false;
    var tooltipTextContent = tooltipText.innerText;
    var tooltipTextContentLimit = 50;
    if (trigger.classList.contains('dynamic-label')) {
      //limit to subset for now for testing POC
      if (!trigger.getAttribute('aria-label') || overrideExistingLabel) {
        // only apply this if there is not already an aria-label. Let's assume/hope that the provided aria-label is better than a dynamically generated one!
        // option to force an override too
        trigger.setAttribute('aria-label', triggerLabel + ': ' + tooltipTextContent.substring(0, tooltipTextContentLimit) + '...');
      }
    }
  }

  function showThisTooltip(trigger, tooltipText) {
    unsetAllTooltips();
    trigger.setAttribute('aria-expanded', 'true');
    tooltipText.removeAttribute('hidden');
  }

  function hideThisTooltip(trigger, tooltipText) {
    trigger.setAttribute('aria-expanded', 'false');
    tooltipText.setAttribute('hidden','hidden');
  }

  function unsetAllTooltips() {
    Array.from(tooltips).forEach(tooltip => {
      var trigger = tooltip.querySelector('button');
      var tooltipText = tooltip.querySelector('[role=tooltip]');
      trigger.setAttribute('aria-expanded', 'false');
      tooltipText.setAttribute('hidden', 'hidden');
    });
  }

}
doTooltips();