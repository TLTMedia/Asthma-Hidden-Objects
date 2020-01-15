 var audiotypes={
        "mp3": "audio/mpeg",
        "mp4": "audio/mp4",
        "ogg": "audio/ogg",
        "wav": "audio/wav"
    }

    var soundEffect=$('<audio/>',{"id":"soundEffect"})
  var source_element = document.createElement('source')

      var audio_element = soundEffect[0];
  audio_element.appendChild(source_element)
    function ss_soundbits(sound){


        if (audio_element.canPlayType){
            for (var i=0; i<arguments.length; i++){
                source_element.setAttribute('src', arguments[i])
                if (arguments[i].match(/\.(\w+)$/i))
                    source_element.setAttribute('type', audiotypes[RegExp.$1])

            }
            audio_element.load()
            audio_element.playclip=function(){
                audio_element.pause()
                audio_element.currentTime=0
                audio_element.play()
            }
            return audio_element
        }
    }
