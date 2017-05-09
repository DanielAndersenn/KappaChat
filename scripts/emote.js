/*
.js class to hold functionality for emotes
*/

var emotes = (function () {

  // Global varibale to hold .json object
  var json;

  // Data structure
  /*
  meta {...} // When was the json-object generated
  template {small
            medium
            large} // From which links can I get the emotes
  emotes {Emote_keyword {
                        description,
                        image_id,
                        first_seen
                        } // Specific emote
         } // All the emotes
  */

  // Defines the URL from which the emotes are fetched
  var emoteUrl = " https://twitchemotes.com/api_cache/v2/global.json";

  // Define method to get JSON object from url
  var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };

    xhr.send();
  };

  // Call method to fetch JSON object
  getJSON(emoteUrl, function(err, data) {

    if (err != null) { // if an error occured...
      alert('Something went wrong: ' + err);
      console.log("getJSON unsuccesful");
    } else {
      json = data;

      console.log("getJSON succesful");
    }
  });

    return {
      // Method to control whether a word is a emote keyword
        emoteControl: function(word) {

          var jsonObj;

          // Controls whether the json object is downloaded
          if (json == undefined)
            return -1;

          // if word exists as keyword in jsonEmotes...
            if ((jsonObj = json.emotes[word]) != undefined) {
              console.log("Emote found in message: " + word);

              return json.emotes[word].image_id; // return emote id
            } else {
              return -1; // If no emote was matched return -1
            }
        } // emoteControl end

      // Method to return emote_url
      , emoteReturn: function(emote_id) {
          var link = json.template.small; // Fetch the link for small pictures
          var emoteLink = link.replace("{image_id}", emote_id); // insert emote id
          return emoteLink;
        } // emoteReturn end

        // TODO MOVE THIS - returns random color code
      , randomColor: function() {
          return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
      };
  }());
