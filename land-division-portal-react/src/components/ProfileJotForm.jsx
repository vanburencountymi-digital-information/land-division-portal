
import React, { useEffect, useState } from 'react';

function FormComponent({ autoFillData }) {
  const initialFormState = {
    first_14: autoFillData?.first || '',
    last_14: autoFillData?.last || '', 
    input_15: autoFillData?.email || '',  
    input_16_full: autoFillData?.phone || '',
    input_96_addr_line1: autoFillData?.address_line1 || '',
    input_96_addr_line2: autoFillData?.address_line2 || '',
    input_96_city: autoFillData?.city || '',
    input_96_state: autoFillData?.state || '',
    input_96_postal: autoFillData?.zip || '',
    input_95: autoFillData?.q95_iwould || ''
  }
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [formState, setFormState] = useState(initialFormState);

  // Helper function to safely execute scripts with debugging
  const executeScripts = (scripts) => {
    scripts.forEach(script => {
      try {
        const scriptContent = script.trim();
        const existingScripts = Array.from(document.scripts);
        const scriptExists = existingScripts.some(s => 
          s.text && s.text.trim() === scriptContent
        );
        
        if (!scriptExists) {
          console.log('Executing script:', scriptContent.substring(0, 100) + '...');
          
          // Remove existing event listeners before executing script
          const elementsToClean = document.querySelectorAll(
            '.form-collapse-table, .form-pagebreak-next, .form-pagebreak-back'
          );
          elementsToClean.forEach(element => {
            const clone = element.cloneNode(true);
            element.parentNode.replaceChild(clone, element);
          });
          
          new Function(script)();
        }
      } catch (error) {
        console.error('Error executing script:', error);
      }
    });
  };

  // Load scripts and styles
  useEffect(() => {
    console.log('Initial useEffect running - loading scripts and styles');
    
    // Check if style already exists
    const existingStyle = document.querySelector('style[data-jotform-styles]');
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.textContent = "\n        @media print {\n          .form-section {\n            display: inline !important;\n          }\n          .form-pagebreak {\n            display: none !important;\n          }\n          .form-section-closed {\n            height: auto !important;\n          }\n          .page-section {\n            position: initial !important;\n          }\n        }\n      ";
      styleElement.setAttribute('data-jotform-styles', 'true');
      document.head.appendChild(styleElement);
    }

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        console.log('Loading script:', src);
        const script = document.createElement('script');
        script.src = src;
        script.setAttribute('data-jotform-script', 'true');
        script.onload = () => {
          console.log('Script loaded:', src);
          resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadScripts = async () => {
      if (scriptsLoaded) {
        console.log('Scripts already loaded, skipping...');
        return;
      }
      
      const scripts = {"urls":["https://cdn02.jotfor.ms/static/prototype.forms.js?v=3.3.60986","https://cdn03.jotfor.ms/static/jotform.forms.js?v=3.3.60986","https://cdn01.jotfor.ms/js/punycode-1.4.1.min.js?v=3.3.60986","https://cdn02.jotfor.ms/js/vendor/maskedinput_5.0.9.min.js?v=3.3.60986","https://cdn03.jotfor.ms/js/vendor/smoothscroll.min.js?v=3.3.60986","https://cdn01.jotfor.ms/js/errorNavigation.js?v=3.3.60986"],"inline":["\n          var favicon = document.querySelector('link[rel=\"shortcut icon\"]');\n          window.isDarkMode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);\n          if(favicon && window.isDarkMode) {\n              favicon.href = favicon.href.replaceAll('favicon-2021-light%402x.png', 'favicon-2021-dark%402x.png');\n          }\n      ","window.enableEventObserver=true","\tJotForm.newDefaultTheme = true;\n\tJotForm.extendsNewTheme = false;\n\tJotForm.singleProduct = false;\n\tJotForm.newPaymentUIForNewCreatedForms = true;\n\tJotForm.texts = {\"confirmEmail\":\"E-mail does not match\",\"pleaseWait\":\"Please wait...\",\"validateEmail\":\"You need to validate this e-mail\",\"confirmClearForm\":\"Are you sure you want to clear the form\",\"lessThan\":\"Your score should be less than or equal to\",\"incompleteFields\":\"There are incomplete required fields. Please complete them.\",\"required\":\"This field is required.\",\"requireOne\":\"At least one field required.\",\"requireEveryRow\":\"Every row is required.\",\"requireEveryCell\":\"Every cell is required.\",\"email\":\"Enter a valid e-mail address\",\"alphabetic\":\"This field can only contain letters\",\"numeric\":\"This field can only contain numeric values\",\"alphanumeric\":\"This field can only contain letters and numbers.\",\"cyrillic\":\"This field can only contain cyrillic characters\",\"url\":\"This field can only contain a valid URL\",\"currency\":\"This field can only contain currency values.\",\"fillMask\":\"Field value must fill mask.\",\"uploadExtensions\":\"You can only upload following files:\",\"noUploadExtensions\":\"File has no extension file type (e.g. .txt, .png, .jpeg)\",\"uploadFilesize\":\"File size cannot be bigger than:\",\"uploadFilesizemin\":\"File size cannot be smaller than:\",\"gradingScoreError\":\"Score total should only be less than or equal to\",\"inputCarretErrorA\":\"Input should not be less than the minimum value:\",\"inputCarretErrorB\":\"Input should not be greater than the maximum value:\",\"maxDigitsError\":\"The maximum digits allowed is\",\"minCharactersError\":\"The number of characters should not be less than the minimum value:\",\"maxCharactersError\":\"The number of characters should not be more than the maximum value:\",\"freeEmailError\":\"Free email accounts are not allowed\",\"minSelectionsError\":\"The minimum required number of selections is \",\"maxSelectionsError\":\"The maximum number of selections allowed is \",\"pastDatesDisallowed\":\"Date must not be in the past.\",\"dateLimited\":\"This date is unavailable.\",\"dateInvalid\":\"This date is not valid. The date format is {format}\",\"dateInvalidSeparate\":\"This date is not valid. Enter a valid {element}.\",\"ageVerificationError\":\"You must be older than {minAge} years old to submit this form.\",\"multipleFileUploads_typeError\":\"{file} has invalid extension. Only {extensions} are allowed.\",\"multipleFileUploads_sizeError\":\"{file} is too large, maximum file size is {sizeLimit}.\",\"multipleFileUploads_minSizeError\":\"{file} is too small, minimum file size is {minSizeLimit}.\",\"multipleFileUploads_emptyError\":\"{file} is empty, please select files again without it.\",\"multipleFileUploads_uploadFailed\":\"File upload failed, please remove it and upload the file again.\",\"multipleFileUploads_onLeave\":\"The files are being uploaded, if you leave now the upload will be cancelled.\",\"multipleFileUploads_fileLimitError\":\"Only {fileLimit} file uploads allowed.\",\"dragAndDropFilesHere_infoMessage\":\"Drag and drop files here\",\"chooseAFile_infoMessage\":\"Choose a file\",\"maxFileSize_infoMessage\":\"Max. file size\",\"generalError\":\"There are errors on the form. Please fix them before continuing.\",\"generalPageError\":\"There are errors on this page. Please fix them before continuing.\",\"wordLimitError\":\"Too many words. The limit is\",\"wordMinLimitError\":\"Too few words.  The minimum is\",\"characterLimitError\":\"Too many Characters.  The limit is\",\"characterMinLimitError\":\"Too few characters. The minimum is\",\"ccInvalidNumber\":\"Credit Card Number is invalid.\",\"ccInvalidCVC\":\"CVC number is invalid.\",\"ccInvalidExpireDate\":\"Expire date is invalid.\",\"ccInvalidExpireMonth\":\"Expiration month is invalid.\",\"ccInvalidExpireYear\":\"Expiration year is invalid.\",\"ccMissingDetails\":\"Please fill up the credit card details.\",\"ccMissingProduct\":\"Please select at least one product.\",\"ccMissingDonation\":\"Please enter numeric values for donation amount.\",\"disallowDecimals\":\"Please enter a whole number.\",\"restrictedDomain\":\"This domain is not allowed\",\"ccDonationMinLimitError\":\"Minimum amount is {minAmount} {currency}\",\"requiredLegend\":\"All fields marked with * are required and must be filled.\",\"geoPermissionTitle\":\"Permission Denied\",\"geoPermissionDesc\":\"Check your browser's privacy settings.\",\"geoNotAvailableTitle\":\"Position Unavailable\",\"geoNotAvailableDesc\":\"Location provider not available. Please enter the address manually.\",\"geoTimeoutTitle\":\"Timeout\",\"geoTimeoutDesc\":\"Please check your internet connection and try again.\",\"selectedTime\":\"Selected Time\",\"formerSelectedTime\":\"Former Time\",\"cancelAppointment\":\"Cancel Appointment\",\"cancelSelection\":\"Cancel Selection\",\"noSlotsAvailable\":\"No slots available\",\"slotUnavailable\":\"{time} on {date} has been selected is unavailable. Please select another slot.\",\"multipleError\":\"There are {count} errors on this page. Please correct them before moving on.\",\"oneError\":\"There is {count} error on this page. Please correct it before moving on.\",\"doneMessage\":\"Well done! All errors are fixed.\",\"invalidTime\":\"Enter a valid time\",\"doneButton\":\"Done\",\"reviewSubmitText\":\"Review and Submit\",\"nextButtonText\":\"Next\",\"prevButtonText\":\"Previous\",\"seeErrorsButton\":\"See Errors\",\"notEnoughStock\":\"Not enough stock for the current selection\",\"notEnoughStock_remainedItems\":\"Not enough stock for the current selection ({count} items left)\",\"soldOut\":\"Sold Out\",\"justSoldOut\":\"Just Sold Out\",\"selectionSoldOut\":\"Selection Sold Out\",\"subProductItemsLeft\":\"({count} items left)\",\"startButtonText\":\"START\",\"submitButtonText\":\"Submit\",\"submissionLimit\":\"Sorry! Only one entry is allowed. <br> Multiple submissions are disabled for this form.\",\"reviewBackText\":\"Back to Form\",\"seeAllText\":\"See All\",\"progressMiddleText\":\"of\",\"fieldError\":\"field has an error.\",\"error\":\"Error\"};\n\tJotForm.newPaymentUI = true;\n\tJotForm.originalLanguage = \"en\";\n\tJotForm.isFormViewTrackingAllowed = true;\n\tJotForm.replaceTagTest = true;\n\tJotForm.uploadServerURL = \"https://upload.jotform.com/upload\";\n\tJotForm.clearFieldOnHide=\"disable\";\n\tJotForm.submitError=\"jumpToFirstError\";\n\n\tJotForm.init(function(){\n\t/*INIT-START*/\n      JotForm.setPhoneMaskingValidator( 'input_5_full', '\\u0028\\u0023\\u0023\\u0023\\u0029 \\u0023\\u0023\\u0023\\u002d\\u0023\\u0023\\u0023\\u0023' );\n      JotForm.alterTexts({\"ageVerificationError\":\"You must be older than {minAge} years old to submit this form.\",\"alphabetic\":\"This field can only contain letters\",\"alphanumeric\":\"This field can only contain letters and numbers.\",\"cancelAppointment\":\"Cancel Appointment\",\"cancelSelection\":\"Cancel Selection\",\"ccDonationMinLimitError\":\"Minimum amount is {minAmount} {currency}\",\"ccInvalidCVC\":\"CVC number is invalid.\",\"ccInvalidExpireDate\":\"Expire date is invalid.\",\"ccInvalidExpireMonth\":\"Expiration month is invalid.\",\"ccInvalidExpireYear\":\"Expiration year is invalid.\",\"ccInvalidNumber\":\"Credit Card Number is invalid.\",\"ccMissingDetails\":\"Please fill up the credit card details.\",\"ccMissingDonation\":\"Please enter numeric values for donation amount.\",\"ccMissingProduct\":\"Please select at least one product.\",\"characterLimitError\":\"Too many Characters.  The limit is\",\"characterMinLimitError\":\"Too few characters. The minimum is\",\"chooseAFile_infoMessage\":\"Choose a file\",\"confirmClearForm\":\"Are you sure you want to clear the form\",\"confirmEmail\":\"E-mail does not match\",\"currency\":\"This field can only contain currency values.\",\"cyrillic\":\"This field can only contain cyrillic characters\",\"dateInvalid\":\"This date is not valid. The date format is {format}\",\"dateInvalidSeparate\":\"This date is not valid. Enter a valid {element}.\",\"dateLimited\":\"This date is unavailable.\",\"disallowDecimals\":\"Please enter a whole number.\",\"doneButton\":\"Done\",\"doneMessage\":\"Well done! All errors are fixed.\",\"dragAndDropFilesHere_infoMessage\":\"Drag and drop files here\",\"email\":\"Enter a valid e-mail address\",\"error\":\"Error\",\"fieldError\":\"field has an error.\",\"fillMask\":\"Field value must fill mask.\",\"formerSelectedTime\":\"Former Time\",\"freeEmailError\":\"Free email accounts are not allowed\",\"generalError\":\"There are errors on the form. Please fix them before continuing.\",\"generalPageError\":\"There are errors on this page. Please fix them before continuing.\",\"geoNotAvailableDesc\":\"Location provider not available. Please enter the address manually.\",\"geoNotAvailableTitle\":\"Position Unavailable\",\"geoPermissionDesc\":\"Check your browser's privacy settings.\",\"geoPermissionTitle\":\"Permission Denied\",\"geoTimeoutDesc\":\"Please check your internet connection and try again.\",\"geoTimeoutTitle\":\"Timeout\",\"gradingScoreError\":\"Score total should only be less than or equal to\",\"incompleteFields\":\"There are incomplete required fields. Please complete them.\",\"inputCarretErrorA\":\"Input should not be less than the minimum value:\",\"inputCarretErrorB\":\"Input should not be greater than the maximum value:\",\"invalidTime\":\"Enter a valid time\",\"justSoldOut\":\"Just Sold Out\",\"lessThan\":\"Your score should be less than or equal to\",\"maxCharactersError\":\"The number of characters should not be more than the maximum value:\",\"maxDigitsError\":\"The maximum digits allowed is\",\"maxFileSize_infoMessage\":\"Max. file size\",\"maxSelectionsError\":\"The maximum number of selections allowed is \",\"minCharactersError\":\"The number of characters should not be less than the minimum value:\",\"minSelectionsError\":\"The minimum required number of selections is \",\"multipleError\":\"There are {count} errors on this page. Please correct them before moving on.\",\"multipleFileUploads_emptyError\":\"{file} is empty, please select files again without it.\",\"multipleFileUploads_fileLimitError\":\"Only {fileLimit} file uploads allowed.\",\"multipleFileUploads_minSizeError\":\"{file} is too small, minimum file size is {minSizeLimit}.\",\"multipleFileUploads_onLeave\":\"The files are being uploaded, if you leave now the upload will be cancelled.\",\"multipleFileUploads_sizeError\":\"{file} is too large, maximum file size is {sizeLimit}.\",\"multipleFileUploads_typeError\":\"{file} has invalid extension. Only {extensions} are allowed.\",\"multipleFileUploads_uploadFailed\":\"File upload failed, please remove it and upload the file again.\",\"nextButtonText\":\"Next\",\"noSlotsAvailable\":\"No slots available\",\"notEnoughStock\":\"Not enough stock for the current selection\",\"notEnoughStock_remainedItems\":\"Not enough stock for the current selection ({count} items left)\",\"noUploadExtensions\":\"File has no extension file type (e.g. .txt, .png, .jpeg)\",\"numeric\":\"This field can only contain numeric values\",\"oneError\":\"There is {count} error on this page. Please correct it before moving on.\",\"pastDatesDisallowed\":\"Date must not be in the past.\",\"pleaseWait\":\"Please wait...\",\"prevButtonText\":\"Previous\",\"progressMiddleText\":\"of\",\"required\":\"This field is required.\",\"requiredLegend\":\"All fields marked with * are required and must be filled.\",\"requireEveryCell\":\"Every cell is required.\",\"requireEveryRow\":\"Every row is required.\",\"requireOne\":\"At least one field required.\",\"restrictedDomain\":\"This domain is not allowed\",\"reviewBackText\":\"Back to Form\",\"reviewSubmitText\":\"Review and Submit\",\"seeAllText\":\"See All\",\"seeErrorsButton\":\"See Errors\",\"selectedTime\":\"Selected Time\",\"selectionSoldOut\":\"Selection Sold Out\",\"slotUnavailable\":\"{time} on {date} has been selected is unavailable. Please select another slot.\",\"soldOut\":\"Sold Out\",\"startButtonText\":\"START\",\"submissionLimit\":\"Sorry! Only one entry is allowed. &lt;br&gt; Multiple submissions are disabled for this form.\",\"submitButtonText\":\"Submit\",\"subProductItemsLeft\":\"({count} items left)\",\"uploadExtensions\":\"You can only upload following files:\",\"uploadFilesize\":\"File size cannot be bigger than:\",\"uploadFilesizemin\":\"File size cannot be smaller than:\",\"url\":\"This field can only contain a valid URL\",\"validateEmail\":\"You need to validate this e-mail\",\"wordLimitError\":\"Too many words. The limit is\",\"wordMinLimitError\":\"Too few words.  The minimum is\"});\n\t/*INIT-END*/\n\t});\n\n   setTimeout(function() {\nJotForm.paymentExtrasOnTheFly([null,{\"name\":\"heading\",\"qid\":\"1\",\"text\":\"Land Management Profile Information\",\"type\":\"control_head\"},{\"name\":\"submit2\",\"qid\":\"2\",\"text\":\"Submit\",\"type\":\"control_button\"},{\"description\":\"\",\"name\":\"name\",\"qid\":\"3\",\"text\":\"Name\",\"type\":\"control_fullname\"},{\"description\":\"\",\"name\":\"email\",\"qid\":\"4\",\"subLabel\":\"example@example.com\",\"text\":\"Email\",\"type\":\"control_email\"},{\"description\":\"\",\"name\":\"phoneNumber\",\"qid\":\"5\",\"text\":\"Phone Number\",\"type\":\"control_phone\"},{\"description\":\"\",\"name\":\"address\",\"qid\":\"6\",\"text\":\"Address\",\"type\":\"control_address\"}]);}, 20); \n","\n    JotForm.showJotFormPowered = \"0\";\n  ","\n    JotForm.poweredByText = \"Powered by Jotform\";\n  ","\n    var all_spc = document.querySelectorAll(\"form[id='250414469698065'] .si\" + \"mple\" + \"_spc\");\n    for (var i = 0; i < all_spc.length; i++)\n    {\n      all_spc[i].value = \"250414469698065-250414469698065\";\n    }\n  ","JotForm.ownerView=true;","JotForm.isNewSACL=true;"]};
      
      // First load all external scripts
      for (const scriptUrl of scripts.urls) {
        await loadScript(scriptUrl);
      }

      // Remove any existing event listeners before executing inline scripts
      const elementsToClean = document.querySelectorAll(
        '.form-collapse-table, .form-pagebreak-next, .form-pagebreak-back'
      );
      elementsToClean.forEach(element => {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
      });

      // Then execute inline scripts in isolated scope
      executeScripts(scripts.inline);

      console.log('All scripts loaded and executed');
      setScriptsLoaded(true);
    };

    loadScripts();

    return () => {
      console.log('Cleanup running...');
      
      // Remove event listeners by cloning elements
      const elementsToClean = document.querySelectorAll(
        '.form-collapse-table, .form-pagebreak-next, .form-pagebreak-back'
      );
      elementsToClean.forEach(element => {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
      });

      // Remove scripts and styles we added
      const scripts = document.querySelectorAll('script[data-jotform-script]');
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      
      const styles = document.querySelectorAll('style[data-jotform-styles]');
      styles.forEach(style => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (autoFillData) {
      setFormState(prevState => ({
        ...prevState,
        first_14: autoFillData?.first || '',
        last_14: autoFillData?.last || '',
        input_15: autoFillData?.email || '',
        input_16_full: autoFillData?.phone || '',
        input_96_addr_line1: autoFillData?.address_line1 || '',
        input_96_addr_line2: autoFillData?.address_line2 || '',
        input_96_city: autoFillData?.city || '',
        input_96_state: autoFillData?.state || '',
        input_96_postal: autoFillData?.zip || '',
        input_95: autoFillData?.q95_iwould || ''
      }));
    }
  }, [autoFillData]);
  return (
    <form className="jotform-form" onsubmit="return typeof testSubmitFunction !== 'undefined' && testSubmitFunction();" action="https://submit.jotform.com/submit/250414469698065" method="post" name="form_250414469698065" id="250414469698065" acceptCharset="utf-8" autoComplete="on"><input type="hidden" name="formID" value="250414469698065" /><input type="hidden" id="JWTContainer"  value={formState['JWTContainer'] || ''} onChange={(e) => setFormState({ ...formState, 'JWTContainer': e.target.value })} /><input type="hidden" id="cardinalOrderNumber"  value={formState['cardinalOrderNumber'] || ''} onChange={(e) => setFormState({ ...formState, 'cardinalOrderNumber': e.target.value })} /><input type="hidden" id="jsExecutionTracker" name="jsExecutionTracker" value="build-date-1739474652144"  value={formState['jsExecutionTracker'] || ''} onChange={(e) => setFormState({ ...formState, 'jsExecutionTracker': e.target.value })} /><input type="hidden" id="submitSource" name="submitSource" value="unknown"  value={formState['submitSource'] || ''} onChange={(e) => setFormState({ ...formState, 'submitSource': e.target.value })} /><input type="hidden" id="buildDate" name="buildDate" value="1739474652144"  value={formState['buildDate'] || ''} onChange={(e) => setFormState({ ...formState, 'buildDate': e.target.value })} /><input type="hidden" name="uploadServerUrl" value="https://upload.jotform.com/upload" /><input type="hidden" name="eventObserver" value="1" /><div role="main" className="form-all"><ul className="form-section page-section" role="presentation"><li id="cid_1" className="form-input-wide" data-type="control_head"><div className="form-header-group  header-large"><div className="header-text httal htvam"><h1 id="header_1" className="form-header" data-component="header">Land Management Profile Information</h1></div></div></li><li className="form-line jf-required" data-type="control_fullname" id="id_3"><label className="form-label form-label-top form-label-auto" id="label_3" htmlFor="first_3" aria-hidden="false">Name<span className="form-required">*</span></label><div id="cid_3" className="form-input-wide jf-required" data-layout="full"><div data-wrapper-react="true"><span className="form-sub-label-container" style={{"verticalAlign":"top"}} data-input-type="first"><input type="text" id="first_3" name="q3_name[first]" className="form-textbox validate[required]" autoComplete="section-input_3 given-name" size="10" data-component="first" aria-labelledby="label_3 sublabel_3_first"  value={formState['first_3'] || ''} onChange={(e) => setFormState({ ...formState, 'first_3': e.target.value })} /><label className="form-sub-label" htmlFor="first_3" id="sublabel_3_first" style={{"minHeight":"13px"}}>First Name</label></span><span className="form-sub-label-container" style={{"verticalAlign":"top"}} data-input-type="last"><input type="text" id="last_3" name="q3_name[last]" className="form-textbox validate[required]" autoComplete="section-input_3 family-name" size="15" data-component="last" aria-labelledby="label_3 sublabel_3_last"  value={formState['last_3'] || ''} onChange={(e) => setFormState({ ...formState, 'last_3': e.target.value })} /><label className="form-sub-label" htmlFor="last_3" id="sublabel_3_last" style={{"minHeight":"13px"}}>Last Name</label></span></div></div></li><li className="form-line" data-type="control_address" id="id_6" data-compound-hint=",,,,Please Select,,Please Select,"><label className="form-label form-label-top form-label-auto" id="label_6" htmlFor="input_6_addr_line1" aria-hidden="false">Address</label><div id="cid_6" className="form-input-wide" data-layout="full"><div className="form-address-table jsTest-addressField"><div className="form-address-line-wrapper jsTest-address-line-wrapperField"><span className="form-address-line form-address-street-line jsTest-address-lineField"><span className="form-sub-label-container" style={{"verticalAlign":"top"}}><input type="text" id="input_6_addr_line1" name="q6_address[addr_line1]" className="form-textbox form-address-line" autoComplete="section-input_6 address-line1" data-component="address_line_1" aria-labelledby="label_6 sublabel_6_addr_line1"  value={formState['input_6_addr_line1'] || ''} onChange={(e) => setFormState({ ...formState, 'input_6_addr_line1': e.target.value })} /><label className="form-sub-label" htmlFor="input_6_addr_line1" id="sublabel_6_addr_line1" style={{"minHeight":"13px"}}>Street Address</label></span></span></div><div className="form-address-line-wrapper jsTest-address-line-wrapperField"><span className="form-address-line form-address-street-line jsTest-address-lineField"><span className="form-sub-label-container" style={{"verticalAlign":"top"}}><input type="text" id="input_6_addr_line2" name="q6_address[addr_line2]" className="form-textbox form-address-line" autoComplete="section-input_6 address-line2" data-component="address_line_2" aria-labelledby="label_6 sublabel_6_addr_line2"  value={formState['input_6_addr_line2'] || ''} onChange={(e) => setFormState({ ...formState, 'input_6_addr_line2': e.target.value })} /><label className="form-sub-label" htmlFor="input_6_addr_line2" id="sublabel_6_addr_line2" style={{"minHeight":"13px"}}>Street Address Line 2</label></span></span></div><div className="form-address-line-wrapper jsTest-address-line-wrapperField"><span className="form-address-line form-address-city-line jsTest-address-lineField "><span className="form-sub-label-container" style={{"verticalAlign":"top"}}><input type="text" id="input_6_city" name="q6_address[city]" className="form-textbox form-address-city" autoComplete="section-input_6 address-level2" data-component="city" aria-labelledby="label_6 sublabel_6_city"  value={formState['input_6_city'] || ''} onChange={(e) => setFormState({ ...formState, 'input_6_city': e.target.value })} /><label className="form-sub-label" htmlFor="input_6_city" id="sublabel_6_city" style={{"minHeight":"13px"}}>City</label></span></span><span className="form-address-line form-address-state-line jsTest-address-lineField "><span className="form-sub-label-container" style={{"verticalAlign":"top"}}><input type="text" id="input_6_state" name="q6_address[state]" className="form-textbox form-address-state" autoComplete="section-input_6 address-level1" data-component="state" aria-labelledby="label_6 sublabel_6_state"  value={formState['input_6_state'] || ''} onChange={(e) => setFormState({ ...formState, 'input_6_state': e.target.value })} /><label className="form-sub-label" htmlFor="input_6_state" id="sublabel_6_state" style={{"minHeight":"13px"}}>State / Province</label></span></span></div><div className="form-address-line-wrapper jsTest-address-line-wrapperField"><span className="form-address-line form-address-zip-line jsTest-address-lineField "><span className="form-sub-label-container" style={{"verticalAlign":"top"}}><input type="text" id="input_6_postal" name="q6_address[postal]" className="form-textbox form-address-postal" autoComplete="section-input_6 postal-code" data-component="zip" aria-labelledby="label_6 sublabel_6_postal"  value={formState['input_6_postal'] || ''} onChange={(e) => setFormState({ ...formState, 'input_6_postal': e.target.value })} /><label className="form-sub-label" htmlFor="input_6_postal" id="sublabel_6_postal" style={{"minHeight":"13px"}}>Postal / Zip Code</label></span></span></div></div></div></li><li className="form-line" data-type="control_email" id="id_4"><label className="form-label form-label-top form-label-auto" id="label_4" htmlFor="input_4" aria-hidden="false">Email</label><div id="cid_4" className="form-input-wide" data-layout="half"><span className="form-sub-label-container" style={{"verticalAlign":"top"}}><input type="email" id="input_4" name="q4_email" className="form-textbox validate[Email]" autoComplete="section-input_4 email" style={{"width":"310px"}} size="310" data-component="email" aria-labelledby="label_4 sublabel_input_4"  value={formState['input_4'] || ''} onChange={(e) => setFormState({ ...formState, 'input_4': e.target.value })} /><label className="form-sub-label" htmlFor="input_4" id="sublabel_input_4" style={{"minHeight":"13px"}}>example@example.com</label></span></div></li><li className="form-line" data-type="control_phone" id="id_5"><label className="form-label form-label-top form-label-auto" id="label_5" htmlFor="input_5_full">Phone Number</label><div id="cid_5" className="form-input-wide" data-layout="half"><span className="form-sub-label-container" style={{"verticalAlign":"top"}}><input type="tel" id="input_5_full" name="q5_phoneNumber[full]" data-type="mask-number" className="mask-phone-number form-textbox validate[Fill Mask]" autoComplete="section-input_5 tel-national" style={{"width":"310px"}} data-masked="true" placeholder="(000) 000-0000" data-component="phone" aria-labelledby="label_5 sublabel_5_masked"  value={formState['input_5_full'] || ''} onChange={(e) => setFormState({ ...formState, 'input_5_full': e.target.value })} /><label className="form-sub-label" htmlFor="input_5_full" id="sublabel_5_masked" style={{"minHeight":"13px"}}>Please enter a valid phone number.</label></span></div></li><li className="form-line" data-type="control_button" id="id_2"><div id="cid_2" className="form-input-wide" data-layout="full"><div data-align="auto" className="form-buttons-wrapper form-buttons-auto   jsTest-button-wrapperField"><button id="input_2" type="submit" className="form-submit-button submit-button jf-form-buttons jsTest-submitField legacy-submit" data-component="button">Submit</button></div></div></li><li style={{"display":"none"}}>Should be Empty:<input type="text" name="website" /></li></ul></div><input type="hidden" className="simple_spc" id="simple_spc" name="simple_spc" value="250414469698065"  value={formState['simple_spc'] || ''} onChange={(e) => setFormState({ ...formState, 'simple_spc': e.target.value })} /></form>
  );
}

export default FormComponent;
