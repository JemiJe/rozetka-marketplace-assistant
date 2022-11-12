// ==UserScript==
// @name         splitter assistant v0.9 (01.2022)
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  speed up your routine
// @author       You
// @match        file:///*
// @match        http://splitter.staging.com.ua/*
// @match        https://admin-splitter.rozetka.company/*
// @icon         none
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // splitter assistant v0.9 (01.2022)
  // all functions will have prefix ast
  // you should put styles into stylus (browser extension)
  
  // Main script
  //-------------------------------------------------------------------------------------------------
  // Main init
  window.astStorageObj = {};
  let astUI = astUIInit();
  astBeautifyInit();
  astSaveDeniedIDsInit();

  // checking localStorage and initial options
  astStorageAndOptionsInit();

  // cheking exists cycle and events
  if ( location.href.includes('request/view') ) {
    astCheckStateElemCycle( $( '#input-52' )[0] );
    $( window ).on( 'astCheckStateElemCycle:astElemExists', function() {
      astUI_TaskNumRefresh();
    });
  }

  // Main operations
  let fillerIsOn = {on: false};
  document.addEventListener('click', (e) => {

    // UI common
    if ($(e.target).hasClass('astInfoDropdownBtn')) {
      let nextElem = $(e.target).next();
      if ( nextElem.hasClass('astInfoDropdown') ) nextElem.toggleClass('astUIHide');
    }

    //window status
    if ( $(e.target).hasClass('astBtnDropdown')) {
      $('.astDropdown').toggleClass('astUIHide');
    }
    if ( $(e.target).hasClass('astBtnHideStatus') || $(e.target).parent().hasClass('astBtnHideStatus') ) {
      $('.astWindowWrapper').toggleClass('astUIHide');
    }

    //window status dropdown
    if ($(e.target).hasClass('astBtnFillerReload')) {
      if(!$('.astFiller')[0]) astUIInit_fillerUIinit();
    }
    if ($(e.target).hasClass('astBtnHideDel')) {
      let mode = '';
      if($('#astCheckDeleteDel')[0].checked) mode += '_delete';
      
      astStyle_changeDelElem(mode);
    }
    if ($(e.target).hasClass('astBtnAnalyzer')) {

      let mode;
      if($('#astAnalyzerHalfWord')[0].checked) mode = 'halfWord';
      if($('#astAnalyzerWrongLetters')[0].checked) mode += 'wrongLetters';
      if($('#astAnalyzerBySpacesToo')[0].checked) mode += 'bySpacesToo';

      if($('#astAnalyzerParamsListInput')[0].value) {
        let paramArr = $('#astAnalyzerParamsListInput')[0].value.split(',');
        astItemAnalyser(paramArr, mode);
      } else {
        astItemAnalyser([], mode);
      }
    }
    if ($(e.target).hasClass('astGetIDs')) {

      if ($('#astGetIDOnlyDeclineCheckbox')[0].checked) {
        $('#astGetIDsTextarea')[0].value = astGetIdsString(0, 'onlyDecline');

      } else {
        $('#astGetIDsTextarea')[0].value = astGetIdsString(1);
      }
    }
    if ($(e.target).hasClass('astGetDeniedIDsFromStorage')) {
      $('#astGetIDsTextarea')[0].value = astSaveDeniedIDsInit('get');
    }
    if ($(e.target).hasClass('astGetDeniedIDsClear')) {
      astSaveDeniedIDsInit('clearStorage');
    }

    //filler
    if ($(e.target).hasClass('astBtnFillerOne')) {
      astFiller(fillerIsOn, 'oneValue');
    }
    if ($(e.target).hasClass('astBtnFillerMulti')) {

      let matchMode;
      if ($('#astFillerHalfWord')[0].checked) matchMode = '_basicMultiHalfWord';

      astFiller(fillerIsOn, 'multiValues', matchMode);

    }
    if ($(e.target).hasClass('astBtnFillerMultiEachWord')) {

      let matchMode = 'basicMultiExact';
      let fillerMode = 'eachWordBySeparator';
      let customSep = $('#astBtnFillerMultiEachWord_customSep')[0].value;
      if ($('#astFillerBetweenSeparator')[0].checked) fillerMode += '_partBetweenSeparator';
      if ( customSep ) fillerMode += '_customSeparator';
      if ($('#astFillerMultiExactNotExact')[0].checked) matchMode += '_notExact';

      astFiller(fillerIsOn, 'multiValues', matchMode, fillerMode, customSep);

    }
    if ($(e.target).hasClass('astBtnFillerDivide')) {
      if($('#astBtnFillerDivideInput')[0].value) {
        astChangeInputs('astFillerDivideNum', $('#astBtnFillerDivideInput')[0].value);
      } else {
        astChangeInputs('astFillerDivideNum', '');
      } 
    }
    if ($(e.target).hasClass('astBtnFillerRemoveUnit')) {
      astChangeInputs('removeUnit');
    }
    if ($(e.target).hasClass('astBtnFillerTakeAfter')) {
      astChangeInputs('takeAfter');
    }
    if ($(e.target).hasClass('astBtnFillerReset')) {
      astChangeInputs('reset');
    }
    if ($(e.target).hasClass('astBtnFillerReplaceChar')) {

      let charFrom = $('#astBtnFillerReplaceCharFrom')[0].value || '';
      let charTo = $('#astBtnFillerReplaceCharTo')[0].value || '';

      astChangeInputs('replaceChar', charFrom, charTo);
    }
    if ($(e.target).hasClass('astBtnFillerReplaceCharMacros')) {
      let charsList = $('#astFillerReplaceCharMacrosInput')[0].value;
      astChangeInputs('replaceCharMacros', charsList);
    }
    if ($(e.target).hasClass('astBtnFillerReplaceCharMacrosSave')) {
      let charsList = $('#astFillerReplaceCharMacrosInput')[0].value;

      let macrosName = '';
      let macrosStr = charsList;
      
      if ( charsList.includes('@@') ) {
        macrosName = charsList.split('@@')[0];
        macrosStr = charsList.split('@@')[1];
      }

      astFiller_DatalistReplaceCharMacros_Init('save', macrosStr, macrosName)
    }

    // filler other features
    if ($(e.target).hasClass('astBtnAutopaginationStart')) {
      
      let mode = 'start';
      let timerStep = $('#astBtnAutopaginationTimerStep')[0].value;

      if ($('#astAutopaginationCheckCondition')[0].checked) mode += '_condition';

      $('#bind-values-button-no-close').click(); // save values
      setTimeout(() => {
        astPaginationAutoModal(mode, timerStep);
      }, 500);
    }
    if ($(e.target).hasClass('astBtnAutopaginationStop')) {
      
      let mode = 'stop';
      astPaginationAutoModal(mode);
    }

  });

  // Functions
  //-------------------------------------------------------------------------------------------------

  // Filler -------------------------------------------------
  function astFiller (statusVar, mode, matchMode, fillerMode, customSep) { // mode - [switch] for one value or several

    if (!statusVar.on) {
      statusVar.on = true;
    } else if (statusVar.on) {
      return false;
    }

    let popupForm = $('.form-group.attr-values-comparison');
    let selectElem = $('.form-control.select2.select2-hidden-accessible').not('[disabled="disabled"]').first();
    let optionsListCache;

    let astFillerMainFunc = function() {
      optionsListCache = $('.form-control.select2.select2-hidden-accessible option'); //text + value
      $('.astFillerOptionsAmount')[0].textContent = optionsListCache.length || `¯\\\_(ツ)_/¯`;

      switch (mode) {

        case 'oneValue':
          astFillOneValue(popupForm, optionsListCache);
          break;

        case 'multiValues':
          astFillMultiValues(popupForm, optionsListCache, matchMode, fillerMode, customSep);
          break;
      }

      setTimeout(() => {
        selectElem.first().select2('close');
      }, 100);
      
      statusVar.on = false;
    };
    

    if (popupForm && !optionsListCache) {
      selectElem.first().select2('open');
      setTimeout(() => {
        astFillerMainFunc();
      }, 100);
    } else {
      console.error(`ASSISTANT: error in astFillerInit ${popupForm} empty or ${optionsListCache} already exist`);
      return false;
    }   
  }

  function astFillOneValue(popupForm, optionsListCache) {
    
    if (popupForm && optionsListCache) {

      let formRows = $('.form-group.attr-values-comparison .row.form-group');

      for (let row of formRows) {
        if($(row).find('[aria-disabled="true"]').length >= 1) {
          continue;
        } else if ($(row).find('select').select2('data')[0].text !== 'Не привязан') {
          continue;
        }
        
        $(row).find('.clear_button.btn.btn-primary').click(); //try to avoid empty selected bug

        let word = row.querySelector('input').value;
        let matchResult = astMatch(word, optionsListCache, 'basic');

        if(matchResult) {
          let elemSelect = $(row).find('select');
          elemSelect.val(matchResult.value);
          elemSelect.trigger('change');
          elemSelect.parent().addClass('astBorderDone');

          continue;

        } else if (!matchResult) {
          let checkbox = $(row).find('select').parents('.row.form-group').find('input[type="checkbox"]');
          checkbox.click();
          continue;

        } else {
          continue;
        }
      }

    } else if (!popupForm || !optionsListCache) {
      console.error('ASSISTANT: окно с параметрами/список значений не найдены');
    }
  }

  function astFillMultiValues(popupForm, optionsListCache, matchMode, fillerMode, customSep) {
    
    if (popupForm && optionsListCache) {

      let formRows = $('.form-group.attr-values-comparison .row.form-group');
  
      for (let row of formRows) {  
  
        if($(row).find('[aria-disabled="true"]').length >= 1) {
          continue;
        } else if ($(row).find('select').select2('data')[0].text !== 'Не привязан') {
          continue;
        }
        
        $(row).find('.clear_button.btn.btn-primary').click(); //try to avoid empty selected bug
  
        let words;
        if ($(row).find('textarea')[0]) {
          let textarea = $(row).find('textarea')[0];
          words = textarea.value.replace('\n', '');
  
        } else if($(row).find('input')[0]) {
          let input = $(row).find('input')[0];
          words = input.value.replace('\n', '');
  
        } else {
          console.error('ASSISTANT: элемент со значениями не textarea и не input');
          return false;
        }
        
        let option = matchMode || 'basicMulti';

        let matchResults = [];
        
        if ( fillerMode && fillerMode.includes('eachWordBySeparator') ) {

          let wordsArr;

          if ( fillerMode.includes('partBetweenSeparator') ) {
            words = astFiller_takeBetweenSeparator2(words);
            wordsArr = words.split(' '); // fixing string after astFiller_takeBetweenSeparator2

          } 
          else if ( fillerMode.includes('customSeparator') && !fillerMode.includes('partBetweenSeparator')) {
            let customExp = customSep;
            let reg = new RegExp(`[${customExp}]+`,"gi");
            wordsArr = words.split(reg);
          }
          else {
            wordsArr = words.split(/[,;|]+/gi);
          }
          
          wordsArr = astTrimStringsInArr(wordsArr);
          if ($.isArray(wordsArr)) wordsArr = astUnique(wordsArr);

          if (!$.isArray(wordsArr)) {
            let tempArr = [];
            tempArr.push(wordsArr);
            wordsArr = tempArr;
          }

          $(wordsArr).each(function(i,e) {
            let matchResult = astMatch(e, optionsListCache, option);
            matchResults = matchResults.concat(matchResult);
          });

        } else {

          if ( fillerMode && fillerMode.includes('eachWordBySeparator') ) {
            words = astFiller_takeBetweenSeparator2(words);
          }

          matchResults = astMatch(words, optionsListCache, option);
        }  
        
        let newmatchResults = astUnique(matchResults);
        if(newmatchResults[0]) {
  
          let elemSelect = $(row).find('select');
          elemSelect.val(newmatchResults);
          elemSelect.trigger('change');
          elemSelect.parent().addClass('astBorderDone');
  
          continue;
  
        } else if (newmatchResults.length == 0) {
          let checkbox = $(row).find('select').parents('.row.form-group').find('input[type="checkbox"]');
          checkbox.click();
          continue;
  
        } else {
          continue;
        }
      }
  
    } else if (!popupForm || !optionsListCache) {
      console.error('ASSISTANT: окно с параметрами/список значений не найдены');
    }
  }

  function astFiller_takeBetweenSeparator2(string, separator1) {

    let sepExp = ',;|'; //let sepExp = ',;|\\.';
    if (separator1) sepExp += separator1;
    let reg1 = new RegExp(`[${sepExp}]`,"gi");
    let sep1 = reg1; // for instance: 'Серый: Темно-серый, Черный'

    let newStrArr1 = string.split(sep1); // ','
    
    let tempArr = [];
    if (newStrArr1.length > 1) { // Серый: Темно-серый
      $(newStrArr1).each(function (i, e) {
        let newStr = e.match(/:.+/gi); // ':' //.match(/:[^,.;|]+/gi) for other cases

        if(newStr) {
          tempArr.push(newStr[0].split(':')[1]);
        } else {
          tempArr.push(newStr);
        }
      });
      
      return tempArr.join(''); // 'Темно-серый Черный'

    } else {

      let newStr = newStrArr1[0].match(/:.+/gi);
      if (newStr) {
        return newStr[0].split(':')[1];
      } else {
        return newStrArr1[0];
      }
    }

  }

  function astMatch(word, optionsList, mode) { // [word](or several words)(string) which you wanna find in [optionsList](object) and [mode] of matching
    
    let wordLowerCase = word.toLowerCase().replace( /ё/gi, 'е' );
    let basicMultiWordsArray = [];

    for (let i = 0; i < optionsList.length; i++) {

      let wordYouNeed = optionsList[i].text.toLowerCase().split(' (id')[0]; // removes (id....) in text
      let wordPercent;
      switch (mode) {
        case 'basic': // return only one <option> element         
          if (wordYouNeed == wordLowerCase) {
            return optionsList[i];

          } else if (i == optionsList.length - 1) {
            return false;
          }
          break;

        case 'basicMulti': // return array on <option>.values        
          if (wordLowerCase.includes(wordYouNeed) || wordYouNeed.includes(wordLowerCase)) {
            if($.inArray(optionsList[i].value, basicMultiWordsArray) > -1) {
              continue;
            } else {
              basicMultiWordsArray.push(optionsList[i].value);
            }      
          }
          break;

        case '_basicMultiHalfWord':
        wordPercent = localStorage.getItem('astFillerOptionHalfWordInput');
        if (wordYouNeed.length >= 6) {
          wordYouNeed = astGetHalfString(wordYouNeed, wordPercent);
          wordLowerCase = astGetHalfString(wordLowerCase, wordPercent);
        }

        if (wordLowerCase.includes(wordYouNeed) || wordYouNeed.includes(wordLowerCase)) {
          if($.inArray(optionsList[i].value, basicMultiWordsArray) > -1) {
            continue;
          } else {
            basicMultiWordsArray.push(optionsList[i].value);
          }      
        }
        break;

        case 'basicMultiExact':
        case 'basicMultiExact_notExact':
        case 'basicMultiExact_basicMultiHalfWord': // unuseful, for now at least

        if ( mode == 'basicMultiExact_basicMultiHalfWord' ) {
          wordPercent = localStorage.getItem('astFillerOptionHalfWordInput');
          if (wordYouNeed.length >= 6) {
            wordYouNeed = astGetHalfString(wordYouNeed, wordPercent);
            wordLowerCase = astGetHalfString(wordLowerCase, wordPercent);
          }

          if (wordLowerCase.includes(wordYouNeed) || wordYouNeed.includes(wordLowerCase)) {

            if($.inArray(optionsList[i].value, basicMultiWordsArray) > -1) {
              continue;
            } else {
              basicMultiWordsArray.push(optionsList[i].value);
            }      
          }
          break;

        }

        if ( mode == 'basicMultiExact_notExact' ) {

          if ( wordLowerCase.includes(wordYouNeed) || wordYouNeed.includes(wordLowerCase) ) {

            if($.inArray(optionsList[i].value, basicMultiWordsArray) > -1) {
              continue;
            } else {
              basicMultiWordsArray.push(optionsList[i].value);
            }      
          }
          break;
        }

        if ( mode !== 'basicMultiExact_notExact' && wordLowerCase == wordYouNeed ) { //there was  wordLowerCase.includes(wordYouNeed) || wordYouNeed.includes(wordLowerCase)
          if($.inArray(optionsList[i].value, basicMultiWordsArray) > -1) {
            continue;
          } else {
            basicMultiWordsArray.push(optionsList[i].value);
          }      
        }
        break;
      }
    }

    return basicMultiWordsArray;
  } 

  // Analyser--------------------------------------------------------
  function astItemAnalyser(paramsList, option) {
    
    let defaultParams = ['Размер', 'Цвет', 'Основной цвет', 'Рост', 'Объем', 'Вес', /*'Количество в упаковке',*/
                         'Диаметр', 'Профиль', 'Длина', 'Марка автомобиля', 'Модель автомобиля', 'Диаметр колес', 
                         'Размер корпуса', 'Комплектация', 'Оттенок',/* 'Материал',*/ 'Мощность', 'мощность',
                         'Габариты (ВхШхГ)', 'Высота', 'Ширина', 'Глубина', 'Цвет плафона',
                         'Видеокарта', 'Процессор', 'Объем оперативной памяти', 'Объем HDD', 'Объем SSD', /*'Частота ядра',*/
                         'Объем видеопамяти', /*'Количество ядер процессора',*/ 'Графический чип',
                         'Цветовая температура', 'Совместимый бренд', 'Совместимая модель',
                         'Фасовка', 'Кратность', 'Номинальная отключающая способность', 'Номинальный ток',
                         'Кривая отключения', 'Количество полюсов', 'Класс защиты'];
    let paramArr;

    if(paramsList.length > 0) {
      paramArr = astUnique(defaultParams.concat(paramsList));
    } else {
      paramArr = defaultParams;
    }
    
    if ($('.kv-expand-detail-row')[0]) {

      $('.kv-expand-detail-row').each(function() { //.css( "text-decoration", "underline" )
        
        let paramsRow;
        let itemName;
        let itemDescription;
        let iframe = $(this).find('iframe')[0];

        
        if( window.location.href.includes('items/changes') ) {
          paramsRow = $(this).find(`th:contains('Параметры')`).first().parent();
          itemName = $(this).find(`th:contains('Название')`).first().next().find('span');

          if ( iframe ) {
            itemDescription = $(this).find('.tox-edit-area iframe').contents().find('#tinymce').first()[0];
          }
          else {
            itemDescription = $(this).find(`th:contains('Описание')`).first().next().find('.diff').first()[0] ||
                              $(this).find(`th:contains('Описание')`).first().parent().find('.content-tabs').first()[0];
          }
        } else {
          paramsRow = $(this).find(`th:contains('Характеристики')`).first().parent();
          itemName = $(this).find(`th:contains('Название')`).first().next();

          if ( iframe ) {
            itemDescription = $(this).find('.tox-edit-area iframe').contents().find('#tinymce').first()[0];
          }
          else {
            itemDescription = $(this).find(`th:contains('Описание')`).first().parent().find('.content-tabs').first()[0];
          }
        }

        let paramsValuesArr = [];
        $(paramArr).each(function(i, e) { // seeks in rozetka params ( .last() )
          let paramName = paramsRow.find(`td:contains('${e}')`);

          $(paramName).each(function () {
            let ifDeleted = $(this).parent('tr').find(`td:contains('удален')`)[0];

            if (ifDeleted) {
              return;
            } else {
              paramName = $(this).parent('tr').find(`td:contains('${e}')`);
              return false;
            }
          });

            if(paramName.next()[0]) { //paramName.next().next().next()[0] - rozetka value || paramName.next()[0]
            
            paramName.parent('tr').addClass('astAnalyzerParamLight');


            let paramValue = paramName.next()[0].textContent.replace(/\n/gi, '').trim();

            if ( option.includes('bySpacesToo') ) {
              paramValue = paramValue.split(/[ -,:]/gi);
              $(paramValue).each(function(i, e) {
                if ( e == ' ' || e.length < 1) paramValue.splice(i, 1);
              });
            }
            else {
              paramValue = paramValue.split(/[-,:xх]/gi);
            }
            
            let newParamValue;
            if(option.includes('wrongLetters')) {
              newParamValue = paramValue.concat(astItemAnalyser_replaceCharsToWrong(paramValue));
            } else {
              newParamValue = paramValue;
            }
            
            $(newParamValue).each(function(i, e) {
              let newValue = e;
              if(option.includes('halfWord') && e.length >= 5) {
                newValue = astGetHalfString(e.trim(), 0.7);
              }
              paramsValuesArr.push(newValue.trim());
            });
          }
        });

        let elementsArr = [itemName/*, $(itemDescription)*/]; // description temporary disabled
        astItemAnalyser_highlight(elementsArr, paramsValuesArr)
      
        $(itemName).each(function(i, e) {   
          if ($(this).find('> zzzp').length <= 1) {
            $(this).parents('.table.table-bordered.table-striped.detail-view').addClass('astAnalyzerWarningLight');
            $(this).parents('.kv-expand-detail-row.info.skip-export').prev().find('[type="checkbox"]').click();
          }
        });

        // fixing first <tr> highlight
        $(this).find('table.kv-child-table > tbody > tr').removeClass('astAnalyzerParamLight');
        if ( !window.location.href.includes('items/changes') ) {
          $(this).find('table > tbody > tr.astAnalyzerParamLight').first().removeClass('astAnalyzerParamLight');
        }

      });
    }
  }
  function astItemAnalyser_highlight(elementsArr, paramsValuesArr) {

    $(elementsArr).each(function() {

      let elem1 = $(this);

      let customElemStyle = '';
      if ( $(this)[0].id == 'tinymce' ) { // for those which are iframes
        customElemStyle = ' style="background: lightgreen !important"';
      }

      $(paramsValuesArr).each(function(i, e) {
        let newE = e.replace(/[\(\)]/gmi, '');
        if ( newE.trim() == '' || newE.trim() == ' ' ) return;
        let regexp = new RegExp(newE.trim(), 'gi');

        if ( elem1.html() ) {
          elem1.html( elem1.html().replace(/<ins>|<\/ins>|<span .+?>|<\/span>/gi, ''));
          elem1.html( elem1.html().replace(regexp, `<zzzp${customElemStyle}>${newE}</zzzp>`) ); // <zzzp>trying to avoid pick tag itself(analyzer passed)
        } 
      });
    });
  }
  function astItemAnalyser_replaceCharsToWrong(arrayWords) {
    //
    let rozetkaValue = ['X', 'C', 'B', 'M', 'чер', 'тем', 'ГБ', 'ТБ', ' x '];
    let shopValue = ['Х', 'С', 'В', 'М', 'чёр', 'тём', 'GB', 'TB', 'x'];
    
    let newArrayWords = [];
    $(arrayWords).each(function(i1, param) {
      let paramVal = arrayWords[i1];
      $(rozetkaValue).each(function(i2, letter) {
        let regexp = new RegExp(letter, 'gmi');
        paramVal = paramVal.replace(regexp, shopValue[i2]);
      });
      newArrayWords.push(paramVal);
    });

    return newArrayWords;
  }


  // page actions functions -------------------------------------------------------------
  function astPaginationAutoModal(mode, timer, timerIdCallback) {

    window.astStorageObj.autoPagTimerStep = timer || window.astStorageObj.autoPagTimerStep || 500;
    window.astStorageObj.autoPagTimerId = '' || timerIdCallback;

    if ( mode && mode.includes('stop') ) {
      clearTimeout(window.astStorageObj.autoPagTimerId);
      return false;
    }

    if( !$('.modal-content .pagination')[0] ) {
      clearTimeout(window.astStorageObj.autoPagTimerId);
      return false;
    }
    
    let rows = $('.form-group.attr-values-comparison .row.form-group');
    let nextBtn = $('.modal-content li.next').children().first();
    
    if (nextBtn.parent().hasClass('disabled')) {
      clearTimeout(window.astStorageObj.autoPagTimerId);
      return false;
    }

    if ( mode && mode.includes('condition') ) {

      rows.find('select').each(function () {

        if ( $(this).select2('data')[0].text == 'Не привязан' && 
             $(this).attr('disabled') !== 'disabled') {

          mode = '';
          astPaginationAutoModal('stop');
          return false;
        }
      });
    }

    if ( mode && mode.includes('start') ) {

      if (nextBtn.parent().hasClass('disabled')) {
        astPaginationAutoModal('stop');
        return false;
      } else {
        nextBtn.click();
        window.astStorageObj.autoPagTimerId = setTimeout(() => {
          astPaginationAutoModal(mode, '', window.astStorageObj.autoPagTimerId);
        }, window.astStorageObj.autoPagTimerStep);
      }
    }
  }
  function astGetIdsString(onlyChecked, mod) {
    let idsArr = [];
    let row = $('tr.sync-sources');
    if (onlyChecked) row = $('tr.sync-sources.info');
    if (mod == 'onlyDecline') row = $('tr.sync-sources').next().find('.backround-svg-1').parents('.kv-expand-detail-row').prev();

    row.find('[data-col-seq="id"]').each(function() {
      idsArr.push($(this)[0].innerText.split(': ')[1].split('\n')[0]);
    });
    let idsString = idsArr.join(', ') + ',';
    return idsString;
  }
  function astItemsExpanded() {
    
    window.astStorageObj.astAutoItemsPaginatorItems = $('tr.sync-sources').length;
    
    $('[title="Развернуть всё"]').click();
    
    $( window ).on( "ajaxComplete", function() { 
      window.astStorageObj.astAutoItemsPaginatorItems -= 1;
    });

    let astIntervalId = setInterval(() => {
      if ( window.astStorageObj.astAutoItemsPaginatorItems < 1 ) {
      	
      	clearInterval(astIntervalId);
      	
        $( window ).trigger('astItemsExpanded');
        return true;
      }
    }, 500);
  }

  // page appearance
  function astBeautifyInit() {
    astStyle_ShowUndoneParamAmount();
    astStyle_Highlight();
  }
  function astStyle_changeDelElem(mode) {
    
    $('del').each(function () {

      if ( mode && mode.includes('delete') ) {
        $(this).remove();
      } else {
        $(this).toggleClass('astHideElem');
      }
    });
  }
  function astStyle_ShowUndoneParamAmount() {

    let table = $('.kv-grid-table.table.table-bordered.table-striped.kv-table-wrap');
    if (table.length >= 1) {
      let amount = table.find('.glyphicon.glyphicon-exclamation-sign');

      if ( !amount[0] ) return false;

      amount.each(function(i, e) {
        if($(this)[0]) {
          let nums = $(this)[0].title.match(/\d/gmi);
          if ( nums ) nums = nums.join('');
          let classHuge = '';
          if (nums > 10) classHuge = ' astUndoneAmountOk';
          if (nums > 50) classHuge = ' astUndoneAmountHuge';
          if (nums > 100) classHuge = ' astUndoneAmountReallyHuge';
          $(this).parent().append(`<span class="astUndoneAmount${classHuge}"> ${nums} </span>`);
        }
      });

    } else {
      return false;
    }
  }
  function astStyle_Highlight() {
    let opts = $('#syncsourceattributesearch-bind_status').find('option');
    opts.each(function () {
      let text = $(this)[0].innerText.toLowerCase();
      if (text.includes('не привязан') || text.includes('частично')) {
        $(this).addClass('astLight');
      }
    });
  }

  // inner service functions
  function astGetRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function astUnique(list) { // and check if values is empty

    var result = [];
    if (!$.isArray(list)) return false;
    if(list.length == 1) result = list;

    $.each(list, function(i, e) {
      if ( e == " " ) return;
      if ($.inArray(e, result) == -1) result.push(e);
    });

    return result;
  }
  function astGetNumFromStr(str) {
    if(str) {
      return str.match(/[\d\.\,]/gmi).join('').replace(',', '.');
    } else {
      return false;
    }
  }
  function astRemoveUnit(str) {
    let newStr = str.match(/[-\.\,\d]/gmi);
    if (newStr) return newStr.join('');
  }
  function astReplaceChars(str, fromChar, toChar) {
    let reg = new RegExp(fromChar, 'gi');
    let result = str.replace(reg, toChar);
    if (result) return result;
  }
  function astTrimStringsInArr(arr) {
    var result = [];
    if(arr.length == 1) {
      result = arr[0].trim().replace(/\r?\n|\r/gmi, ' ');
      return result;
    }

    $.each(arr, function(i, e) {
      result.push(e.trim());
    });

    return result;
  }

  function astChangeInputs(whichFunc, ...args) {

    if ( whichFunc && !whichFunc.includes('reset') ) {
      window.astStorageObj.divideNumSavedValues = [];
    }

    $('.row.form-group input.form-control, .row.form-group textarea.form-control').each(function(i, e) {

      $(this).addClass('astFillerChange');

      if ( whichFunc && !whichFunc.includes('reset') ) {
        window.astStorageObj.divideNumSavedValues.push( $(this)[0].value );
      }
      //------------------------
      if ( whichFunc && whichFunc.includes('takeAfter') ) {
        $(this)[0].value = astFiller_takeBetweenSeparator2($(this)[0].value);
      }
      else if( whichFunc && whichFunc.includes('removeUnit') ) {
        $(this)[0].value = astRemoveUnit($(this)[0].value);
      }
      else if( whichFunc && whichFunc.includes('replaceChar') && !whichFunc.includes('replaceCharMacros')) {
        $(this)[0].value = astReplaceChars($(this)[0].value, args[0], args[1]);
      }
      else if( whichFunc && whichFunc.includes('replaceCharMacros') ) {

        let charsCombArr = args[0].split('|'); // format of charlist "char1_char2|char3_char4|..."
        let currentInput = $(this)[0];
        
        $(charsCombArr).each(function(i, e) {
          let charFrom = e.split('_')[0];
          let charTo = e.split('_')[1];

          currentInput.value = astReplaceChars(currentInput.value, charFrom, charTo);
        });
      }
      //------------------------
      else if ( whichFunc && whichFunc.includes('reset') && window.astStorageObj.divideNumSavedValues.length > 0 ) {
        $(this)[0].value = window.astStorageObj.divideNumSavedValues[i];
        $(this).removeClass('astFillerChange');
      }
    });
    if ( whichFunc && whichFunc.includes('reset') ) {
      window.astStorageObj.divideNumSavedValues.length = 0;
    }
  }
  function astFillerDivideNum(by) {

    $('.row.form-group input.form-control').each(function(i, e) {
      
        let num = +by || 1;
        let result = +$(this)[0].value / num;
        $(this)[0].value = result.toFixed(2);
    });
  }
  function astGetHalfString(string, percent) {
    let perc = percent || 0.5;
    let halfString = string.substr(0, string.length * perc);
    return halfString;
  }
  function astLogAllEvents() {
    Object.keys(window).forEach(key => {
      if (/^on/.test(key)) {
        window.addEventListener(key.slice(2), event => {
            console.log(event);
        });
      }
    });
  }
  function astDelayFunction(delayMs, func, ...args) {
    
    let newDelayMs = delayMs || 1000;
    
    setTimeout(() => {
      func(args);
    }, newDelayMs);
  }
  function astCheckStateElemCycle(elem, ticsMs, maxTics) { // return new event ('astElemExists') if element exists
    
    let newTicsMs = ticsMs || 250;
    let newMaxTics = maxTics || 1000;
    window.astStorageObj.astCheckStateElemCycle_Count = [0, newMaxTics];
    
    let intervalId = setInterval(() => {
      if( elem ) {
        $( window ).trigger('astCheckStateElemCycle:astElemExists');
        clearInterval(intervalId);
        console.log("I've find it");
      }

      window.astStorageObj.astCheckStateElemCycle_Count[0] += 1;
      if ( window.astStorageObj.astCheckStateElemCycle_Count[0] > window.astStorageObj.astCheckStateElemCycle_Count[1]) {
        clearInterval(intervalId);
        console.log("cycle done!");
      }

    }, newTicsMs);
  }

  // UI ------------------------------------------------------------------------------------
  function astUIInit() {
    // window
    var astWindow = document.createElement('div');
    document.body.append(astWindow);
    astWindow.classList.add('astMainWindow');
    astWindow.setAttribute("id", "astMainWindowID");
    
    document.getElementById('astMainWindowID').innerHTML = `

    <div class="astWindowWrapper"> 
      <div class="astWindowStatus">
        <p>[assistant] </p>
        <p>task: <span id="astWindowStatus_taskNum"></span></p>
        <p><span id="astWindowStatus_taskDetail"></span></p>
      </div>
      <button type="button" class="astBtn astBtnDropdown btn btn-primary">&#9661;</button>
      <div class="astDropdown astUIHide">
        <button type="button" class="astBtn astBtnFillerReload btn btn-warning">загрузить [filler] повторно</button>
        <div class="astWindowSep">
          <button type="button" class="astBtn astGetIDs btn btn-primary">получить id выделенных</button>
          <button type="button" class="astBtn astGetDeniedIDsFromStorage btn btn-primary">получить id всех отклоненных по задаче</button>
          <button type="button" class="astBtn astGetDeniedIDsClear btn btn-warning">очистить localstorage</button>
          <label for="astGetIDOnlyDeclineCheckbox">только отклоненные</label>
          <input type="checkbox" name="astGetIDOnlyDeclineCheckbox" id="astGetIDOnlyDeclineCheckbox">
          <textarea id="astGetIDsTextarea" name="astGetIDsTextarea" rows="2" cols="10"></textarea>
        </div>
        <div class="astWindowSep">
          <h4>[assistant analyzer]</h4>
          <div class="astRow">
            <button type="button" class="astBtn astBtnHideDel btn btn-primary">скрыть/удалить удаленный текст</button>
            <label for="astCheckDeleteDel">удалить</label>
            <input type="checkbox" name="astCheckDeleteDel" id="astCheckDeleteDel">
          </div>
          <div class="astWindowSep">
            <i>(не запускать пока не прогрузились айтемы - кружок на кнопке расрытия)</i>
            <button type="button" class="astBtn astBtnAnalyzer btn btn-warning">проверка названия по параметрам</button>
            <label for="astAnalyzerParamsListInput">параметры через запятую:</label>
            <input type="text" id="astAnalyzerParamsListInput" placeholder="Цвет,Размер(без пробелов)">
            <label for="astAnalyzerHalfWord">часть слова</label>
            <input type="checkbox" name="astAnalyzerHalfWord" id="astAnalyzerHalfWord" checked>
            <label for="astAnalyzerWrongLetters">кирилица в размерах и пр.</label>
            <input type="checkbox" name="astAnalyzerWrongLetters" id="astAnalyzerWrongLetters" checked>
            <label for="astAnalyzerBySpacesToo">разбить значение по пробелам</label>
            <input type="checkbox" name="astAnalyzerBySpacesToo" id="astAnalyzerBySpacesToo">
          </div>
        </div>
      </div>
    </div>
    <button type="button" class="astBtn astBtnHideStatus btn btn-success">[A]</button>

    `;

    // Events UI
    $('#astItemsAmountInput').change(function() {
      localStorage.setItem('astItemsAmountPerPage', $(this)[0].value);
    });
    $('body').on('click', function(e) {
      if ( $(e.target).parents().hasClass('astMainWindow') !== true) {
        $('.astDropdown').addClass('astUIHide');
      }
    });
    $( '#astGetIDsTextarea' ).on('click', function(e) {
      e.target.select();
    });

    // filler (only in modal)
    var astFiller;
    $('#linkModal').on('shown.bs.modal', function (e) {
      $('#linkModal').ready(function () {
        setTimeout(() => {
          astUIInit_fillerUIinit();
        }, 500);
      });
    }); // when modal bootstrap popup opens

    return {
      'astWindow': astWindow,
      'astFiller': astFiller
    };
  }
  function astUIInit_fillerUIinit() {
    $('#linkModalForm .col-md-4').append(`

    <div id="astFillerID" class="astFillerID">
      <div class="astFiller">
        <h4>[assistant filler]</h4>
        <div class="astWindowSep">
          <p>осталось заполнить: <span class="astFillerLeftToFill"></span></p>
          <p>значений в списках: <span class="astFillerOptionsAmount"></span></p>
        </div>
        <button type="button" class="astBtn astBtnFillerOne btn btn-primary">одно знач. точно</button>
        <div class="astWindowSep">
          <button type="button" class="astBtn astBtnFillerMulti btn btn-warning">несколько значений</button>
          <button type="button" class="astBtn astBtnFillerMultiEachWord btn btn-warning">неск. знач. (по каждому слову/фразе)</button>
          <input type="text" id="astBtnFillerMultiEachWord_customSep" placeholder="regex" size="4">
          <label for="astBtnFillerMultiEachWord_customSep">другие разделители фраз/слов</label>
          <div class="astRow">
            <label for="astFillerMultiExactNotExact">(по каждому слову/фразе) - не точный режим</label>
            <input type="checkbox" name="astFillerMultiExactNotExact" id="astFillerMultiExactNotExact">
          </div>
          <div class="astRow">
            <label for="astFillerMultiExact">точно слово</label>
            <input type="checkbox" name="astFillerMultiExact" id="astFillerMultiExact">
          </div>
          <div class="astRow">
            <label for="astFillerBetweenSeparator">часть текста после ":"</label>
            <input type="checkbox" name="astFillerBetweenSeparator" id="astFillerBetweenSeparator">
            <label for="astFillerHalfWord">часть слова (опции)</label>
            <input type="checkbox" name="astFillerHalfWord" id="astFillerHalfWord">
          </div>
          <div class="astRow">
            <label for="astFillerOptionHalfWordInput">% от слова в списках</label>
            <input type="number" id="astFillerOptionHalfWordInput" min="1" max="100" placeholder="1-100">
          </div>
        </div>
        <button type="button" class="astBtn astInfoDropdownBtn btn btn-info"> [changing input values] </button>
        <div class="astWindowSep astInfoDropdown astUIHide">
          <h5>[changing input values]</h5>
          <button type="button" class="astBtn astBtnFillerDivide btn btn-primary">Выделить и разделить числа на:</button>
          <input type="text" id="astBtnFillerDivideInput" size="1">
          <button type="button" class="astBtn astBtnFillerRemoveUnit btn btn-primary">отбросить ед. измерения только</button>
          <button type="button" class="astBtn astBtnFillerTakeAfter btn btn-primary">взять часть после ":"</button>
          <button type="button" class="astBtn astBtnFillerReset btn btn-warning">сбросить изменения</button>
          <div class="astRow">
            <button type="button" class="astBtn astBtnFillerReplaceChar btn btn-primary">заменить все символы</button>
            <input type="text" id="astBtnFillerReplaceCharFrom" size="1">
            <span>на</span>
            <input type="text" id="astBtnFillerReplaceCharTo" size="1">
          </div>
          <div class="astRow">
            <button type="button" class="astBtn astBtnFillerReplaceCharMacros btn btn-primary">заменить все символы (последовательно)</button>
            <input type="text" id="astFillerReplaceCharMacrosInput" placeholder="мг_кг|ГБ_ТБ" list="ReplaceCharMacrosInputStorage">
            <button type="button" class="astBtn astBtnFillerReplaceCharMacrosSave btn btn-success">сохранить</button>
            <button type="button" class="astBtn astInfoDropdownBtn btn btn-info"> ? </button>
            <div class="astInfoDropdown astUIHide">
              <label for="astFillerReplaceCharMacrosInput">символ1_символ2|символ1_символ2|...</label>
              <label for="astFillerReplaceCharMacrosInput">(выражения между разделителями (_ и |) работают как regexp)</label>
              <label for="astFillerReplaceCharMacrosInput">спец символы +?$ и т.п. экранируются '\\'</label>
            </div>
          </div>
        </div>
        <div class="astWindowSep">
          <h5>[other features]</h5>
          <button type="button" class="astBtn astBtnAutopaginationStart btn btn-success">start autopagination</button>
          <input type="number" id="astBtnAutopaginationTimerStep" placeholder="мсек">
          <button type="button" class="astBtn astBtnAutopaginationStop btn btn-danger">stop</button>
          <div class="astRow">
            <label for="astAutopaginationCheckCondition">стоп если есть непривязанные</label>
            <input type="checkbox" name="astAutopaginationCheckCondition" id="astAutopaginationCheckCondition" checked>
          </div>
        </div>
      </div>
    </div>

    `);

    $('#astFillerOptionHalfWordInput').change(function() {
      localStorage.setItem('astFillerOptionHalfWordInput', $(this)[0].value / 100);
    });

    astFiller_DatalistReplaceCharMacros_Init();
  }
  
  function astFiller_DatalistReplaceCharMacros_Init(mode, macrosStr, macrosName) { // syntaxis macrosName@@macrosStr...

    if ( !mode ) {
      $('#astFillerReplaceCharMacrosInput').append('<datalist id="ReplaceCharMacrosInputStorage"></datalist>');
    }
    if ( mode && mode.includes('save') ) {
      let prevList = '' || localStorage.getItem('astCharMacrosStorageDatalistOptions'); // <option value="Boston">
      let newOption = `<option value="${macrosStr}" data-name="${macrosName}">`;
      localStorage.setItem('astCharMacrosStorageDatalistOptions', prevList + newOption);
    }

    let macrosOptionsList = '' || localStorage.getItem('astCharMacrosStorageDatalistOptions');
    $('#ReplaceCharMacrosInputStorage').append(macrosOptionsList);

  }

  function astSaveDeniedIDsInit(mode, taskNumber) { // saves and gets string of denied ids
    let activateBtn = $('button[value="to_activate"]')[0] || $('button[value="accept_changes"]')[0];
    let deniedTopBtn = $('button[value="discard_changes"]')[0];

    if ( !mode && activateBtn ) $(activateBtn).on('click', function() {
      let taskNum = $('#astWindowStatus_taskNum')[0].textContent;
      let deniedIDsString = astGetIdsString(false, 'onlyDecline');
      let prevDeniedIDsStr = '' || localStorage.getItem(`astDeniedIDsStr${taskNum}`);

      prevDeniedIDsStr += deniedIDsString;
      localStorage.setItem(`astDeniedIDsStr${taskNum}`, prevDeniedIDsStr.replace('null', ''));
    });

    if ( !mode && deniedTopBtn ) $(deniedTopBtn).on('click', function() {
      let taskNum = $('#astWindowStatus_taskNum')[0].textContent;
      let deniedIDsString = astGetIdsString(1);
      let prevDeniedIDsStr = '' || localStorage.getItem(`astDeniedIDsStr${taskNum}`);

      prevDeniedIDsStr += deniedIDsString;
      localStorage.setItem(`astDeniedIDsStr${taskNum}`, prevDeniedIDsStr.replace('null', ''));
    });

    if ( mode && mode.includes('get') ) {
      let taskNum = $('#astWindowStatus_taskNum')[0].textContent;
      return localStorage.getItem(`astDeniedIDsStr${taskNum}`).match(/\d+,/gi).join(' ');
    }

    if ( mode && mode.includes('clearStorage') ) {
      for(let key in localStorage) {
        if ( key.includes('astDeniedIDsStr') ) {
          localStorage.removeItem(key);
        }
      }
    }
  }
 // saves task number from last opened task page and set its number to status window
  function astUI_TaskNumRefresh() {

    $( '#head-section' ).on( 'load', function(e) {
        console.dir(e);
        console.dir('loaded');
    } );

    if( window.location.href.includes('request/view') ) {

      let taskNum = $( '#input-52' )[0].value;
      let taskTitle = $( '#input-93' )[0].value;
      let taskType = $( '#input-97' )[0].value;
      let taskItemsAmount = $( '#input-72' )[0].value;

      // --- for old version of splitter "Lisa"
      if ( window.location.href.includes('splitter.staging.com.ua') ) {
        let taskNum = $('[name="Request[id]"]')[0].textContent;
        let taskTitle = $('#select2-w4-container')[0].title;
        let taskType = $('[name="Request[type_id]"]')[0].textContent;
        let taskItemsAmount = $('[name="Request[amount_to_work]"]')[0].value;
      }
      // ---

      if(taskNum) {
        localStorage.setItem('astTaskNum', taskNum);
        localStorage.setItem('astTaskTitle', taskTitle);
        localStorage.setItem('astTaskType', taskType.split(' ')[0]);
        localStorage.setItem('astTaskItemsAmount', taskItemsAmount);
      }
      let uiNum = $('#astWindowStatus_taskNum');
      let uiDet = $('#astWindowStatus_taskDetail');
      uiNum[0].textContent = localStorage.getItem('astTaskNum');
      uiDet[0].textContent = localStorage.getItem('astTaskTitle') + ' | ' + localStorage.getItem('astTaskType');

      astUI_taskTableRefresh({
        taskDateStart: 'later',
        taskNum: localStorage.getItem('astTaskNum'),
        taskItemsAmount: localStorage.getItem('astTaskItemsAmount'),
        taskType: localStorage.getItem('astTaskType')
      });
    }

    if(!window.location.href.includes('request/view')) {
      if (localStorage.getItem('astTaskNum')) {
        let uiNum = $('#astWindowStatus_taskNum');
        let uiDet = $('#astWindowStatus_taskDetail');
        uiNum[0].textContent = localStorage.getItem('astTaskNum');
        uiDet[0].textContent = localStorage.getItem('astTaskTitle') + ' | ' + localStorage.getItem('astTaskType');
      } else {
        let uiNum = $('#astWindowStatus_taskNum');
        let uiDet = $('#astWindowStatus_taskDetail');
        uiNum[0].textContent = `¯\\\_(ツ)_/¯`;
        uiDet[0].textContent = `¯\\\_(ツ)_/¯`;
      }
    }

    document.addEventListener("visibilitychange", function() {
      astUI_TaskNumRefresh();
    });

    window.onstorage = event => {
      if(!window.location.href.includes('request/view')) {
        let uiNum = $('#astWindowStatus_taskNum');
        let uiDet = $('#astWindowStatus_taskDetail');
        uiNum[0].textContent = localStorage.getItem('astTaskNum');
        uiDet[0].textContent = localStorage.getItem('astTaskTitle') + ' ' + localStorage.getItem('astTaskType');
      }
    };
  }
 
  function astUI_taskTableRefresh(dataObj) { // only for my other excel table
    let lastBtn = $('button[data-target="#complete-modal-9"]')[0] 
                  || $('a.btn.btn-default.margin-right-button[title]').last()[0]
                  || $('button[title="Выполнена"]')[0];
    let taskType = dataObj.taskType.toLowerCase();

    (taskType.includes('перен') || taskType.includes('проверка') || taskType.includes('изменение')) ? taskType = 'change' : taskType = '';

    if ( !$('#astTableTaskDetail')[0] ) $(lastBtn).after(`
    <table id="astTableTaskDetail" class="table">
      <tbody>
        <tr>
          <!--<td id="astTableTaskDateStart">${dataObj.taskDateStart}</td>
          <td></td>-->
          <td id="astTableTaskNum">${dataObj.taskNum}</td>
          <td id="astTableTaskItemsAmount">${dataObj.taskItemsAmount}</td>
          <td></td>
          <td id="astTableTaskType"></td>
          <td id="astTableTaskType">${taskType}</td>
        </tr>
        <tr>
          <td style="display: none"> </td>
        </tr>
      </tbody>
    </table>
    `);
  }

  function astShowMessage( content, durationMs, bootstrapAlertStyle ) { // see https://getbootstrap.com/docs/4.0/components/alerts/

    let newContent = content || 'пустое сообщение';
    let newStyle = bootstrapAlertStyle || 'alert-success';
  
    $( 'body' ).append(`
  
    <div class="alert ${newStyle} astMsg" role="alert">
      [A] ${newContent}
    </div>
  
    `);
  
    if ( durationMs ) {
  
      setTimeout( () => {
        $('.astMsg').addClass('astMsgHidden');
      }, durationMs );
  
    }
  }

  function astUI_leftToFillRefresh(mode, startUndoneAmount) {

    window.astStorageObj.startUndoneAmount = startUndoneAmount;
    window.astStorageObj.undoneAmountTemp = 0;
    if ( mode && mode == 'init' ) $('#bindingValuesPage').on('DOMSubtreeModified', function(){

      $('#bindingValuesPage').find('select').each(function () {

        if ( $(this).select2('data')[0].text == 'Не привязан' && $(this).attr('disabled') !== 'disabled') {
          if ( !$(this).hasClass('astUndoneElem') ) $(this).addClass('astUndoneElem');
        }
        else {
          $(this).removeClass('astUndoneElem');
        }
      });

      let currentUndone = $(this).find('.astUndoneElem').length;
      if ( currentUndone >  window.astStorageObj.undoneAmountTemp ) {
        window.astStorageObj.undoneAmountTemp = currentUndone;
      }
      else if ( currentUndone <  window.astStorageObj.undoneAmountTemp ) {
        window.astStorageObj.startUndoneAmount -= ( window.astStorageObj.undoneAmountTemp -  currentUndone );
        window.astStorageObj.undoneAmountTemp = currentUndone;
      }

    });
  }

  function astHotkeyInit() {
    document.addEventListener('keydown', function(event) {

      if (event.key == '>' || event.key == 'Ю') {
        
        let nextPageBtn = $('.pagination .next a');
        if (nextPageBtn[0]) nextPageBtn[0].click();
      }
    });
  }

  // Storage and options
  function astStorageAndOptionsInit() {

    // each day welcome message
    let date = new Date();
    let todayDate = date.getDate() + ' ' +  (+date.getMonth() + 1);
    if ( localStorage.getItem('astTodayDate') !== todayDate) {
      localStorage.setItem('astTodayDate', todayDate);
      astShowMessage( 'welcome aboard', 5000 );
    }
  }
})();