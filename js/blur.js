class Blur {

constructor(){

}
injectFilter(){

  var filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", "blurMe");
  var gaussianFilter =
    document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
  gaussianFilter.setAttribute("in", "SourceGraphic");
  gaussianFilter.setAttribute("stdDeviation", "2");
  filter.appendChild(gaussianFilter);
  $('svg').prepend(filter)


}


removeHighlightCopy() {
  // FOR EVERY OBJECT WITH AN ID THAT CONTAINS THE WORD "COPY", REMOVE THE
  // OBJECT

 $("[id$='BlurCopy']").remove();
}

highlightComponent(id) {
console.log(id)
 var origPart = $(id);

 var clonePart = $(id).clone();
  var lastPart = clonePart;
 clonePart.attr("pointer-events", "none");
 clonePart.toggleClass("highlightPart");
 clonePart.attr("id", id.replace("#", "") + "BlurCopy");

 clonePart.attr("filter", "url(#blurMe)");
 clonePart.attr("transform", $(id).attr("transform"));
 clonePart.children().attr("fill", "rgb(255,0,0)");
 clonePart.insertBefore($(id));
  return clonePart;
}
}
