/**************************************************************************************
The MIT License (MIT)

Copyright (c) 2016 snoofy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
**************************************************************************************/

// Version 0.4.1

iLng = {
  _defaultLanguage: "en",
  _currentLanguage: "",
  _undefinedMessage: "undefined",
  _translations: {},

  /****************************************
    Params:
      translations is a JSON object with this Structure
        {
          "en": {
            "foo": "english translation of foo",
            "bar": "english translation of bar",
            "bla": {
              "foo": "foo bla",
              "bar": "bar bla",
            }
          }
          "de": {
            ...
          }
        }
      defaultLanguage is a string like "en" or "de". The default Language defines the fallback language 
        if there is no translation for a given path in the current language.
   ****************************************/
  init: function(translations, defaultLanguage) {
    this._defaultLanguage = defaultLanguage;
    this._translationsOrigin = translations;
    this.concatArrayToString = true;

    var trans = {};
    var transSub = function(prev, obj) {
      var nextPrev;
      for (var i in obj) {
        nextPrev = prev+'.'+i;
        if (prev == "") {
          nextPrev = ""+i;
        }
        if ((typeof obj[i] === "object") && (!Array.isArray(obj[i])) && (!obj[i].iLngDoNotParse)) {
          transSub(nextPrev, obj[i]);
        } else {
          trans[nextPrev] = obj[i];
        }
      }
    };
    transSub("", translations);
    this._translations = trans;
  },

  /****************************************
    Set the Language you like to use for translations
   ****************************************/
  setLanguage: function(lng) {
    if (typeof jQuery !== 'undefined') {
      jQuery('body').removeClass("lng-"+this._currentLanguage);
    }
    
    this._currentLanguage = lng;
    
    if (typeof jQuery !== 'undefined') {
      jQuery('body').addClass("lng-"+this._currentLanguage);
    }
  },

  /****************************************
    Set the Message that have to be shown if there is no translation for the given path
   ****************************************/
  setUndefinedMessage: function(message) {
    this._undefinedMessage = message;
  },

  /****************************************
    Is returning the currently used language. If the currentLanguage has no translations it returns the defaultLanguage. 
    If the defaultLanguage also have no translations it returns false.
   ****************************************/
  getUsedLanguage: function() {
    if (this._currentLanguage !== "" &&
        typeof this._translationsOrigin[this._currentLanguage] !== 'undefined') {
      return this._currentLanguage;
    } else {
      if (typeof this._translationsOrigin[this._defaultLanguage] !== 'undefined') {
        return this._defaultLanguage;
      }
    }
    return false;
  },

  /****************************************
    You can change the requested path by rewriting this function.
   ****************************************/
  preProcess: function(path) { return path; },

  /****************************************
    You can change the translation by rewriting this function.
    E.g. if you have placeholders like {{replaceme}} in your translations.
   ****************************************/
  postProcess: function(translation, path, originPath) { return translation; },

  /****************************************
    Helps you to find out if there is a translation for the given path
    Set defaultAlowed to true if make no difference between the currentLanguage and in the defaultLanguage for this request
   ****************************************/
  hasTranslation: function(path, defaultAlowed) {
    path = this.preProcess(path);
    if (typeof this._translations[this._currentLanguage+'.'+path] !== 'undefined') {
      return true;
    } else if (defaultAlowed === true && 
               typeof this._translations[this._defaultLanguage+'.'+path] !== 'undefined') {
      return true;
    }
    return false;
  },

  /****************************************
    returns the translation of the given path
   ****************************************/
  t: function(path) {
    var originPath = path;
    path = this.preProcess(path);
    var node;
    if (typeof this._translations[this._currentLanguage+'.'+path] !== 'undefined') {
      node = this.postProcess(this._translations[this._currentLanguage+'.'+path], path, originPath);
    } else if (typeof this._translations[this._defaultLanguage+'.'+path] !== 'undefined') {
      node = this.postProcess(this._translations[this._defaultLanguage+'.'+path], path, originPath);
    } else if (this._undefinedMessage) {
      return this.postProcess(this._undefinedMessage, path, originPath);
    } else {
      return path;
    }

    if ((this.concatArrayToString) && (typeof node === 'object') && (Array.isArray(node))) {
      var result = '';
      for (var i in node) {
        result += node[i];
      }
      return result;
    } 

    return node;    
  }
};
