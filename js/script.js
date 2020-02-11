
var house=new House();

//function "skip()" can be entered in the console to remove all Targets into their cubbies.//
//The final textbox will remain open and not proceed to next room until closed.//

function skip()

{

for(i of house.Room.targets)
{
$(i.targetSelector).trigger("click")
}


}
